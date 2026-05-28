import {
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LabelList,
  ReferenceArea,
  ReferenceDot,
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

const minimumSegmentLabelHeight = 18
const minimumSegmentLabelWidth = 44

const formatWholeMillions = (amount) =>
  Number(amount || 0).toLocaleString('en-US', { maximumFractionDigits: 0 })

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

function OverviewSegmentLabel({ x, y, width, height, value, index, assetClass, data }) {
  const numericValue = Number(value || 0)
  const label = `${assetClass} - $${formatWholeMillions(numericValue)}`
  const isOutlinedBar = data[index]?.isPipelineOutline

  if (
    numericValue <= 0 ||
    height < minimumSegmentLabelHeight ||
    width < minimumSegmentLabelWidth
  ) {
    return null
  }

  return (
    <text
      x={x + width / 2}
      y={y + height / 2}
      fill={isOutlinedBar ? '#00205B' : '#ffffff'}
      fontSize={15}
      fontWeight={700}
      textAnchor="middle"
      dominantBaseline="middle"
    >
      {label}
    </text>
  )
}

function OverviewTooltip({ active, payload }) {
  if (!active || !payload?.length) return null

  const row = payload[0].payload

  return (
    <div className="overview-tooltip">
      <div className="overview-tooltip-title">
        {row.fiscalYear} - {row.displayLabel}
      </div>
      <div className="overview-tooltip-subtitle">
        {row.detailSource === 'live'
          ? 'Live commitments'
          : 'Targets & Actuals values'}
      </div>
      <div className="overview-tooltip-groups">
        {assetClasses
          .filter((assetClass) => Number(row[assetClass] || 0) > 0)
          .map((assetClass) => {
            const commitments = row.commitmentsByAssetClass?.[assetClass] || []

            return (
              <div className="overview-tooltip-group" key={assetClass}>
                <div className="overview-tooltip-group-title">
                  <span>{assetClass}</span>
                  <strong>${formatWholeMillions(row[assetClass])}</strong>
                </div>
                {commitments.length > 0 ? (
                  <ul>
                    {commitments.map((commitment) => (
                      <li key={commitment.id}>
                        <span>
                          {commitment.manager} - {commitment.investmentName}
                        </span>
                        <strong>${formatWholeMillions(commitment.targetAmount)}</strong>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>Fund-level detail is not available for Targets & Actuals.</p>
                )}
              </div>
            )
          })}
      </div>
    </div>
  )
}

function PortfolioOverview({ commitmentData, portfolioMetrics }) {
  const getLiveCommitmentsByAssetClass = (item, predicate = () => true) =>
    assetClasses.reduce((groups, assetClass) => {
      groups[assetClass] = commitmentData.filter(
        (commitment) =>
          commitment.assetClass === assetClass &&
          commitment.fiscalYear === item.fiscalYear &&
          predicate(commitment)
      )
      return groups
    }, {})

  const getLiveCommitmentRow = (item, predicate = () => true) => {
    const commitmentsByAssetClass = getLiveCommitmentsByAssetClass(item, predicate)
    const assetClassValues = assetClasses.reduce((values, assetClass) => {
      values[assetClass] = calculateCommitmentTotal(commitmentsByAssetClass[assetClass])
      return values
    }, {})

    return {
      fiscalYear: item.fiscalYear,
      metric: item.metric,
      ...assetClassValues,
      Pipeline: 0,
      detailSource: 'live',
      commitmentsByAssetClass,
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

    return {
      ...portfolioMetrics.find(
        (row) => row.fiscalYear === item.fiscalYear && row.metric === item.metric
      ),
      detailSource: 'targetsActuals',
      commitmentsByAssetClass: {},
    }
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

  const renderSegmentLabel = (assetClass) => (labelProps) => (
    <OverviewSegmentLabel
      {...labelProps}
      assetClass={assetClass}
      data={overviewChartData}
    />
  )

  return (
    <section className="view-panel portfolio-overview-view">
      <div className="chart-container portfolio-overview-chart">
        <h3>Portfolio Commitments by Fiscal Year</h3>
        <div className="overview-chart-top-year-row" aria-hidden="true">
          <span>FY26</span>
          <span>FY27</span>
          <span>FY28</span>
        </div>
        <ResponsiveContainer width="100%" height={720}>
          <BarChart
            data={overviewChartData}
            margin={{ top: 54, right: 42, left: 24, bottom: 82 }}
          >
            <ReferenceArea
              x1="FY26-Commitments YTD"
              x2="FY26-Distributions YTD"
              fill="#f3f4f6"
              strokeOpacity={0}
            />
            <ReferenceArea
              x1="FY28-Commitment Pipeline"
              x2="FY28-Normal Target"
              fill="#f3f4f6"
              strokeOpacity={0}
            />
            <CartesianGrid strokeDasharray="3 3" stroke="#d1d5db" />
            <XAxis
              dataKey="xKey"
              interval={0}
              height={104}
              tick={<OverviewChartTick data={overviewChartData} />}
            />
            <YAxis
              tick={{ fill: '#374151', fontSize: 24 }}
              width={76}
              domain={[0, (dataMax) => Math.ceil(Number(dataMax || 0) * 1.12)]}
            />
            <Tooltip content={<OverviewTooltip />} />
            {overviewChartData
              .filter((row) => Number(row.total || 0) > 0)
              .map((row) => (
                <ReferenceDot
                  key={`${row.xKey}-total-label`}
                  x={row.xKey}
                  y={row.total}
                  r={0}
                  ifOverflow="extendDomain"
                  label={{
                    value: `$${formatWholeMillions(row.total)}`,
                    position: 'top',
                    fill: '#00205B',
                    fontSize: 24,
                    fontWeight: 700,
                  }}
                />
              ))}
            <Bar dataKey="PE" stackId="a" fill={overviewBarColors.PE} name="PE">
              {renderCells('PE')}
              <LabelList dataKey="PE" content={renderSegmentLabel('PE')} />
            </Bar>
            <Bar dataKey="VC" stackId="a" fill={overviewBarColors.VC} name="VC">
              {renderCells('VC')}
              <LabelList dataKey="VC" content={renderSegmentLabel('VC')} />
            </Bar>
            <Bar dataKey="NR" stackId="a" fill={overviewBarColors.NR} name="NR">
              {renderCells('NR')}
              <LabelList dataKey="NR" content={renderSegmentLabel('NR')} />
            </Bar>
            <Bar dataKey="RE" stackId="a" fill={overviewBarColors.RE} name="RE">
              {renderCells('RE')}
              <LabelList dataKey="RE" content={renderSegmentLabel('RE')} />
            </Bar>
            <Bar dataKey="NMA" stackId="a" fill={overviewBarColors.NMA} name="NMA">
              {renderCells('NMA')}
              <LabelList
                dataKey="NMA"
                content={renderSegmentLabel('NMA')}
              />
            </Bar>
            <Bar
              dataKey="Pipeline"
              stackId="a"
              fill={overviewBarColors.Pipeline}
              name="Pipeline"
            >
              {renderCells('Pipeline')}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  )
}

export default PortfolioOverview
