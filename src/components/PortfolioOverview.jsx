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
import { portfolioMetrics } from '../data/portfolioMetrics'
import { calculatePortfolioMetricTotal } from '../utils/calculations'

function PortfolioOverview() {
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

  return (
    <section className="view-panel">
      <h2>Portfolio Overview</h2>
      <p>Summary metrics and portfolio allocation by asset class across fiscal years.</p>

      <div className="summary-cards-grid">
        <div className="summary-card">
          <span className="summary-label">FY26 Commitments YTD</span>
          <strong className="summary-value">${calculatePortfolioMetricTotal(fy26CommitmentsYTD)}</strong>
          <span className="summary-detail">Millions</span>
        </div>
        <div className="summary-card">
          <span className="summary-label">FY26 Normal Target</span>
          <strong className="summary-value">${calculatePortfolioMetricTotal(fy26NormalTarget)}</strong>
          <span className="summary-detail">Millions</span>
        </div>
        <div className="summary-card">
          <span className="summary-label">FY27 Pipeline</span>
          <strong className="summary-value">${calculatePortfolioMetricTotal(fy27Pipeline)}</strong>
          <span className="summary-detail">Millions</span>
        </div>
        <div className="summary-card">
          <span className="summary-label">FY28 Pipeline</span>
          <strong className="summary-value">${calculatePortfolioMetricTotal(fy28Pipeline)}</strong>
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

export default PortfolioOverview
