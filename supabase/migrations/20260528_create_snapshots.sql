create table if not exists public.snapshots (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_by text not null default 'Investment Team',
  commitments jsonb not null default '[]'::jsonb,
  total_commitments numeric not null default 0,
  commitment_count integer not null default 0,
  total_by_fiscal_year jsonb not null default '{}'::jsonb,
  total_by_asset_class jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists snapshots_created_at_idx
  on public.snapshots (created_at desc);
