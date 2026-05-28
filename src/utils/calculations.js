export const formatMillions = (amount) =>
  `$${Number(amount || 0).toLocaleString('en-US', {
    maximumFractionDigits: 2,
  })}M`

export const toMillions = (amount) => Number(amount || 0)

export const calculatePortfolioMetricTotal = (metric) => {
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

export const isClosedCommitment = (commitment) =>
  commitment.commitmentType === 'Co-Investment'
    ? commitment.status === 'Closed'
    : commitment.status === 'Submitted/Closed'

export const calculateCommitmentTotal = (commitments, predicate = () => true) =>
  commitments
    .filter(predicate)
    .reduce((total, commitment) => total + Number(commitment.targetAmount || 0), 0)

export const targetActualMetricNames = ['Normal Target', 'Calls YTD', 'Distributions YTD']

export const createTargetsActualsRows = (metrics, fiscalYears, assetClasses) =>
  fiscalYears.flatMap((fiscalYear) =>
    assetClasses.map((assetClass) => {
      const row = {
        id: `${fiscalYear}-${assetClass}`,
        fiscalYear,
        assetClass,
      }

      targetActualMetricNames.forEach((metricName) => {
        const metricRow = metrics.find(
          (metric) => metric.fiscalYear === fiscalYear && metric.metric === metricName
        )
        row[metricName] = Number(metricRow?.[assetClass] || 0)
      })

      return row
    })
  )

export const targetsActualsRowsToPortfolioMetrics = (rows, fiscalYears, assetClasses) =>
  fiscalYears.flatMap((fiscalYear) =>
    targetActualMetricNames.map((metricName) => {
      const metricRow = {
        fiscalYear,
        metric: metricName,
        Pipeline: 0,
      }

      assetClasses.forEach((assetClass) => {
        const row = rows.find(
          (targetRow) =>
            targetRow.fiscalYear === fiscalYear && targetRow.assetClass === assetClass
        )
        metricRow[assetClass] = Number(row?.[metricName] || 0)
      })

      return metricRow
    })
  )

export const formatTimestamp = (date) =>
  date
    .toLocaleString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
    .replace(',', '')

export const formatChangeValue = (field, value) => {
  if (field === 'targetAmount') return formatMillions(value)
  return String(value || '-')
}
