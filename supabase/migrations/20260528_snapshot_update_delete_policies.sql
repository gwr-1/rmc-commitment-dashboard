do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'snapshots'
      and policyname = 'Authenticated users can update snapshots'
  ) then
    create policy "Authenticated users can update snapshots"
      on public.snapshots
      for update
      to authenticated
      using (true)
      with check (true);
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'snapshots'
      and policyname = 'Authenticated users can delete snapshots'
  ) then
    create policy "Authenticated users can delete snapshots"
      on public.snapshots
      for delete
      to authenticated
      using (true);
  end if;
end $$;
