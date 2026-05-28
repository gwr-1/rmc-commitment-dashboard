export const assetClasses = ['PE', 'VC', 'NR', 'RE', 'NMA']
export const fiscalYears = ['FY26', 'FY27', 'FY28']
export const commitmentTypes = ['Fund', 'Co-Investment']
export const managerTypes = ['Current', 'New']
export const fundStatusOptions = [
  'Anticipated but not in the market',
  'In the market',
  'Approved but not submitted',
  'Submitted/Closed',
]
export const coInvestmentStatusOptions = [
  'Longer Term Prospects',
  'Under Consideration',
  'Closed',
]
export const statusOptions = [...fundStatusOptions, ...coInvestmentStatusOptions]
export const changeTypes = ['Added', 'Edited', 'Deleted']

export const assetClassNames = {
  PE: 'Private Equity',
  VC: 'Venture Capital',
  NR: 'Natural Resources',
  RE: 'Real Estate',
  NMA: 'Non-Marketable Alternatives',
}

export const fieldLabels = {
  assetClass: 'Asset Class',
  managerType: 'Manager Type',
  manager: 'Manager',
  commitmentType: 'Commitment Type',
  investmentName: 'Investment',
  targetAmount: 'Target ($mm)',
  status: 'Status',
  fiscalYear: 'Fiscal Year',
}

export const assetChartMetrics = [
  { fiscalYear: 'FY26', metric: 'Commitments YTD', displayLabel: 'Commitments YTD' },
  { fiscalYear: 'FY26', metric: 'Pipeline' },
  { fiscalYear: 'FY26', metric: 'Normal Target' },
  { fiscalYear: 'FY26', metric: 'Calls YTD' },
  { fiscalYear: 'FY26', metric: 'Distributions YTD', displayLabel: 'Dist. YTD' },
  { fiscalYear: 'FY27', metric: 'Commitment Pipeline' },
  { fiscalYear: 'FY27', metric: 'Normal Target' },
  { fiscalYear: 'FY28', metric: 'Commitment Pipeline' },
  { fiscalYear: 'FY28', metric: 'Normal Target' },
]
