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

const formatMillions = (amount) => `$${(amount / 1000000).toFixed(0)}M`
const toMillions = (amount) => amount / 1000000

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
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis
              dataKey="metric"
              angle={-45}
              textAnchor="end"
              height={100}
              tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 12 }}
            />
            <YAxis tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 12 }} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(15, 35, 65, 0.95)',
                border: '1px solid rgba(122, 199, 255, 0.3)',
                borderRadius: '8px',
              }}
              labelStyle={{ color: 'rgba(255,255,255,0.9)' }}
            />
            <Legend
              wrapperStyle={{
                paddingTop: '20px',
                color: 'rgba(255,255,255,0.7)',
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

function AssetClassDetail() {
  const [selectedAssetClass, setSelectedAssetClass] = useState('RE')

  const filteredCommitments = commitments.filter(
    (commitment) => commitment.assetClass === selectedAssetClass
  )

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

  return (
    <section className="view-panel">
      <div className="view-header-row">
        <div>
          <h2>Asset Class Detail</h2>
          <p>Review target commitment pipeline by fiscal year and fund type.</p>
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

      <div className="summary-cards-grid">
        {totalsByFiscalYear.map((row) => (
          <div className="summary-card" key={row.fiscalYear}>
            <span className="summary-label">{row.fiscalYear} Target Amount</span>
            <strong className="summary-value">{formatMillions(row.targetAmount)}</strong>
            <span className="summary-detail">{selectedAssetClass} pipeline</span>
          </div>
        ))}
        <div className="summary-card summary-card-total">
          <span className="summary-label">Total Pipeline Amount</span>
          <strong className="summary-value">{formatMillions(totalPipelineAmount)}</strong>
          <span className="summary-detail">FY26-FY28</span>
        </div>
      </div>

      <div className="chart-container">
        <h3>{selectedAssetClass} Target Amounts by Fiscal Year</h3>
        <ResponsiveContainer width="100%" height={320}>
          <BarChart
            data={totalsByFiscalYear}
            margin={{ top: 20, right: 30, left: 0, bottom: 10 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis
              dataKey="fiscalYear"
              tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 12 }}
            />
            <YAxis
              tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 12 }}
              tickFormatter={(value) => `$${value / 1000000}M`}
            />
            <Tooltip
              formatter={(value) => [formatMillions(value), 'Target Amount']}
              contentStyle={{
                backgroundColor: 'rgba(15, 35, 65, 0.95)',
                border: '1px solid rgba(122, 199, 255, 0.3)',
                borderRadius: '8px',
              }}
              labelStyle={{ color: 'rgba(255,255,255,0.9)' }}
            />
            <Bar
              dataKey="targetAmount"
              fill="#7ac7ff"
              radius={[8, 8, 0, 0]}
              name="Target Amount"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="fiscal-year-sections">
        {fiscalYears.map((fiscalYear) => {
          const fiscalYearCommitments = commitmentsByFiscalYear[fiscalYear]

          return (
            <section className="fiscal-year-panel" key={fiscalYear}>
              <div className="fiscal-year-heading">
                <div>
                  <h3>{fiscalYear}</h3>
                  <span>{formatMillions(totalsByFiscalYear.find((row) => row.fiscalYear === fiscalYear).targetAmount)} total target</span>
                </div>
                <span className="record-count">{fiscalYearCommitments.length} records</span>
              </div>

              {commitmentTypes.map((commitmentType) => {
                const rows = fiscalYearCommitments.filter(
                  (commitment) => commitment.commitmentType === commitmentType
                )

                return (
                  <div className="commitment-table-group" key={commitmentType}>
                    <div className="table-group-heading">
                      <h4>{commitmentType}s</h4>
                      <span>{formatMillions(rows.reduce((total, row) => total + row.targetAmount, 0))}</span>
                    </div>

                    {rows.length > 0 ? (
                      <div className="commitment-table-wrap">
                        <table className="commitment-table">
                          <thead>
                            <tr>
                              <th>Manager</th>
                              <th>Investment Name</th>
                              <th>Commitment Type</th>
                              <th>Target Amount</th>
                              <th>Status</th>
                              <th>Submission Status</th>
                              <th>Expected Quarter</th>
                              <th>Notes</th>
                            </tr>
                          </thead>
                          <tbody>
                            {rows.map((commitment) => (
                              <tr key={commitment.id}>
                                <td>{commitment.manager}</td>
                                <td>{commitment.investmentName}</td>
                                <td>{commitment.commitmentType}</td>
                                <td>{formatMillions(commitment.targetAmount)}</td>
                                <td>
                                  <span className={`status-pill status-${commitment.status.toLowerCase().replace(/\s+/g, '-')}`}>
                                    {commitment.status}
                                  </span>
                                </td>
                                <td>{commitment.submissionStatus}</td>
                                <td>{commitment.expectedQuarter}</td>
                                <td>{commitment.notes}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="empty-table-state">
                        No {commitmentType.toLowerCase()} commitments for {fiscalYear}.
                      </div>
                    )}
                  </div>
                )
              })}
            </section>
          )
        })}
      </div>
    </section>
  )
}

function CommitmentInput() {
  const [editableCommitments, setEditableCommitments] = useState(() =>
    commitments.map((commitment) => ({
      ...commitment,
      managerType: commitment.managerType || 'Current',
    }))
  )
  const [filters, setFilters] = useState({
    fiscalYear: 'All',
    assetClass: 'All',
    status: 'All',
  })
  const [searchTerm, setSearchTerm] = useState('')

  const filteredCommitments = editableCommitments.filter((commitment) => {
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
    setEditableCommitments((currentCommitments) =>
      currentCommitments.map((commitment) => {
        if (commitment.id !== id) return commitment

        if (field === 'targetAmount') {
          const numericValue = Number(value)
          const safeValue = Number.isNaN(numericValue) ? 0 : Math.max(numericValue, 0)

          return {
            ...commitment,
            targetAmount: safeValue * 1000000,
          }
        }

        return {
          ...commitment,
          [field]: value,
        }
      })
    )
  }

  const addCommitment = () => {
    const nextIdNumber = editableCommitments.length + 1
    const defaultAssetClass = filters.assetClass === 'All' ? 'RE' : filters.assetClass
    const defaultFiscalYear = filters.fiscalYear === 'All' ? 'FY26' : filters.fiscalYear
    const defaultStatus = filters.status === 'All' ? 'Pipeline' : filters.status

    setEditableCommitments((currentCommitments) => [
      {
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
      },
      ...currentCommitments,
    ])
  }

  const deleteCommitment = (id) => {
    setEditableCommitments((currentCommitments) =>
      currentCommitments.filter((commitment) => commitment.id !== id)
    )
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

function ChangeLog() {
  return (
    <section className="view-panel">
      <h2>Change Log</h2>
      <p>Review the latest updates, approvals, and audit history for the commitment pipeline.</p>
      <div className="placeholder-box">Change log entries and audit trail widgets will appear in this view.</div>
    </section>
  )
}

function App() {
  const [activeView, setActiveView] = useState(views[0].key)

  const renderView = () => {
    switch (activeView) {
      case 'asset-class':
        return <AssetClassDetail />
      case 'commitment-input':
        return <CommitmentInput />
      case 'change-log':
        return <ChangeLog />
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
