-- Create feedback table
create table if not exists public.feedback (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade,
  rating smallint not null check (rating >= 1 and rating <= 5),
  message text,
  created_at timestamp with time zone default now() not null
);

-- Create index for querying by user
create index if not exists feedback_user_id_idx on public.feedback(user_id);

-- Enable RLS
alter table public.feedback enable row level security;

-- Users can insert their own feedback
create policy "Users can insert own feedback"
  on public.feedback for insert
  with check (auth.uid() = user_id);

-- Users can view their own feedback
create policy "Users can view own feedback"
  on public.feedback for select
  using (auth.uid() = user_id);

-- Allow anonymous feedback (user_id can be null)
create policy "Anonymous users can insert feedback"
  on public.feedback for insert
  with check (user_id is null);
