import { formatTimestamp } from './calculations'

export const mapSupabaseChange = (change) => ({
  id: change.id,
  timestamp: change.created_at
    ? formatTimestamp(new Date(change.created_at))
    : formatTimestamp(new Date()),
  assetClass: change.asset_class || '-',
  fiscalYear: change.fiscal_year || '-',
  manager: change.manager_name || '-',
  investmentName: change.investment_name || '-',
  changeType: change.change_type || 'Edited',
  fieldChanged: change.field_changed || 'Commitment',
  oldValue: change.old_value || '-',
  newValue: change.new_value || '-',
  changedBy: change.changed_by || 'Investment Team',
})

export const mapChangeToSupabase = ({
  commitmentId,
  changeType,
  fieldChanged,
  oldValue,
  newValue,
  assetClass,
  fiscalYear,
  manager,
  investmentName,
  changedBy = 'Investment Team',
}) => ({
  commitment_id: commitmentId,
  change_type: changeType,
  field_changed: fieldChanged,
  old_value: oldValue,
  new_value: newValue,
  changed_by: changedBy,
  asset_class: assetClass,
  fiscal_year: fiscalYear,
  manager_name: manager,
  investment_name: investmentName,
})
