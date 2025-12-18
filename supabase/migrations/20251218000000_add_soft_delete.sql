-- Add deleted_at column for soft deletes
alter table public.recaps add column if not exists deleted_at timestamp with time zone default null;

-- Create index for faster queries filtering out deleted recaps
create index if not exists recaps_deleted_at_idx on public.recaps(deleted_at) where deleted_at is null;

-- Update the select policy to only show non-deleted recaps by default
drop policy if exists "Users can view own recaps" on public.recaps;
create policy "Users can view own recaps"
  on public.recaps for select
  using (auth.uid() = user_id and deleted_at is null);

-- Add policy to allow viewing deleted recaps (for undo functionality)
create policy "Users can view own deleted recaps"
  on public.recaps for select
  using (auth.uid() = user_id and deleted_at is not null);
