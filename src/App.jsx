import { useState } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { portfolioMetrics } from './data/portfolioMetrics'
import { commitments } from './data/commitments'
import { changeLog } from './data/changes'
import './App.css'

const views = [
  { key: 'overview', label: 'Portfolio Overview' },
  { key: 'asset-class', label: 'Asset Class Detail' },
  { key: 'commitment-input', label: 'Commitment Input' },
  { key: 'change-log', label: 'Change Log' },
]

const assetClasses = ['PE', 'VC', 'NR', 'RE', 'NMA']
const fiscalYears = ['FY26', 'FY27', 'FY28']
const commitmentTypes = ['Fund', 'Co-Investment']
const managerTypes = ['Current', 'New']
const statusOptions = ['Closed', 'Pipeline', 'Under Review', 'Delayed', 'Removed']
const changeTypes = ['Added', 'Edited', 'Deleted']
const assetClassNames = {
  PE: 'Private Equity',
  VC: 'Venture Capital',
  NR: 'Natural Resources',
  RE: 'Real Estate',
  NMA: 'Non-Marketable Alternatives',
}

const fieldLabels = {
  managerType: 'Current/New Mgr.',
  manager: 'Mgr. Name',
  commitmentType: 'Fund/Co-Investment',
  investmentName: 'Investment Name',
  targetAmount: 'Target ($mm)',
  status: 'Status',
  fiscalYear: 'Fiscal Year (Actual/Expected)',
}

const formatMillions = (amount) => `$${(amount / 1000000).toFixed(0)}M`
const toMillions = (amount) => amount / 1000000
const changedByUser = 'Prototype User'

const getInitialCommitments = () =>
  commitments.map((commitment) => ({
    ...commitment,
    managerType: commitment.managerType || 'Current',
  }))

const formatTimestamp = (date) =>
  date
    .toLocaleString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
    .replace(',', '')

const formatChangeValue = (field, value) => {
  if (field === 'targetAmount') return formatMillions(value)
  return String(value || '-')
}

function PortfolioOverview() {
  // Extract summary metrics
  const fy26CommitmentsYTD = portfolioMetrics.find(
    (m) => m.fiscalYear === 'FY26' && m.metric === 'Commitments YTD'
  )
  const fy26NormalTarget = portfolioMetrics.find(
    (m) => m.fiscalYear === 'FY26' && m.metric === 'Normal Target'
  )
  const fy27Pipeline = portfolioMetrics.find(
    (m) => m.fiscalYear === 'FY27' && m.metric === 'Commitment Pipeline'
  )
  const fy28Pipeline = portfolioMetrics.find(
    (m) => m.fiscalYear === 'FY28' && m.metric === 'Commitment Pipeline'
  )

  const calculateTotal = (metric) => {
    if (!metric) return 0
    return (
      (metric.PE || 0) +
      (metric.VC || 0) +
      (metric.NR || 0) +
      (metric.RE || 0) +
      (metric.NMA || 0) +
      (metric.Pipeline || 0)
    )
  }

  return (
    <section className="view-panel">
      <h2>Portfolio Overview</h2>
      <p>Summary metrics and portfolio allocation by asset class across fiscal years.</p>

      <div className="summary-cards-grid">
        <div className="summary-card">
          <span className="summary-label">FY26 Commitments YTD</span>
          <strong className="summary-value">${calculateTotal(fy26CommitmentsYTD)}</strong>
          <span className="summary-detail">Millions</span>
        </div>
        <div className="summary-card">
          <span className="summary-label">FY26 Normal Target</span>
          <strong className="summary-value">${calculateTotal(fy26NormalTarget)}</strong>
          <span className="summary-detail">Millions</span>
        </div>
        <div className="summary-card">
          <span className="summary-label">FY27 Pipeline</span>
          <strong className="summary-value">${calculateTotal(fy27Pipeline)}</strong>
          <span className="summary-detail">Millions</span>
        </div>
        <div className="summary-card">
          <span className="summary-label">FY28 Pipeline</span>
          <strong className="summary-value">${calculateTotal(fy28Pipeline)}</strong>
          <span className="summary-detail">Millions</span>
        </div>
      </div>

      <div className="chart-container">
        <h3>Portfolio Metrics by Fiscal Year and Type</h3>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart
            data={portfolioMetrics}
            margin={{ top: 20, right: 30, left: 0, bottom: 60 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#d1d5db" />
            <XAxis
              dataKey="metric"
              angle={-45}
              textAnchor="end"
              height={100}
              tick={{ fill: '#374151', fontSize: 12 }}
            />
            <YAxis tick={{ fill: '#374151', fontSize: 12 }} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#ffffff',
                border: '1px solid #d1d5db',
                borderRadius: '2px',
                color: '#1f2937',
              }}
              labelStyle={{ color: '#1f2937' }}
            />
            <Legend
              wrapperStyle={{
                paddingTop: '20px',
                color: '#4b5563',
              }}
            />
            <Bar dataKey="PE" stackId="a" fill="#1e6fa8" name="PE" />
            <Bar dataKey="VC" stackId="a" fill="#4a91ff" name="VC" />
            <Bar dataKey="NR" stackId="a" fill="#7ac7ff" name="NR" />
            <Bar dataKey="RE" stackId="a" fill="#46a8ff" name="RE" />
            <Bar dataKey="NMA" stackId="a" fill="#5db4ff" name="NMA" />
            <Bar dataKey="Pipeline" stackId="a" fill="rgba(122, 199, 255, 0.4)" name="Pipeline" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  )
}

function AssetClassDetail({ commitmentData }) {
  const [selectedAssetClass, setSelectedAssetClass] = useState('RE')

  const filteredCommitments = commitmentData.filter(
    (commitment) => commitment.assetClass === selectedAssetClass
  )

  const chartMetricOrder = [
    { fiscalYear: 'FY26', metric: 'Commitments YTD' },
    { fiscalYear: 'FY26', metric: 'Normal Target' },
    { fiscalYear: 'FY26', metric: 'Calls YTD' },
    { fiscalYear: 'FY26', metric: 'Distributions YTD', label: 'Dist. YTD' },
    { fiscalYear: 'FY27', metric: 'Commitment Pipeline' },
    { fiscalYear: 'FY27', metric: 'Normal Target' },
    { fiscalYear: 'FY28', metric: 'Commitment Pipeline' },
    { fiscalYear: 'FY28', metric: 'Normal Target' },
  ]

  const assetClassChartData = chartMetricOrder.map((item) => {
    const metricRow = portfolioMetrics.find(
      (row) => row.fiscalYear === item.fiscalYear && row.metric === item.metric
    )

    return {
      fiscalYear: item.fiscalYear,
      label: item.label || item.metric,
      value: metricRow?.[selectedAssetClass] || 0,
    }
  })

  const totalsByFiscalYear = fiscalYears.map((fiscalYear) => {
    const targetAmount = filteredCommitments
      .filter((commitment) => commitment.fiscalYear === fiscalYear)
      .reduce((total, commitment) => total + commitment.targetAmount, 0)

    return { fiscalYear, targetAmount }
  })

  const totalPipelineAmount = totalsByFiscalYear.reduce(
    (total, row) => total + row.targetAmount,
    0
  )

  const commitmentsByFiscalYear = fiscalYears.reduce((groups, fiscalYear) => {
    groups[fiscalYear] = filteredCommitments.filter(
      (commitment) => commitment.fiscalYear === fiscalYear
    )
    return groups
  }, {})

  const getRowsByType = (fiscalYear, commitmentType) =>
    commitmentsByFiscalYear[fiscalYear].filter(
      (commitment) => commitment.commitmentType === commitmentType
    )

  const getTotalByType = (rows) =>
    rows.reduce((total, commitment) => total + commitment.targetAmount, 0)

  return (
    <section className="view-panel asset-detail-view">
      <div className="asset-report-header">
        <div>
          <h2>{assetClassNames[selectedAssetClass]}</h2>
          <p>Commitment pipeline reporting exhibit</p>
        </div>

        <div className="asset-selector" aria-label="Asset class selector">
          {assetClasses.map((assetClass) => (
            <button
              key={assetClass}
              type="button"
              className={`asset-selector-button ${
                selectedAssetClass === assetClass ? 'active' : ''
              }`}
              onClick={() => setSelectedAssetClass(assetClass)}
            >
              {assetClass}
            </button>
          ))}
        </div>
      </div>

      <div className="asset-kpi-row">
        {totalsByFiscalYear.map((row) => (
          <div className="summary-card" key={row.fiscalYear}>
            <span className="summary-label">{row.fiscalYear} Target</span>
            <strong className="summary-value">{formatMillions(row.targetAmount)}</strong>
          </div>
        ))}
        <div className="summary-card summary-card-total">
          <span className="summary-label">Total Pipeline</span>
          <strong className="summary-value">{formatMillions(totalPipelineAmount)}</strong>
        </div>
      </div>

      <div className="chart-container asset-report-chart">
        <h3>{selectedAssetClass} Metrics by Fiscal Year</h3>
        <ResponsiveContainer width="100%" height={230}>
          <BarChart
            data={assetClassChartData}
            margin={{ top: 8, right: 18, left: 0, bottom: 28 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#d1d5db" />
            <XAxis
              dataKey="label"
              interval={0}
              angle={-25}
              textAnchor="end"
              height={58}
              tick={{ fill: '#374151', fontSize: 10 }}
            />
            <YAxis
              tick={{ fill: '#374151', fontSize: 10 }}
              tickFormatter={(value) => `$${value}`}
            />
            <Tooltip
              formatter={(value) => [`$${value}M`, selectedAssetClass]}
              labelFormatter={(label, payload) =>
                payload?.[0]?.payload
                  ? `${payload[0].payload.fiscalYear} - ${label}`
                  : label
              }
              contentStyle={{
                backgroundColor: '#ffffff',
                border: '1px solid #d1d5db',
                borderRadius: '2px',
                color: '#1f2937',
              }}
              labelStyle={{ color: '#1f2937' }}
            />
            <Bar
              dataKey="value"
              fill="#8ec5e8"
              name={selectedAssetClass}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="asset-fiscal-grid">
        {fiscalYears.map((fiscalYear) => {
          const fundRows = getRowsByType(fiscalYear, 'Fund')
          const coInvestmentRows = getRowsByType(fiscalYear, 'Co-Investment')

          return (
            <section className="asset-fiscal-column" key={fiscalYear}>
              <h3>{fiscalYear}</h3>
              <AssetReportTable
                title="Funds"
                rows={fundRows}
                totalLabel="Total Proj. (Funds)"
                totalAmount={getTotalByType(fundRows)}
              />
              <AssetReportTable
                title="Co-Investments"
                rows={coInvestmentRows}
                totalLabel="Total Proj. (Co-Invest)"
                totalAmount={getTotalByType(coInvestmentRows)}
              />
            </section>
          )
        })}
      </div>
    </section>
  )
}

function AssetReportTable({ title, rows, totalLabel, totalAmount }) {
  return (
    <div className="asset-report-table-block">
      <div className="asset-report-table-title">{title}</div>
      <table className="asset-report-table">
        <thead>
          <tr>
            <th>Manager Name</th>
            <th>Investment Name</th>
            <th>Target ($mm)</th>
          </tr>
        </thead>
        <tbody>
          {rows.length > 0 ? (
            rows.map((commitment) => (
              <tr key={commitment.id}>
                <td>{commitment.manager}</td>
                <td>{commitment.investmentName}</td>
                <td>{toMillions(commitment.targetAmount).toFixed(0)}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td className="asset-report-none" colSpan="3">
                (none)
              </td>
            </tr>
          )}
          <tr className="asset-report-total-row">
            <td colSpan="2">{totalLabel}</td>
            <td>{toMillions(totalAmount).toFixed(0)}</td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}

function CommitmentInput({ commitmentData, setCommitmentData, appendChange }) {
  const [filters, setFilters] = useState({
    fiscalYear: 'All',
    assetClass: 'All',
    status: 'All',
  })
  const [searchTerm, setSearchTerm] = useState('')

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

  const updateCommitment = (id, field, value) => {
    const originalCommitment = commitmentData.find((commitment) => commitment.id === id)
    if (!originalCommitment) return

    const nextValue =
      field === 'targetAmount'
        ? Math.max(Number.isNaN(Number(value)) ? 0 : Number(value), 0) * 1000000
        : value

    if (originalCommitment[field] === nextValue) return

    const updatedCommitment = {
      ...originalCommitment,
      [field]: nextValue,
    }

    setCommitmentData((currentCommitments) =>
      currentCommitments.map((commitment) => {
        if (commitment.id !== id) return commitment
        return updatedCommitment
      })
    )

    appendChange({
      assetClass: updatedCommitment.assetClass,
      fiscalYear: updatedCommitment.fiscalYear,
      manager: updatedCommitment.manager,
      investmentName: updatedCommitment.investmentName,
      changeType: 'Edited',
      fieldChanged: fieldLabels[field],
      oldValue: formatChangeValue(field, originalCommitment[field]),
      newValue: formatChangeValue(field, nextValue),
    })
  }

  const addCommitment = () => {
    const nextIdNumber = commitmentData.length + 1
    const defaultAssetClass = filters.assetClass === 'All' ? 'RE' : filters.assetClass
    const defaultFiscalYear = filters.fiscalYear === 'All' ? 'FY26' : filters.fiscalYear
    const defaultStatus = filters.status === 'All' ? 'Pipeline' : filters.status

    const newCommitment = {
      id: `CMT-DRAFT-${nextIdNumber}`,
      managerType: 'New',
      fiscalYear: defaultFiscalYear,
      assetClass: defaultAssetClass,
      manager: 'New Manager',
      investmentName: `${defaultAssetClass} Draft Commitment`,
      commitmentType: 'Fund',
      targetAmount: 0,
      status: defaultStatus,
      submissionStatus: 'Not Submitted',
      expectedQuarter: 'Q1',
      notes: 'Draft placeholder commitment.',
    }

    setCommitmentData((currentCommitments) => [newCommitment, ...currentCommitments])

    appendChange({
      assetClass: newCommitment.assetClass,
      fiscalYear: newCommitment.fiscalYear,
      manager: newCommitment.manager,
      investmentName: newCommitment.investmentName,
      changeType: 'Added',
      fieldChanged: 'Commitment',
      oldValue: '-',
      newValue: `${formatMillions(newCommitment.targetAmount)} target added`,
    })
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
          <p>Enter expected commitment updates using the asset class head input format.</p>
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
            {statusOptions.map((status) => (
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
            placeholder="Mgr. Name or Investment Name"
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
                <th>Current/New Mgr.</th>
                <th>Mgr. Name</th>
                <th>Fund/Co-Investment</th>
                <th>Investment Name</th>
                <th>Target ($mm)</th>
                <th>Status</th>
                <th>Fiscal Year (Actual/Expected)</th>
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
                      {statusOptions.map((status) => (
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
    const matchesSearch =
      normalizedSearch.length === 0 ||
      change.manager.toLowerCase().includes(normalizedSearch) ||
      change.investmentName.toLowerCase().includes(normalizedSearch)

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
          <p>Review field-level edits, additions, and deletions for the commitment pipeline.</p>
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
            placeholder="Manager or Investment Name"
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
                <th>Investment Name</th>
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
                    <span className={`change-type-pill change-${change.changeType.toLowerCase()}`}>
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

function App() {
  const [activeView, setActiveView] = useState(views[0].key)
  const [commitmentData, setCommitmentData] = useState(getInitialCommitments)
  const [changeLogRecords, setChangeLogRecords] = useState(changeLog)

  const appendChange = (change) => {
    setChangeLogRecords((currentChanges) => [
      {
        id: `CHG-DRAFT-${currentChanges.length + 1}`,
        timestamp: formatTimestamp(new Date()),
        changedBy: changedByUser,
        ...change,
      },
      ...currentChanges,
    ])
  }

  const renderView = () => {
    switch (activeView) {
      case 'asset-class':
        return <AssetClassDetail commitmentData={commitmentData} />
      case 'commitment-input':
        return (
          <CommitmentInput
            commitmentData={commitmentData}
            setCommitmentData={setCommitmentData}
            appendChange={appendChange}
          />
        )
      case 'change-log':
        return <ChangeLog changeLogRecords={changeLogRecords} />
      default:
        return <PortfolioOverview />
    }
  }

  return (
    <div className="dashboard-shell">
      <header className="dashboard-header">
        <div className="brand-block">
          <span className="brand-tag">RMC</span>
          <h1>Commitment Pipeline Dashboard</h1>
        </div>
        <div className="header-meta">Prototype | Front-end only</div>
      </header>

      <div className="dashboard-content">
        <aside className="dashboard-sidebar">
          <div className="sidebar-title">Navigation</div>
          <nav className="sidebar-nav">
            {views.map((view) => (
              <button
                key={view.key}
                type="button"
                className={`nav-button ${activeView === view.key ? 'active' : ''}`}
                onClick={() => setActiveView(view.key)}
              >
                {view.label}
              </button>
            ))}
          </nav>
        </aside>

        <main className="dashboard-main">
          <div className="main-panel">
            {renderView()}
          </div>
        </main>
      </div>
    </div>
  )
}

export default App
