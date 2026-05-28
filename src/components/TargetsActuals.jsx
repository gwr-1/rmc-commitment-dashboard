import { assetClasses, fiscalYears } from '../constants'

const editableMetrics = [
  { key: 'Normal Target', label: 'Normal Target' },
  { key: 'Calls YTD', label: 'Calls YTD' },
  { key: 'Distributions YTD', label: 'Dist. YTD' },
]

function TargetsActuals({ targetsActuals, setTargetsActuals, onPersistTargetActual }) {
  const updateTargetActual = (assetClass, fiscalYear, metric, value) => {
    const numericValue = Math.max(Number.isNaN(Number(value)) ? 0 : Number(value), 0)

    setTargetsActuals((currentRows) =>
      currentRows.map((row) =>
        row.assetClass === assetClass && row.fiscalYear === fiscalYear
          ? { ...row, [metric]: numericValue }
          : row
      )
    )

    onPersistTargetActual?.({
      fiscalYear,
      assetClass,
      metric,
      amount: numericValue,
    })
  }

  const getMetricValue = (assetClass, fiscalYear, metric) =>
    targetsActuals.find(
      (row) => row.assetClass === assetClass && row.fiscalYear === fiscalYear
    )?.[metric] || 0

  return (
    <section className="view-panel">
      <h2>Targets &amp; Actuals</h2>

      <div className="commitment-input-panel">
        <div className="commitment-table-wrap">
          <table className="commitment-table targets-actuals-table">
            <thead>
              <tr>
                <th>Asset Class</th>
                <th>Metric</th>
                {fiscalYears.map((fiscalYear) => (
                  <th key={fiscalYear}>{fiscalYear}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {assetClasses.flatMap((assetClass) =>
                editableMetrics.map((metric, metricIndex) => (
                  <tr
                    key={`${assetClass}-${metric.key}`}
                    className={metricIndex === 0 ? 'asset-matrix-group-start' : ''}
                  >
                    {metricIndex === 0 && (
                      <td className="asset-matrix-asset-cell" rowSpan={editableMetrics.length}>
                        {assetClass}
                      </td>
                    )}
                    <td className="asset-matrix-metric-cell">{metric.label}</td>
                    {fiscalYears.map((fiscalYear) => (
                      <td key={`${assetClass}-${metric.key}-${fiscalYear}`}>
                        <input
                          type="number"
                          min="0"
                          step="1"
                          value={getMetricValue(assetClass, fiscalYear, metric.key)}
                          onChange={(event) =>
                            updateTargetActual(
                              assetClass,
                              fiscalYear,
                              metric.key,
                              event.target.value
                            )
                          }
                        />
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}

export default TargetsActuals
