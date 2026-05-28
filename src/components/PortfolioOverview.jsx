import {
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LabelList,
  ReferenceArea,
} from 'recharts'
import { assetChartMetrics, assetClasses } from '../constants'
import {
  calculateCommitmentTotal,
  calculatePortfolioMetricTotal,
  isClosedCommitment,
} from '../utils/calculations'

const overviewBarColors = {
  PE: '#1e6fa8',
  VC: '#4a91ff',
  NR: '#7ac7ff',
  RE: '#46a8ff',
  NMA: '#5db4ff',
  Pipeline: 'rgba(122, 199, 255, 0.4)',
}

function OverviewChartTick({ x, y, payload, data }) {
  const item = data.find((row) => row.xKey === payload.value)
  const lines = String(item?.displayLabel || payload.value).split(' ')

  return (
    <text x={x} y={y + 12} fill="#00205B" fontSize={24} textAnchor="middle">
      {lines.map((line, index) => (
        <tspan key={`${line}-${index}`} x={x} dy={index === 0 ? 0 : 28}>
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
      fontSize={24}
      fontWeight={700}
      textAnchor="middle"
    >
      {`$${numericValue.toLocaleString('en-US', { maximumFractionDigits: 1 })}M`}
    </text>
  )
}

function PortfolioOverview({ commitmentData, portfolioMetrics }) {
  const getLiveCommitmentRow = (item, predicate = () => true) => {
    const assetClassValues = assetClasses.reduce((values, assetClass) => {
      values[assetClass] = calculateCommitmentTotal(
        commitmentData,
        (commitment) =>
          commitment.assetClass === assetClass &&
          commitment.fiscalYear === item.fiscalYear &&
          predicate(commitment)
      )
      return values
    }, {})

    return {
      fiscalYear: item.fiscalYear,
      metric: item.metric,
      ...assetClassValues,
      Pipeline: 0,
    }
  }

  const getOverviewMetricRow = (item) => {
    if (item.fiscalYear === 'FY26' && item.metric === 'Commitments YTD') {
      return getLiveCommitmentRow(item, isClosedCommitment)
    }

    if (item.fiscalYear === 'FY26' && item.metric === 'Pipeline') {
      return getLiveCommitmentRow(item, (commitment) => !isClosedCommitment(commitment))
    }

    if (
      (item.fiscalYear === 'FY27' || item.fiscalYear === 'FY28') &&
      item.metric === 'Commitment Pipeline'
    ) {
      return getLiveCommitmentRow(item)
    }

    return portfolioMetrics.find(
      (row) => row.fiscalYear === item.fiscalYear && row.metric === item.metric
    )
  }

  const overviewChartData = assetChartMetrics.map((item) => {
    const metricRow = getOverviewMetricRow(item)

    return {
      ...metricRow,
      xKey: `${item.fiscalYear}-${item.metric}`,
      fiscalYear: item.fiscalYear,
      displayLabel: item.displayLabel || item.metric,
      total: calculatePortfolioMetricTotal(metricRow),
      isPipelineOutline: item.fiscalYear === 'FY26' && item.metric === 'Pipeline',
    }
  })

  const renderCells = (dataKey) =>
    overviewChartData.map((entry) => (
      <Cell
        key={`${entry.xKey}-${dataKey}`}
        fill={entry.isPipelineOutline ? '#ffffff' : overviewBarColors[dataKey]}
        stroke={entry.isPipelineOutline ? '#00205B' : overviewBarColors[dataKey]}
        strokeWidth={entry.isPipelineOutline ? 1.5 : 1}
      />
    ))

  const getChartTotal = (fiscalYear, metric) =>
    overviewChartData.find(
      (row) => row.fiscalYear === fiscalYear && row.metric === metric
    )?.total || 0

  return (
    <section className="view-panel">
      <h2>Portfolio Overview</h2>

      <div className="summary-cards-grid">
        <div className="summary-card">
          <span className="summary-label">FY26 Commitments YTD</span>
          <strong className="summary-value">
            ${getChartTotal('FY26', 'Commitments YTD')}
          </strong>
          <span className="summary-detail">Millions</span>
        </div>
        <div className="summary-card">
          <span className="summary-label">FY26 Normal Target</span>
          <strong className="summary-value">${getChartTotal('FY26', 'Normal Target')}</strong>
          <span className="summary-detail">Millions</span>
        </div>
        <div className="summary-card">
          <span className="summary-label">FY27 Pipeline</span>
          <strong className="summary-value">
            ${getChartTotal('FY27', 'Commitment Pipeline')}
          </strong>
          <span className="summary-detail">Millions</span>
        </div>
        <div className="summary-card">
          <span className="summary-label">FY28 Pipeline</span>
          <strong className="summary-value">
            ${getChartTotal('FY28', 'Commitment Pipeline')}
          </strong>
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
        <ResponsiveContainer width="100%" height={700}>
          <BarChart
            data={overviewChartData}
            margin={{ top: 48, right: 40, left: 24, bottom: 118 }}
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
              height={130}
              tick={<OverviewChartTick data={overviewChartData} />}
            />
            <YAxis tick={{ fill: '#374151', fontSize: 24 }} width={76} />
            <Tooltip
              formatter={(value, name) => [
                `$${Number(value || 0).toLocaleString('en-US', { maximumFractionDigits: 1 })}M`,
                name,
              ]}
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
                fontSize: '24px',
              }}
              labelStyle={{ color: '#1f2937', fontSize: '24px' }}
            />
            <Legend
              wrapperStyle={{
                paddingTop: '28px',
                color: '#4b5563',
                fontSize: '26px',
              }}
            />
            <Bar dataKey="PE" stackId="a" fill={overviewBarColors.PE} name="PE">
              {renderCells('PE')}
            </Bar>
            <Bar dataKey="VC" stackId="a" fill={overviewBarColors.VC} name="VC">
              {renderCells('VC')}
            </Bar>
            <Bar dataKey="NR" stackId="a" fill={overviewBarColors.NR} name="NR">
              {renderCells('NR')}
            </Bar>
            <Bar dataKey="RE" stackId="a" fill={overviewBarColors.RE} name="RE">
              {renderCells('RE')}
            </Bar>
            <Bar dataKey="NMA" stackId="a" fill={overviewBarColors.NMA} name="NMA">
              {renderCells('NMA')}
            </Bar>
            <Bar
              dataKey="Pipeline"
              stackId="a"
              fill={overviewBarColors.Pipeline}
              name="Pipeline"
            >
              {renderCells('Pipeline')}
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
