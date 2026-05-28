import { useState } from 'react'
import { assetClasses, changeTypes, fiscalYears } from '../constants'

function ChangeLog({ changeLogRecords }) {
  const [filters, setFilters] = useState({
    assetClass: 'All',
    fiscalYear: 'All',
    changeType: 'All',
  })
  const [searchTerm, setSearchTerm] = useState('')

  const filteredChanges = changeLogRecords.filter((change) => {
    const matchesAssetClass =
      filters.assetClass === 'All' || change.assetClass === filters.assetClass
    const matchesFiscalYear =
      filters.fiscalYear === 'All' || change.fiscalYear === filters.fiscalYear
    const matchesChangeType =
      filters.changeType === 'All' || change.changeType === filters.changeType
    const normalizedSearch = searchTerm.trim().toLowerCase()
    const manager = change.manager || ''
    const investmentName = change.investmentName || ''
    const matchesSearch =
      normalizedSearch.length === 0 ||
      manager.toLowerCase().includes(normalizedSearch) ||
      investmentName.toLowerCase().includes(normalizedSearch)

    return matchesAssetClass && matchesFiscalYear && matchesChangeType && matchesSearch
  })

  const updateFilter = (field, value) => {
    setFilters((currentFilters) => ({
      ...currentFilters,
      [field]: value,
    }))
  }

  return (
    <section className="view-panel">
      <div className="view-header-row">
        <div>
          <h2>Change Log</h2>
        </div>
      </div>

      <div className="input-controls-panel">
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
          <span>Change Type</span>
          <select
            value={filters.changeType}
            onChange={(event) => updateFilter('changeType', event.target.value)}
          >
            <option value="All">All</option>
            {changeTypes.map((changeType) => (
              <option key={changeType} value={changeType}>
                {changeType}
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
          <span>{filteredChanges.length} visible changes</span>
          <span>{changeLogRecords.length} total records</span>
        </div>

        <div className="commitment-table-wrap">
          <table className="commitment-table change-log-table">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Asset Class</th>
                <th>Manager</th>
                <th>Investment</th>
                <th>Change Type</th>
                <th>Field Changed</th>
                <th>Old Value</th>
                <th>New Value</th>
                <th>Changed By</th>
              </tr>
            </thead>
            <tbody>
              {filteredChanges.map((change) => (
                <tr key={change.id}>
                  <td>{change.timestamp}</td>
                  <td>{change.assetClass}</td>
                  <td>{change.manager}</td>
                  <td>{change.investmentName}</td>
                  <td>
                    <span
                      className={`change-type-pill change-${change.changeType.toLowerCase()}`}
                    >
                      {change.changeType}
                    </span>
                  </td>
                  <td>{change.fieldChanged}</td>
                  <td>{change.oldValue}</td>
                  <td>{change.newValue}</td>
                  <td>{change.changedBy}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredChanges.length === 0 && (
          <div className="empty-table-state">
            No change log records match the selected filters.
          </div>
        )}
      </div>
    </section>
  )
}

export default ChangeLog
