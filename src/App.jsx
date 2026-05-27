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
import './App.css'

const views = [
  { key: 'overview', label: 'Portfolio Overview' },
  { key: 'asset-class', label: 'Asset Class Detail' },
  { key: 'commitment-input', label: 'Commitment Input' },
  { key: 'change-log', label: 'Change Log' },
]

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
  return (
    <section className="view-panel">
      <h2>Asset Class Detail</h2>
      <p>View exposure breakdowns, risk characteristics, and concentration by asset class.</p>
      <div className="placeholder-box">Asset class detail widgets and charts will load in this prototype.</div>
    </section>
  )
}

function CommitmentInput() {
  return (
    <section className="view-panel">
      <h2>Commitment Input</h2>
      <p>Enter new commitment details, review underwriting assumptions, and track requests.</p>
      <div className="placeholder-box">Commitment input forms and validation panels will be added here.</div>
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
