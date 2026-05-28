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
