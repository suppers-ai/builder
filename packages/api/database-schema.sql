-- =============================================
-- Supabase Database Schema (Idempotent Version)
-- =============================================

-- Enable Row Level Security
alter default privileges revoke execute on functions from public;

-- =============================================
-- EXTENSIONS
-- =============================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Enable pgcrypto for password hashing
create extension if not exists "pgcrypto";

-- =============================================
-- CUSTOM TYPES (Idempotent)
-- =============================================

-- Application status enum
do $$ 
begin
    if not exists (select 1 from pg_type where typname = 'application_status') then
        create type application_status as enum ('draft', 'pending', 'published', 'archived');
    end if;
end $$;

-- User role enum for admin permissions
do $$ 
begin
    if not exists (select 1 from pg_type where typname = 'user_role') then
        create type user_role as enum ('user', 'admin');
    end if;
end $$;

-- Access level enum  
do $$ 
begin
    if not exists (select 1 from pg_type where typname = 'access_level') then
        create type access_level as enum ('read', 'write', 'admin');
    end if;
end $$;

-- =============================================
-- TABLES
-- =============================================

-- User table (renamed from profiles for better clarity)
create table if not exists public.users (
  id uuid references auth.users on delete cascade primary key,
  email text unique not null,
  first_name text,
  middle_names text,
  last_name text,
  display_name text,
  avatar_url text,
  theme_id text, -- This could be a default theme id or a custom theme id
  role user_role default 'user'::user_role not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Add missing columns to existing tables (idempotent)
do $$ 
begin
    -- Add role column to users table if it doesn't exist
    if not exists (select 1 from information_schema.columns 
                   where table_name = 'users' and column_name = 'role' and table_schema = 'public') then
        alter table public.users add column role user_role default 'user'::user_role not null;
    end if;
end $$;

-- Applications table
create table if not exists public.applications (
  id uuid default uuid_generate_v4() primary key,
  owner_id uuid references public.users(id) on delete cascade not null,
  name text not null,
  description text,
  template_id text not null,
  configuration jsonb default '{}'::jsonb not null,
  status application_status default 'draft'::application_status not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- User access table for application sharing
create table if not exists public.user_access (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  application_id uuid references public.applications(id) on delete cascade not null,
  access_level access_level not null,
  granted_at timestamp with time zone default timezone('utc'::text, now()) not null,
  granted_by uuid references public.users(id) on delete cascade not null,
  unique(user_id, application_id)
);

-- OAuth authorization codes for external apps
create table if not exists public.oauth_codes (
  id uuid default uuid_generate_v4() primary key,
  code text unique not null,
  client_id text not null,
  redirect_uri text not null,
  scope text not null,
  state text,
  expires_at timestamp with time zone not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- OAuth access tokens for external apps  
create table if not exists public.oauth_tokens (
  id uuid default uuid_generate_v4() primary key,
  access_token text unique not null,
  refresh_token text unique,
  client_id text not null,
  user_id uuid references public.users(id) on delete cascade,
  scope text not null,
  expires_at timestamp with time zone not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- OAuth clients (external apps)
create table if not exists public.oauth_clients (
  id uuid default uuid_generate_v4() primary key,
  client_id text unique not null,
  client_secret text not null,
  name text not null,
  description text,
  redirect_uris text[] not null,
  allowed_scopes text[] not null,
  created_by uuid references public.users(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Application reviews table for admin feedback
create table if not exists public.application_reviews (
  id uuid default uuid_generate_v4() primary key,
  application_id uuid references public.applications(id) on delete cascade not null,
  reviewer_id uuid references public.users(id) on delete cascade not null,
  action text not null check (action in ('approved', 'rejected')),
  feedback text,
  reviewed_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Custom themes table for user-created themes
create table if not exists public.custom_themes (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  label text not null,
  description text,
  variables jsonb not null default '{}'::jsonb,
  created_by uuid references public.users(id) on delete cascade not null,
  is_public boolean default false not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  constraint unique_theme_name_per_user unique(created_by, name),
  constraint valid_theme_variables check (jsonb_typeof(variables) = 'object')
);

-- =============================================
-- ROW LEVEL SECURITY POLICIES (Idempotent)
-- =============================================

-- Enable RLS on all tables
alter table public.users enable row level security;
alter table public.applications enable row level security;
alter table public.user_access enable row level security;
alter table public.oauth_codes enable row level security;
alter table public.oauth_tokens enable row level security;
alter table public.oauth_clients enable row level security;
alter table public.application_reviews enable row level security;
alter table public.custom_themes enable row level security;

-- Drop all existing policies to ensure clean state
drop policy if exists "Users can view own profile" on public.users;
drop policy if exists "Users can update own profile" on public.users;
drop policy if exists "Users can insert own profile" on public.users;

drop policy if exists "Users can view own applications" on public.applications;
drop policy if exists "Anyone can view published applications" on public.applications;
drop policy if exists "Users can create own applications" on public.applications;
drop policy if exists "Users can update own applications" on public.applications;
drop policy if exists "Users can delete own applications" on public.applications;

drop policy if exists "Users can view access records for their applications" on public.user_access;
drop policy if exists "Application owners can grant access" on public.user_access;
drop policy if exists "Application owners can revoke access" on public.user_access;

drop policy if exists "Service role can manage oauth codes" on public.oauth_codes;
drop policy if exists "Service role can manage oauth tokens" on public.oauth_tokens;

drop policy if exists "Users can view own oauth clients" on public.oauth_clients;
drop policy if exists "Users can create oauth clients" on public.oauth_clients;
drop policy if exists "Users can update own oauth clients" on public.oauth_clients;
drop policy if exists "Users can delete own oauth clients" on public.oauth_clients;

drop policy if exists "Admins can view all reviews" on public.application_reviews;
drop policy if exists "Application owners can view reviews of their apps" on public.application_reviews;
drop policy if exists "Admins can create reviews" on public.application_reviews;
drop policy if exists "Admins can update their reviews" on public.application_reviews;

drop policy if exists "Users can view own themes" on public.custom_themes;
drop policy if exists "Anyone can view public themes" on public.custom_themes;
drop policy if exists "Users can create themes" on public.custom_themes;
drop policy if exists "Users can update own themes" on public.custom_themes;
drop policy if exists "Users can delete own themes" on public.custom_themes;

-- Users policies
create policy "Users can view own profile"
  on public.users for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.users for update
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.users for insert
  with check (auth.uid() = id);

-- Applications policies
create policy "Users can view own applications"
  on public.applications for select
  using (
    auth.uid() = owner_id or
    auth.uid() in (
      select user_id from public.user_access 
      where application_id = applications.id
    ) or
    -- Admins can view all applications
    auth.uid() in (
      select id from public.users where role = 'admin'
    )
  );

-- Separate policy for public to view published applications
create policy "Anyone can view published applications"
  on public.applications for select
  using (status = 'published');

create policy "Users can create own applications"
  on public.applications for insert
  with check (auth.uid() = owner_id);

create policy "Users can update own applications"
  on public.applications for update
  using (
    auth.uid() = owner_id or
    auth.uid() in (
      select user_id from public.user_access 
      where application_id = applications.id 
      and access_level in ('write', 'admin')
    ) or
    -- Admins can update any application (for status changes)
    auth.uid() in (
      select id from public.users where role = 'admin'
    )
  );

create policy "Users can delete own applications"
  on public.applications for delete
  using (auth.uid() = owner_id);

-- User access policies
create policy "Users can view access records for their applications"
  on public.user_access for select
  using (
    auth.uid() = user_id or
    auth.uid() in (
      select owner_id from public.applications 
      where id = user_access.application_id
    )
  );

create policy "Application owners can grant access"
  on public.user_access for insert
  with check (
    auth.uid() in (
      select owner_id from public.applications 
      where id = application_id
    )
  );

create policy "Application owners can revoke access"
  on public.user_access for delete
  using (
    auth.uid() in (
      select owner_id from public.applications 
      where id = application_id
    )
  );

-- OAuth codes policies (service role only)
create policy "Service role can manage oauth codes"
  on public.oauth_codes for all
  using (auth.role() = 'service_role');

-- OAuth tokens policies (service role only)  
create policy "Service role can manage oauth tokens"
  on public.oauth_tokens for all
  using (auth.role() = 'service_role');

-- OAuth clients policies
create policy "Users can view own oauth clients"
  on public.oauth_clients for select
  using (auth.uid() = created_by);

create policy "Users can create oauth clients"
  on public.oauth_clients for insert
  with check (auth.uid() = created_by);

create policy "Users can update own oauth clients"
  on public.oauth_clients for update
  using (auth.uid() = created_by);

create policy "Users can delete own oauth clients"
  on public.oauth_clients for delete
  using (auth.uid() = created_by);

-- Application reviews policies
create policy "Admins can view all reviews"
  on public.application_reviews for select
  using (
    auth.uid() in (
      select id from public.users where role = 'admin'
    )
  );

create policy "Application owners can view reviews of their apps"
  on public.application_reviews for select
  using (
    auth.uid() in (
      select owner_id from public.applications 
      where id = application_reviews.application_id
    )
  );

create policy "Admins can create reviews"
  on public.application_reviews for insert
  with check (
    auth.uid() in (
      select id from public.users where role = 'admin'
    ) and
    auth.uid() = reviewer_id
  );

create policy "Admins can update their reviews"
  on public.application_reviews for update
  using (
    auth.uid() in (
      select id from public.users where role = 'admin'
    ) and
    auth.uid() = reviewer_id
  );

-- Custom themes policies
create policy "Users can view own themes"
  on public.custom_themes for select
  using (auth.uid() = created_by);

create policy "Anyone can view public themes"
  on public.custom_themes for select
  using (is_public = true);

create policy "Users can create themes"
  on public.custom_themes for insert
  with check (auth.uid() = created_by);

create policy "Users can update own themes"
  on public.custom_themes for update
  using (auth.uid() = created_by);

create policy "Users can delete own themes"
  on public.custom_themes for delete
  using (auth.uid() = created_by);

-- =============================================
-- FUNCTIONS
-- =============================================

-- Function to handle user profile creation
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.users (id, email, first_name, last_name, display_name, avatar_url, theme_id)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'first_name',
    new.raw_user_meta_data->>'last_name',
    new.raw_user_meta_data->>'display_name',
    new.raw_user_meta_data->>'avatar_url',
    new.raw_user_meta_data->>'theme_id'
  );
  return new;
end;
$$;

-- Function to handle profile updates
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$;

-- Function to cleanup expired OAuth codes and tokens
create or replace function public.cleanup_expired_oauth()
returns void
language plpgsql
security definer
as $$
begin
  -- Delete expired authorization codes
  delete from public.oauth_codes 
  where expires_at < now();
  
  -- Delete expired access tokens
  delete from public.oauth_tokens 
  where expires_at < now();
end;
$$;

-- =============================================
-- TRIGGERS (Idempotent)
-- =============================================

-- Drop existing triggers if they exist to avoid conflicts
drop trigger if exists on_auth_user_created on auth.users;
drop trigger if exists handle_updated_at_users on public.users;
drop trigger if exists handle_updated_at_applications on public.applications;
drop trigger if exists handle_updated_at_oauth_clients on public.oauth_clients;
drop trigger if exists handle_updated_at_custom_themes on public.custom_themes;

-- Trigger for new user registration
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Triggers for updated_at timestamps
create trigger handle_updated_at_users
  before update on public.users
  for each row execute procedure public.handle_updated_at();

create trigger handle_updated_at_applications
  before update on public.applications
  for each row execute procedure public.handle_updated_at();

create trigger handle_updated_at_oauth_clients
  before update on public.oauth_clients
  for each row execute procedure public.handle_updated_at();

create trigger handle_updated_at_custom_themes
  before update on public.custom_themes
  for each row execute procedure public.handle_updated_at();

-- =============================================
-- STORAGE (Idempotent)
-- =============================================

-- Create avatars bucket (only if it doesn't exist)
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

-- Drop existing storage policies to ensure clean state
drop policy if exists "Avatar images are publicly accessible." on storage.objects;
drop policy if exists "Anyone can view avatar images." on storage.objects;
drop policy if exists "Users can upload avatar images." on storage.objects;
drop policy if exists "Users can update own avatar images." on storage.objects;
drop policy if exists "Users can delete own avatar images." on storage.objects;

-- Set up avatar storage policies
create policy "Avatar images are publicly accessible."
  on storage.objects for select
  using (bucket_id = 'avatars');

create policy "Anyone can view avatar images."
  on storage.objects for select
  using (bucket_id = 'avatars');

create policy "Users can upload avatar images."
  on storage.objects for insert
  with check (
    bucket_id = 'avatars' and
    auth.role() = 'authenticated' and
    auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users can update own avatar images."
  on storage.objects for update
  using (
    bucket_id = 'avatars' and
    auth.role() = 'authenticated' and
    auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users can delete own avatar images."
  on storage.objects for delete
  using (
    bucket_id = 'avatars' and
    auth.role() = 'authenticated' and
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- =============================================
-- INDEXES
-- =============================================

-- Performance indexes
create index if not exists idx_applications_owner_id on public.applications(owner_id);
create index if not exists idx_applications_status on public.applications(status);
create index if not exists idx_applications_template_id on public.applications(template_id);
create index if not exists idx_applications_created_at on public.applications(created_at desc);
create index if not exists idx_user_access_user_id on public.user_access(user_id);
create index if not exists idx_user_access_application_id on public.user_access(application_id);
create index if not exists idx_oauth_codes_client_id on public.oauth_codes(client_id);
create index if not exists idx_oauth_codes_expires_at on public.oauth_codes(expires_at);
create index if not exists idx_oauth_tokens_client_id on public.oauth_tokens(client_id);
create index if not exists idx_oauth_tokens_expires_at on public.oauth_tokens(expires_at);
create index if not exists idx_oauth_clients_client_id on public.oauth_clients(client_id);
create index if not exists idx_application_reviews_application_id on public.application_reviews(application_id);
create index if not exists idx_application_reviews_reviewer_id on public.application_reviews(reviewer_id);
create index if not exists idx_users_role on public.users(role);
create index if not exists idx_custom_themes_created_by on public.custom_themes(created_by);
create index if not exists idx_custom_themes_is_public on public.custom_themes(is_public);
create index if not exists idx_custom_themes_name on public.custom_themes(name);
create index if not exists idx_custom_themes_created_at on public.custom_themes(created_at desc);

-- =============================================
-- SCHEDULED CLEANUP
-- =============================================

-- Schedule cleanup of expired OAuth codes and tokens (requires pg_cron extension)
-- Uncomment if pg_cron is available:
-- select cron.schedule('cleanup-expired-oauth', '0 * * * *', 'select public.cleanup_expired_oauth();');

-- =============================================
-- INITIAL DATA (OPTIONAL)
-- =============================================

-- Example OAuth clients for development (only create if users exist)
do $$
begin
  if exists (select 1 from auth.users limit 1) then
    insert into public.oauth_clients (client_id, client_secret, name, description, redirect_uris, allowed_scopes, created_by) values
    ('mobile-app-client', 'dev-secret-123', 'Mobile App', 'Development mobile application', 
     array['com.yourapp://callback', 'http://localhost:3000/callback'], 
     array['openid', 'email', 'profile'], 
     (select id from auth.users limit 1))
    on conflict (client_id) do nothing;

    insert into public.oauth_clients (client_id, client_secret, name, description, redirect_uris, allowed_scopes, created_by) values
    ('external-web-app', 'dev-secret-456', 'External Web App', 'Development web application',
     array['https://external-app.com/auth/callback', 'http://localhost:8080/callback'],
     array['openid', 'email', 'profile', 'applications:read'],
     (select id from auth.users limit 1))
    on conflict (client_id) do nothing;
  end if;
end $$; 