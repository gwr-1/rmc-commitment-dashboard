function Layout({ views, activeView, onViewChange, onLogout, userEmail, children }) {
  return (
    <div className="dashboard-shell">
      <header className="dashboard-header">
        <div className="brand-block">
          <span className="brand-tag">RMC</span>
          <h1>Commitment Pipeline Dashboard</h1>
        </div>
        <div className="header-actions">
          <div className="header-meta">{userEmail || 'Investment Reporting'}</div>
          {onLogout && (
            <button type="button" className="logout-button" onClick={onLogout}>
              Log Out
            </button>
          )}
        </div>
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
                onClick={() => onViewChange(view.key)}
              >
                {view.label}
              </button>
            ))}
          </nav>
        </aside>

        <main className="dashboard-main">
          <div className="main-panel">{children}</div>
        </main>
      </div>
    </div>
  )
}

export default Layout
