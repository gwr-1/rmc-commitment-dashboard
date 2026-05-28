import { useState } from 'react'
import {
  assetClasses,
  coInvestmentStatusOptions,
  commitmentTypes,
  fieldLabels,
  fiscalYears,
  fundStatusOptions,
  managerTypes,
  statusOptions,
} from '../constants'
import { isSupabaseConfigured, supabase } from '../lib/supabaseClient'
import { formatChangeValue, formatMillions, toMillions } from '../utils/calculations'
import {
  commitmentFieldColumns,
  commitmentSelectColumns,
  mapCommitmentToSupabase,
  mapSupabaseCommitment,
} from '../utils/commitmentMapping'

function CommitmentInput({
  commitmentData,
  setCommitmentData,
  appendChange,
  persistEditsToSupabase,
}) {
  const [filters, setFilters] = useState({
    fiscalYear: 'All',
    assetClass: 'All',
    status: 'All',
  })
  const [searchTerm, setSearchTerm] = useState('')
  const filterStatusOptions = Array.from(
    new Set([...statusOptions, ...commitmentData.map((commitment) => commitment.status).filter(Boolean)])
  )

  const getValidStatusOptions = (commitmentType) =>
    commitmentType === 'Co-Investment' ? coInvestmentStatusOptions : fundStatusOptions

  const getStatusOptions = (commitment) => {
    const validOptions = getValidStatusOptions(commitment.commitmentType)
    if (!commitment.status || validOptions.includes(commitment.status)) return validOptions
    return [commitment.status, ...validOptions]
  }

  const filteredCommitments = commitmentData.filter((commitment) => {
    const matchesFiscalYear =
      filters.fiscalYear === 'All' || commitment.fiscalYear === filters.fiscalYear
    const matchesAssetClass =
      filters.assetClass === 'All' || commitment.assetClass === filters.assetClass
    const matchesStatus = filters.status === 'All' || commitment.status === filters.status
    const normalizedSearch = searchTerm.trim().toLowerCase()
    const matchesSearch =
      normalizedSearch.length === 0 ||
      commitment.manager.toLowerCase().includes(normalizedSearch) ||
      commitment.investmentName.toLowerCase().includes(normalizedSearch)

    return matchesFiscalYear && matchesAssetClass && matchesStatus && matchesSearch
  })

  const updateFilter = (field, value) => {
    setFilters((currentFilters) => ({
      ...currentFilters,
      [field]: value,
    }))
  }

  const persistCommitmentEdit = async (originalCommitment, updatedCommitment, field, nextValue) => {
    const supabaseColumn = commitmentFieldColumns[field]
    if (!persistEditsToSupabase || !isSupabaseConfigured || !supabaseColumn) return
    if (String(originalCommitment.id).startsWith('CMT-DRAFT-')) return

    const oldValue = formatChangeValue(field, originalCommitment[field])
    const newValue = formatChangeValue(field, nextValue)
    try {
      const { error: updateError } = await supabase
        .from('commitments')
        .update({
          [supabaseColumn]: nextValue,
          updated_at: new Date().toISOString(),
        })
        .eq('id', originalCommitment.id)

      if (updateError) {
        console.error('Failed to update commitment in Supabase:', updateError)
        return
      }

      const { error: changeError } = await supabase.from('commitment_changes').insert({
        commitment_id: originalCommitment.id,
        change_type: 'Edited',
        field_changed: fieldLabels[field],
        old_value: oldValue,
        new_value: newValue,
        changed_by: 'Investment Team',
        asset_class: updatedCommitment.assetClass,
        fiscal_year: updatedCommitment.fiscalYear,
        manager_name: updatedCommitment.manager,
        investment_name: updatedCommitment.investmentName,
      })

      if (changeError) {
        console.error('Failed to insert commitment change in Supabase:', changeError)
      }
    } catch (error) {
      console.error('Failed to persist commitment edit to Supabase:', error)
    }
  }

  const updateCommitment = (id, field, value) => {
    const originalCommitment = commitmentData.find((commitment) => commitment.id === id)
    if (!originalCommitment) return

    const nextValue =
      field === 'targetAmount'
        ? Math.max(Number.isNaN(Number(value)) ? 0 : Number(value), 0)
        : value

    if (originalCommitment[field] === nextValue) return

    const updatedCommitment = {
      ...originalCommitment,
      [field]: nextValue,
    }
    const changeEntries = [
      {
        field,
        oldValue: originalCommitment[field],
        newValue: nextValue,
      },
    ]

    if (field === 'commitmentType') {
      const validStatusOptions = getValidStatusOptions(nextValue)
      if (!validStatusOptions.includes(updatedCommitment.status)) {
        updatedCommitment.status = validStatusOptions[0]
        changeEntries.push({
          field: 'status',
          oldValue: originalCommitment.status,
          newValue: updatedCommitment.status,
        })
      }
    }

    setCommitmentData((currentCommitments) =>
      currentCommitments.map((commitment) => {
        if (commitment.id !== id) return commitment
        return updatedCommitment
      })
    )

    changeEntries.forEach((change) => {
      appendChange({
        assetClass: updatedCommitment.assetClass,
        fiscalYear: updatedCommitment.fiscalYear,
        manager: updatedCommitment.manager,
        investmentName: updatedCommitment.investmentName,
        changeType: 'Edited',
        fieldChanged: fieldLabels[change.field],
        oldValue: formatChangeValue(change.field, change.oldValue),
        newValue: formatChangeValue(change.field, change.newValue),
      })

      persistCommitmentEdit(
        originalCommitment,
        updatedCommitment,
        change.field,
        change.newValue
      )
    })
  }

  const appendAddedChange = (commitment) => {
    appendChange({
      assetClass: commitment.assetClass,
      fiscalYear: commitment.fiscalYear,
      manager: commitment.manager,
      investmentName: commitment.investmentName,
      changeType: 'Added',
      fieldChanged: 'Commitment',
      oldValue: '-',
      newValue: `${formatMillions(commitment.targetAmount)} target added`,
    })
  }

  const persistAddedCommitment = async (commitment) => {
    if (!persistEditsToSupabase || !isSupabaseConfigured) return null

    try {
      const { data, error } = await supabase
        .from('commitments')
        .insert(mapCommitmentToSupabase(commitment))
        .select(commitmentSelectColumns)
        .single()

      if (error) {
        console.error('Failed to insert commitment in Supabase:', error)
        return null
      }

      const insertedCommitment = mapSupabaseCommitment(data)
      const { error: changeError } = await supabase.from('commitment_changes').insert({
        commitment_id: insertedCommitment.id,
        change_type: 'Added',
        field_changed: null,
        old_value: null,
        new_value: 'Created',
        changed_by: 'Investment Team',
        asset_class: insertedCommitment.assetClass,
        fiscal_year: insertedCommitment.fiscalYear,
        manager_name: insertedCommitment.manager,
        investment_name: insertedCommitment.investmentName,
      })

      if (changeError) {
        console.error('Failed to insert commitment add change in Supabase:', changeError)
      }

      return insertedCommitment
    } catch (error) {
      console.error('Failed to persist new commitment to Supabase:', error)
      return null
    }
  }

  const addCommitment = async () => {
    const nextIdNumber = commitmentData.length + 1
    const defaultAssetClass = filters.assetClass === 'All' ? 'RE' : filters.assetClass
    const defaultFiscalYear = filters.fiscalYear === 'All' ? 'FY26' : filters.fiscalYear
    const defaultStatus =
      filters.status !== 'All' && fundStatusOptions.includes(filters.status)
        ? filters.status
        : fundStatusOptions[0]

    const newCommitment = {
      id: `CMT-DRAFT-${nextIdNumber}`,
      managerType: 'New',
      fiscalYear: defaultFiscalYear,
      assetClass: defaultAssetClass,
      manager: 'New Manager',
      investmentName: `${defaultAssetClass} Commitment`,
      commitmentType: 'Fund',
      targetAmount: 0,
      status: defaultStatus,
      submissionStatus: 'Not Submitted',
      expectedQuarter: 'Q1',
      notes: 'New commitment entry.',
    }

    if (persistEditsToSupabase && isSupabaseConfigured) {
      const insertedCommitment = await persistAddedCommitment(newCommitment)
      if (!insertedCommitment) return

      setCommitmentData((currentCommitments) => [insertedCommitment, ...currentCommitments])
      appendAddedChange(insertedCommitment)
      return
    }

    setCommitmentData((currentCommitments) => [newCommitment, ...currentCommitments])
    appendAddedChange(newCommitment)
  }

  const deleteCommitment = (id) => {
    const deletedCommitment = commitmentData.find((commitment) => commitment.id === id)
    if (!deletedCommitment) return

    setCommitmentData((currentCommitments) =>
      currentCommitments.filter((commitment) => commitment.id !== id)
    )

    appendChange({
      assetClass: deletedCommitment.assetClass,
      fiscalYear: deletedCommitment.fiscalYear,
      manager: deletedCommitment.manager,
      investmentName: deletedCommitment.investmentName,
      changeType: 'Deleted',
      fieldChanged: 'Commitment',
      oldValue: `${formatMillions(deletedCommitment.targetAmount)} target`,
      newValue: 'Deleted',
    })
  }

  return (
    <section className="view-panel">
      <div className="view-header-row">
        <div>
          <h2>Commitment Input</h2>
        </div>

        <button type="button" className="primary-action-button" onClick={addCommitment}>
          Add Commitment
        </button>
      </div>

      <div className="input-controls-panel">
        <label className="filter-control">
          <span>Fiscal Year</span>
          <select
            value={filters.fiscalYear}
            onChange={(event) => updateFilter('fiscalYear', event.target.value)}
          >
            <option value="All">All</option>
            {fiscalYears.map((fiscalYear) => (
              <option key={fiscalYear} value={fiscalYear}>
                {fiscalYear}
              </option>
            ))}
          </select>
        </label>

        <label className="filter-control">
          <span>Asset Class</span>
          <select
            value={filters.assetClass}
            onChange={(event) => updateFilter('assetClass', event.target.value)}
          >
            <option value="All">All</option>
            {assetClasses.map((assetClass) => (
              <option key={assetClass} value={assetClass}>
                {assetClass}
              </option>
            ))}
          </select>
        </label>

        <label className="filter-control">
          <span>Status</span>
          <select
            value={filters.status}
            onChange={(event) => updateFilter('status', event.target.value)}
          >
            <option value="All">All</option>
            {filterStatusOptions.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </label>

        <label className="filter-control search-control">
          <span>Search</span>
          <input
            type="search"
            value={searchTerm}
            placeholder="Manager or Investment"
            onChange={(event) => setSearchTerm(event.target.value)}
          />
        </label>
      </div>

      <div className="commitment-input-panel">
        <div className="input-table-meta">
          <span>{filteredCommitments.length} visible commitments</span>
          <span>{formatMillions(filteredCommitments.reduce((total, row) => total + row.targetAmount, 0))} visible target</span>
        </div>

        <div className="commitment-table-wrap">
          <table className="commitment-table input-commitments-table">
            <thead>
              <tr>
                <th>Manager Type</th>
                <th>Manager</th>
                <th>Commitment Type</th>
                <th>Investment</th>
                <th>Target ($mm)</th>
                <th>Status</th>
                <th>Fiscal Year</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCommitments.map((commitment) => (
                <tr key={commitment.id}>
                  <td>
                    <select
                      value={commitment.managerType}
                      onChange={(event) =>
                        updateCommitment(commitment.id, 'managerType', event.target.value)
                      }
                    >
                      {managerTypes.map((managerType) => (
                        <option key={managerType} value={managerType}>
                          {managerType}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <input
                      type="text"
                      value={commitment.manager}
                      onChange={(event) =>
                        updateCommitment(commitment.id, 'manager', event.target.value)
                      }
                    />
                  </td>
                  <td>
                    <select
                      value={commitment.commitmentType}
                      onChange={(event) =>
                        updateCommitment(commitment.id, 'commitmentType', event.target.value)
                      }
                    >
                      {commitmentTypes.map((commitmentType) => (
                        <option key={commitmentType} value={commitmentType}>
                          {commitmentType}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <input
                      type="text"
                      value={commitment.investmentName}
                      onChange={(event) =>
                        updateCommitment(commitment.id, 'investmentName', event.target.value)
                      }
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={toMillions(commitment.targetAmount)}
                      onChange={(event) =>
                        updateCommitment(commitment.id, 'targetAmount', event.target.value)
                      }
                    />
                  </td>
                  <td>
                    <select
                      value={commitment.status}
                      onChange={(event) =>
                        updateCommitment(commitment.id, 'status', event.target.value)
                      }
                    >
                      {getStatusOptions(commitment).map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <select
                      value={commitment.fiscalYear}
                      onChange={(event) =>
                        updateCommitment(commitment.id, 'fiscalYear', event.target.value)
                      }
                    >
                      {fiscalYears.map((fiscalYear) => (
                        <option key={fiscalYear} value={fiscalYear}>
                          {fiscalYear}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <button
                      type="button"
                      className="danger-action-button"
                      onClick={() => deleteCommitment(commitment.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredCommitments.length === 0 && (
          <div className="empty-table-state">
            No commitments match the selected filters.
          </div>
        )}
      </div>
    </section>
  )
}

export default CommitmentInput
