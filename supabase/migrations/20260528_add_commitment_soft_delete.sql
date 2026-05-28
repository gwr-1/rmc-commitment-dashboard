alter table public.commitments
  add column if not exists deleted_at timestamptz;

create index if not exists commitments_active_sort_idx
  on public.commitments (fiscal_year, asset_class)
  where deleted_at is null;
