-- Create profiles table
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text,
  name text,
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create recaps table
create table if not exists public.recaps (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  text text not null,
  mood text check (mood in ('great', 'good', 'neutral', 'bad', 'terrible')) not null,
  photo_url text,
  blocks jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create index for faster queries
create index if not exists recaps_user_id_idx on public.recaps(user_id);
create index if not exists recaps_created_at_idx on public.recaps(created_at desc);

-- Enable Row Level Security
alter table public.profiles enable row level security;
alter table public.recaps enable row level security;

-- Profiles policies
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- Recaps policies
create policy "Users can view own recaps"
  on public.recaps for select
  using (auth.uid() = user_id);

create policy "Users can insert own recaps"
  on public.recaps for insert
  with check (auth.uid() = user_id);

create policy "Users can update own recaps"
  on public.recaps for update
  using (auth.uid() = user_id);

create policy "Users can delete own recaps"
  on public.recaps for delete
  using (auth.uid() = user_id);

-- Function to handle new user creation
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'name', new.raw_user_meta_data->>'full_name'),
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to create profile on user signup
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Function to update updated_at timestamp
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

-- Triggers for updated_at
drop trigger if exists handle_profiles_updated_at on public.profiles;
create trigger handle_profiles_updated_at
  before update on public.profiles
  for each row execute procedure public.handle_updated_at();

drop trigger if exists handle_recaps_updated_at on public.recaps;
create trigger handle_recaps_updated_at
  before update on public.recaps
  for each row execute procedure public.handle_updated_at();
