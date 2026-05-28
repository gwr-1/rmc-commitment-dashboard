import { formatTimestamp } from './calculations'

export const snapshotSelectColumns =
  'id, name, created_by, commitments, total_commitments, commitment_count, total_by_fiscal_year, total_by_asset_class, created_at'

export const mapSupabaseSnapshot = (snapshot) => ({
  id: snapshot.id,
  name: snapshot.name,
  createdAt: snapshot.created_at
    ? formatTimestamp(new Date(snapshot.created_at))
    : formatTimestamp(new Date()),
  createdBy: snapshot.created_by || 'Investment Team',
  commitments: snapshot.commitments || [],
  totalCommitments: Number(snapshot.total_commitments || 0),
  commitmentCount: Number(snapshot.commitment_count || 0),
  totalByFiscalYear: snapshot.total_by_fiscal_year || {},
  totalByAssetClass: snapshot.total_by_asset_class || {},
})

export const mapSnapshotToSupabase = (snapshot) => ({
  name: snapshot.name,
  created_by: snapshot.createdBy,
  commitments: snapshot.commitments,
  total_commitments: snapshot.totalCommitments,
  commitment_count: snapshot.commitmentCount,
  total_by_fiscal_year: snapshot.totalByFiscalYear,
  total_by_asset_class: snapshot.totalByAssetClass,
})
