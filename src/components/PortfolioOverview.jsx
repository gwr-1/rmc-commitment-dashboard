import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LabelList,
  ReferenceArea,
} from 'recharts'
import { portfolioMetrics } from '../data/portfolioMetrics'
import { calculatePortfolioMetricTotal } from '../utils/calculations'

const overviewChartMetrics = [
  { fiscalYear: 'FY26', metric: 'Commitments YTD', displayLabel: 'Commitments YTD' },
  { fiscalYear: 'FY26', metric: 'Normal Target' },
  { fiscalYear: 'FY26', metric: 'Calls YTD' },
  { fiscalYear: 'FY26', metric: 'Distributions YTD', displayLabel: 'Dist. YTD' },
  { fiscalYear: 'FY27', metric: 'Commitment Pipeline' },
  { fiscalYear: 'FY27', metric: 'Normal Target' },
  { fiscalYear: 'FY28', metric: 'Commitment Pipeline' },
  { fiscalYear: 'FY28', metric: 'Normal Target' },
]

function OverviewChartTick({ x, y, payload, data }) {
  const item = data.find((row) => row.xKey === payload.value)
  const lines = String(item?.displayLabel || payload.value).split(' ')

  return (
    <text x={x} y={y + 8} fill="#00205B" fontSize={11} textAnchor="middle">
      {lines.map((line, index) => (
        <tspan key={`${line}-${index}`} x={x} dy={index === 0 ? 0 : 13}>
          {line}
        </tspan>
      ))}
    </text>
  )
}

function OverviewTotalLabel({ x, y, width, value }) {
  const numericValue = Number(value)
  const labelY = numericValue === 0 ? y - 5 : Math.max(y - 8, 12)

  return (
    <text
      x={x + width / 2}
      y={labelY}
      fill="#00205B"
      fontSize={11}
      fontWeight={700}
      textAnchor="middle"
    >
      {`$${numericValue}M`}
    </text>
  )
}

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
  const overviewChartData = overviewChartMetrics.map((item) => {
    const metricRow = portfolioMetrics.find(
      (row) => row.fiscalYear === item.fiscalYear && row.metric === item.metric
    )

    return {
      ...metricRow,
      xKey: `${item.fiscalYear}-${item.metric}`,
      fiscalYear: item.fiscalYear,
      displayLabel: item.displayLabel || item.metric,
      total: calculatePortfolioMetricTotal(metricRow),
    }
  })

  return (
    <section className="view-panel">
      <h2>Portfolio Overview</h2>

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

      <div className="chart-container portfolio-overview-chart">
        <h3>Portfolio Commitments by Fiscal Year</h3>
        <div className="overview-chart-top-year-row" aria-hidden="true">
          <span>FY26</span>
          <span>FY27</span>
          <span>FY28</span>
        </div>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart
            data={overviewChartData}
            margin={{ top: 26, right: 30, left: 0, bottom: 54 }}
          >
            <ReferenceArea
              x1="FY26-Commitments YTD"
              x2="FY26-Distributions YTD"
              fill="#f7f8fa"
              strokeOpacity={0}
            />
            <ReferenceArea
              x1="FY28-Commitment Pipeline"
              x2="FY28-Normal Target"
              fill="#f7f8fa"
              strokeOpacity={0}
            />
            <CartesianGrid strokeDasharray="3 3" stroke="#d1d5db" />
            <XAxis
              dataKey="xKey"
              interval={0}
              height={70}
              tick={<OverviewChartTick data={overviewChartData} />}
            />
            <YAxis tick={{ fill: '#374151', fontSize: 12 }} />
            <Tooltip
              labelFormatter={(label, payload) =>
                payload?.[0]?.payload
                  ? `${payload[0].payload.fiscalYear} - ${payload[0].payload.displayLabel}`
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
            <Bar dataKey="Pipeline" stackId="a" fill="rgba(122, 199, 255, 0.4)" name="Pipeline">
              <LabelList dataKey="total" content={<OverviewTotalLabel />} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        <div className="overview-chart-year-row" aria-hidden="true">
          <span>FY26</span>
          <span>FY27</span>
          <span>FY28</span>
        </div>
      </div>
    </section>
  )
}

export default PortfolioOverview
