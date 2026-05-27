import { useState } from 'react'
import './App.css'

const views = [
  { key: 'overview', label: 'Portfolio Overview' },
  { key: 'asset-class', label: 'Asset Class Detail' },
  { key: 'commitment-input', label: 'Commitment Input' },
  { key: 'change-log', label: 'Change Log' },
]

function PortfolioOverview() {
  return (
    <section className="view-panel">
      <h2>Portfolio Overview</h2>
      <p>Summary metrics, pipeline status, and portfolio allocation trends appear here.</p>
      <div className="panel-grid">
        <div className="metric-card">
          <span className="metric-label">Total Commitments</span>
          <strong>152</strong>
        </div>
        <div className="metric-card">
          <span className="metric-label">Pending Approval</span>
          <strong>34</strong>
        </div>
        <div className="metric-card">
          <span className="metric-label">Available Capacity</span>
          <strong>$1.8B</strong>
        </div>
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
