import { useState } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LabelList,
  ReferenceArea,
} from 'recharts'
import {
  assetChartMetrics,
  assetClasses,
  assetClassNames,
  fiscalYears,
} from '../constants'
import { portfolioMetrics } from '../data/portfolioMetrics'
import { toMillions } from '../utils/calculations'

function AssetChartTick({ x, y, payload, data }) {
  const item = data.find((row) => row.xKey === payload.value)
  const lines = String(item?.displayLabel || payload.value).split(' ')

  return (
    <text x={x} y={y + 8} fill="#00205B" fontSize={10} textAnchor="middle">
      {lines.map((line, index) => (
        <tspan key={`${line}-${index}`} x={x} dy={index === 0 ? 0 : 12}>
          {line}
        </tspan>
      ))}
    </text>
  )
}

function AssetChartValueLabel({ x, y, width, value }) {
  const numericValue = Number(value)
  const labelY = numericValue === 0 ? y - 5 : Math.max(y - 6, 12)

  return (
    <text
      x={x + width / 2}
      y={labelY}
      fill="#00205B"
      fontSize={10}
      fontWeight={700}
      textAnchor="middle"
    >
      {`$${numericValue}M`}
    </text>
  )
}

function AssetReportTable({ title, rows, totalLabel, totalAmount }) {
  return (
    <div className="asset-report-table-block">
      <div className="asset-report-table-title">{title}</div>
      <table className="asset-report-table">
        <thead>
          <tr>
            <th>Manager</th>
            <th>Investment</th>
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

function AssetClassDetail({ commitmentData }) {
  const [selectedAssetClass, setSelectedAssetClass] = useState('RE')

  const filteredCommitments = commitmentData.filter(
    (commitment) => commitment.assetClass === selectedAssetClass
  )

  const assetClassChartData = assetChartMetrics.map((item) => {
    const metricRow = portfolioMetrics.find(
      (row) => row.fiscalYear === item.fiscalYear && row.metric === item.metric
    )

    return {
      xKey: `${item.fiscalYear}-${item.metric}`,
      fiscalYear: item.fiscalYear,
      displayLabel: item.displayLabel || item.metric,
      value: metricRow?.[selectedAssetClass] || 0,
    }
  })

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

      <div className="chart-container asset-report-chart">
        <h3>Commitment Activity by Fiscal Year</h3>
        <div className="asset-chart-top-year-row" aria-hidden="true">
          <span>FY26</span>
          <span>FY27</span>
          <span>FY28</span>
        </div>
        <ResponsiveContainer width="100%" height={236}>
          <BarChart
            data={assetClassChartData}
            margin={{ top: 10, right: 18, left: 0, bottom: 42 }}
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
              height={58}
              tick={<AssetChartTick data={assetClassChartData} />}
            />
            <YAxis
              tick={{ fill: '#374151', fontSize: 10 }}
              tickFormatter={(value) => `$${value}`}
            />
            <Tooltip
              formatter={(value) => [`$${value}M`, selectedAssetClass]}
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
            <Bar
              dataKey="value"
              fill="#8ec5e8"
              minPointSize={3}
              name={selectedAssetClass}
            >
              <LabelList dataKey="value" content={<AssetChartValueLabel />} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        <div className="asset-chart-year-row" aria-hidden="true">
          <span>FY26</span>
          <span>FY27</span>
          <span>FY28</span>
        </div>
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

export default AssetClassDetail
