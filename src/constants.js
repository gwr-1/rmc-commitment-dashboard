export const assetClasses = ['PE', 'VC', 'NR', 'RE', 'NMA']
export const fiscalYears = ['FY26', 'FY27', 'FY28']
export const commitmentTypes = ['Fund', 'Co-Investment']
export const managerTypes = ['Current', 'New']
export const statusOptions = ['Closed', 'Pipeline', 'Under Review', 'Delayed', 'Removed']
export const changeTypes = ['Added', 'Edited', 'Deleted']

export const assetClassNames = {
  PE: 'Private Equity',
  VC: 'Venture Capital',
  NR: 'Natural Resources',
  RE: 'Real Estate',
  NMA: 'Non-Marketable Alternatives',
}

export const fieldLabels = {
  managerType: 'Current/New Mgr.',
  manager: 'Mgr. Name',
  commitmentType: 'Fund/Co-Investment',
  investmentName: 'Investment Name',
  targetAmount: 'Target ($mm)',
  status: 'Status',
  fiscalYear: 'Fiscal Year (Actual/Expected)',
}

export const assetChartMetrics = [
  { fiscalYear: 'FY26', metric: 'Commitments YTD', displayLabel: 'Commitments YTD' },
  { fiscalYear: 'FY26', metric: 'Normal Target' },
  { fiscalYear: 'FY26', metric: 'Calls YTD' },
  { fiscalYear: 'FY26', metric: 'Distributions YTD', displayLabel: 'Dist. YTD' },
  { fiscalYear: 'FY27', metric: 'Commitment Pipeline' },
  { fiscalYear: 'FY27', metric: 'Normal Target' },
  { fiscalYear: 'FY28', metric: 'Commitment Pipeline' },
  { fiscalYear: 'FY28', metric: 'Normal Target' },
]
