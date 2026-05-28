export const commitmentSelectColumns =
  'id, fiscal_year, asset_class, manager_type, manager_name, investment_name, commitment_type, target_amount, status'

export const commitmentFieldColumns = {
  fiscalYear: 'fiscal_year',
  assetClass: 'asset_class',
  managerType: 'manager_type',
  manager: 'manager_name',
  investmentName: 'investment_name',
  commitmentType: 'commitment_type',
  targetAmount: 'target_amount',
  status: 'status',
}

export const mapSupabaseCommitment = (commitment) => ({
  id: commitment.id,
  fiscalYear: commitment.fiscal_year,
  assetClass: commitment.asset_class,
  managerType: commitment.manager_type,
  manager: commitment.manager_name,
  investmentName: commitment.investment_name,
  commitmentType: commitment.commitment_type,
  targetAmount: Number(commitment.target_amount || 0),
  status: commitment.status,
})

export const mapCommitmentToSupabase = (commitment) => ({
  fiscal_year: commitment.fiscalYear,
  asset_class: commitment.assetClass,
  manager_type: commitment.managerType,
  manager_name: commitment.manager,
  investment_name: commitment.investmentName,
  commitment_type: commitment.commitmentType,
  target_amount: commitment.targetAmount,
  status: commitment.status,
})
