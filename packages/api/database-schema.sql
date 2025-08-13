-- =============================================
-- Supabase Database Schema (Idempotent Version) 
-- Uses Supabase's built-in auth.users with user_metadata only
-- =============================================
--
-- STORAGE POLICIES SETUP:
-- This schema includes storage policies that require elevated permissions.
-- 
-- Option 1 (Recommended): Run with service_role connection
--   psql "postgresql://postgres:[password]@[host]:5432/postgres" -f database-schema.sql
--
-- Option 2: Run in Supabase Dashboard SQL Editor
--   Copy and paste this entire file into the SQL Editor and run
--
-- Option 3: If you get permission errors
--   The script will create the storage bucket but warn about policies
--   You can then create the policies manually through the Dashboard
--
-- File Organization: userId/applicationSlug/filename
-- Example: 550e8400-e29b-41d4-a716-446655440000/my-blog/config/settings.json
--

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

-- =============================================
-- USERS TABLE
-- =============================================

-- Note: Main users table is defined below in the TABLES section

-- Add bandwidth columns if they don't exist (for backward compatibility)
do $$ 
begin
    if not exists (
        select 1 from information_schema.columns 
        where table_schema = 'public' 
        and table_name = 'users' 
        and column_name = 'bandwidth_used'
    ) then
        alter table public.users add column bandwidth_used bigint default 0 not null;
    end if;
    
    if not exists (
        select 1 from information_schema.columns 
        where table_schema = 'public' 
        and table_name = 'users' 
        and column_name = 'bandwidth_limit'
    ) then
        alter table public.users add column bandwidth_limit bigint default (250 * 1024 * 1024) not null;
    end if;
end $$;

-- Function to handle user creation/updates
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.users (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', new.email),
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do update set
    email = excluded.email,
    full_name = excluded.full_name,
    avatar_url = excluded.avatar_url,
    updated_at = now();
  return new;
end;
$$;

-- Function to increment user storage usage
create or replace function public.increment_user_storage(user_id uuid, size_delta bigint)
returns void
language plpgsql
security definer set search_path = public
as $$
begin
  update public.users 
  set storage_used = storage_used + size_delta,
      updated_at = now()
  where id = user_id;
end;
$$;

-- Function to increment user bandwidth usage
create or replace function public.increment_user_bandwidth(user_id uuid, bandwidth_delta bigint)
returns void
language plpgsql
security definer set search_path = public
as $$
begin
  update public.users 
  set bandwidth_used = bandwidth_used + bandwidth_delta,
      updated_at = now()
  where id = user_id;
end;
$$;

-- Function to reset all users' monthly bandwidth usage (for cronjob)
create or replace function public.reset_monthly_bandwidth()
returns void
language plpgsql
security definer set search_path = public
as $$
begin
  update public.users 
  set bandwidth_used = 0,
      updated_at = now();
end;
$$;

-- Trigger to sync auth.users with public.users
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert or update on auth.users
  for each row execute function public.handle_new_user();

-- User role enum for admin permissions (stored in auth.users.user_metadata)
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

-- Review status enum
do $$ 
begin
    if not exists (select 1 from pg_type where typname = 'review_status') then
        create type review_status as enum ('pending', 'approved', 'rejected');
    end if;
end $$;

-- =============================================
-- TABLES
-- =============================================

-- Users table for storing user profile data
create table if not exists public.users (
  id uuid references auth.users(id) on delete cascade primary key,
  email text not null,
  first_name text,
  last_name text,
  display_name text,
  avatar_url text,
  theme_id text,
  stripe_customer_id text,
  storage_used bigint default 0 not null, -- Total storage used in bytes
  storage_limit bigint default (250 * 1024 * 1024) not null, -- Storage limit in bytes (default 250MB)
  bandwidth_used bigint default 0 not null, -- Total bandwidth used in bytes (monthly)
  bandwidth_limit bigint default (250 * 1024 * 1024) not null, -- Bandwidth limit in bytes (default 250MB per month)
  role user_role default 'user'::user_role not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Applications table
create table if not exists public.applications (
  id uuid default uuid_generate_v4() primary key,
  slug text not null,
  owner_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  description text,
  template_id text,
  configuration jsonb default '{}'::jsonb not null,
  status application_status default 'draft'::application_status not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(owner_id, slug)
);

-- Storage objects table for all file types (recordings, images, documents, etc.)
create table if not exists public.storage_objects (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  file_path text not null,
  file_size bigint not null, -- File size in bytes
  mime_type text not null, -- MIME type of the file
  object_type text not null, -- Type category: 'recording', 'image', 'document', etc.
  metadata jsonb default '{}'::jsonb not null, -- Flexible metadata (duration for videos, dimensions for images, etc.)
  is_public boolean default false not null, -- Public access without authentication
  share_token text unique, -- Random token for private sharing
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- User access table for application sharing
create table if not exists public.user_access (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  application_id uuid references public.applications(id) on delete cascade not null,
  access_level access_level not null,
  granted_at timestamp with time zone default timezone('utc'::text, now()) not null,
  granted_by uuid references auth.users(id) on delete cascade not null,
  unique(user_id, application_id)
);

-- Application reviews table for admin review process
create table if not exists public.application_reviews (
  id uuid default uuid_generate_v4() primary key,
  application_id uuid references public.applications(id) on delete cascade not null,
  reviewer_id uuid references auth.users(id) on delete cascade not null,
  status review_status not null,
  feedback text,
  reviewed_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(application_id, reviewer_id)
);

-- Custom themes table for theme management
create table if not exists public.custom_themes (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  description text,
  theme_data jsonb not null,
  is_public boolean default false not null,
  created_by uuid references auth.users(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- =============================================
-- ROW LEVEL SECURITY
-- =============================================

-- Enable RLS on all tables
alter table public.users enable row level security;
alter table public.applications enable row level security;
alter table public.storage_objects enable row level security;
alter table public.user_access enable row level security;
alter table public.application_reviews enable row level security;
alter table public.custom_themes enable row level security;

-- Drop all existing policies to ensure clean state

drop policy if exists "Users can view their own profile" on public.users;
drop policy if exists "Users can update their own profile" on public.users;
drop policy if exists "Users can insert their own profile" on public.users;

drop policy if exists "Users can view their own applications" on public.applications;
drop policy if exists "Users can insert their applications" on public.applications;
drop policy if exists "Users can update their applications" on public.applications;
drop policy if exists "Users can delete their applications" on public.applications;
drop policy if exists "Admins can view all applications" on public.applications;
drop policy if exists "Users can view published applications" on public.applications;
drop policy if exists "Users can view their own storage objects" on public.storage_objects;
drop policy if exists "Users can insert their own storage objects" on public.storage_objects;
drop policy if exists "Users can update their own storage objects" on public.storage_objects;
drop policy if exists "Users can delete their own storage objects" on public.storage_objects;

drop policy if exists "Users can view access to applications they own" on public.user_access;
drop policy if exists "Users can view their own access grants" on public.user_access;
drop policy if exists "Application owners can grant access" on public.user_access;
drop policy if exists "Application owners can revoke access" on public.user_access;

drop policy if exists "Admins can view all reviews" on public.application_reviews;
drop policy if exists "Application owners can view reviews of their apps" on public.application_reviews;
drop policy if exists "Admins can create reviews" on public.application_reviews;
drop policy if exists "Admins can update their reviews" on public.application_reviews;
drop policy if exists "Admins can delete reviews" on public.application_reviews;

drop policy if exists "Users can view public themes" on public.custom_themes;
drop policy if exists "Users can view their own themes" on public.custom_themes;
drop policy if exists "Users can create themes" on public.custom_themes;
drop policy if exists "Users can update their own themes" on public.custom_themes;
drop policy if exists "Users can delete their own themes" on public.custom_themes;
drop policy if exists "Admins can manage all themes" on public.custom_themes;

-- =============================================
-- POLICIES
-- =============================================

-- Note: Admin checks are handled at the application level, not in RLS policies
-- This prevents infinite recursion issues with the public.users table

-- Users policies
create policy "Users can view their own profile"
  on public.users for select
  using (id = auth.uid());

create policy "Users can insert their own profile"
  on public.users for insert
  with check (id = auth.uid());

create policy "Users can update their own profile"
  on public.users for update
  using (id = auth.uid());

-- Applications policies
create policy "Users can view their own applications"
  on public.applications for select
  using (owner_id = auth.uid());

create policy "Users can view published applications"
  on public.applications for select
  using (status = 'published');

create policy "Users can insert their applications"
  on public.applications for insert
  with check (owner_id = auth.uid());

create policy "Users can update their applications"
  on public.applications for update
  using (
    owner_id = auth.uid() OR
    exists (
      select 1 from public.user_access
      where user_id = auth.uid() and application_id = applications.id and access_level in ('write', 'admin')
    )
  );

create policy "Users can delete their applications"
  on public.applications for delete
  using (owner_id = auth.uid());

-- Admin operations are handled at the application level
-- No RLS policy needed for admin access to all applications

-- Storage objects policies
create policy "Users can view their own storage objects"
  on public.storage_objects for select
  using (user_id = auth.uid());

create policy "Anyone can view public storage objects"
  on public.storage_objects for select
  using (is_public = true);

create policy "Anyone can view shared storage objects with token"
  on public.storage_objects for select
  using (share_token is not null);

create policy "Users can insert their own storage objects"
  on public.storage_objects for insert
  with check (user_id = auth.uid());

create policy "Users can update their own storage objects"
  on public.storage_objects for update
  using (user_id = auth.uid());

create policy "Users can delete their own storage objects"
  on public.storage_objects for delete
  using (user_id = auth.uid());

-- User access policies
create policy "Users can view access to applications they own"
  on public.user_access for select
  using (
    exists (
      select 1 from public.applications
      where id = application_id and owner_id = auth.uid()
    )
  );

create policy "Users can view their own access grants"
  on public.user_access for select
  using (user_id = auth.uid());

create policy "Application owners can grant access"
  on public.user_access for insert
  with check (
    exists (
      select 1 from public.applications
      where id = application_id and owner_id = auth.uid()
    )
  );

create policy "Application owners can revoke access"
  on public.user_access for delete
  using (
    exists (
      select 1 from public.applications
      where id = application_id and owner_id = auth.uid()
    )
  );

-- Application reviews policies
create policy "Application owners can view reviews of their apps"
  on public.application_reviews for select
  using (
    exists (
      select 1 from public.applications
      where id = application_id and owner_id = auth.uid()
    )
  );

-- Admin operations for reviews are handled at the application level
-- No RLS policies needed for admin access to reviews

-- Custom themes policies
create policy "Users can view public themes"
  on public.custom_themes for select
  using (is_public = true OR created_by = auth.uid());

create policy "Users can view their own themes"
  on public.custom_themes for select
  using (created_by = auth.uid());

create policy "Users can create themes"
  on public.custom_themes for insert
  with check (created_by = auth.uid());

create policy "Users can update their own themes"
  on public.custom_themes for update
  using (created_by = auth.uid());

create policy "Users can delete their own themes"
  on public.custom_themes for delete
  using (created_by = auth.uid());

-- Admin operations for themes are handled at the application level
-- No RLS policy needed for admin access to themes

-- =============================================
-- FUNCTIONS
-- =============================================

-- No user creation trigger needed - using Supabase auth.users directly

-- Function to handle updated_at timestamp
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- =============================================
-- TRIGGERS
-- =============================================

-- Drop existing triggers
drop trigger if exists on_auth_user_created on auth.users;
drop trigger if exists handle_updated_at_users on public.users;
drop trigger if exists handle_updated_at_applications on public.applications;
drop trigger if exists handle_updated_at_custom_themes on public.custom_themes;

-- Triggers for updated_at timestamp

create trigger handle_updated_at_users
  before update on public.users
  for each row execute procedure public.handle_updated_at();

create trigger handle_updated_at_applications
  before update on public.applications
  for each row execute procedure public.handle_updated_at();

create trigger handle_updated_at_custom_themes
  before update on public.custom_themes
  for each row execute procedure public.handle_updated_at();

-- =============================================
-- INDEXES
-- =============================================

-- Users indexes
create index if not exists idx_users_email on public.users(email);
create index if not exists idx_users_role on public.users(role);

-- Applications indexes
create index if not exists idx_applications_owner_id on public.applications(owner_id);
create index if not exists idx_applications_status on public.applications(status);
create index if not exists idx_applications_slug on public.applications(slug);
create index if not exists idx_applications_template_id on public.applications(template_id);
create index if not exists idx_applications_created_at on public.applications(created_at);

-- User access indexes
create index if not exists idx_user_access_user_id on public.user_access(user_id);
create index if not exists idx_user_access_application_id on public.user_access(application_id);

-- Application reviews indexes
create index if not exists idx_application_reviews_application_id on public.application_reviews(application_id);
create index if not exists idx_application_reviews_reviewer_id on public.application_reviews(reviewer_id);

-- Custom themes indexes
create index if not exists idx_custom_themes_created_by on public.custom_themes(created_by);
create index if not exists idx_custom_themes_is_public on public.custom_themes(is_public);

-- =============================================
-- STORAGE BUCKETS AND POLICIES
-- =============================================

-- Create application storage bucket
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values 
  ('application-files', 'application-files', false, 52428800, array['image/*', 'text/*', 'application/json', 'application/pdf', 'video/*', 'audio/*'])
on conflict (id) do nothing;

-- Storage policies for application files
-- Drop existing policies if they exist
drop policy if exists "Users can upload files to their own applications" on storage.objects;
drop policy if exists "Users can view files in their own applications" on storage.objects;
drop policy if exists "Application collaborators can view files" on storage.objects;
drop policy if exists "Application collaborators can upload files" on storage.objects;
drop policy if exists "Users can delete files in their own applications" on storage.objects;
drop policy if exists "Application collaborators can delete files" on storage.objects;
drop policy if exists "Users can update files in their own applications" on storage.objects;
drop policy if exists "Application collaborators can update files" on storage.objects;
drop policy if exists "Admins can manage all storage files" on storage.objects;

-- Drop the simple folder-based policies
drop policy if exists "Users can upload files to their own folders" on storage.objects;
drop policy if exists "Users can view files in their own folders" on storage.objects;
drop policy if exists "Users can update files in their own folders" on storage.objects;
drop policy if exists "Users can delete files in their own folders" on storage.objects;

-- Create simple storage policies that don't query any tables
create policy "Users can upload files to their own folders"
  on storage.objects for insert 
  with check (
    bucket_id = 'application-files' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Users can view files in their own folders"
  on storage.objects for select
  using (
    bucket_id = 'application-files' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Users can update files in their own folders"
  on storage.objects for update
  using (
    bucket_id = 'application-files' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Users can delete files in their own folders"
  on storage.objects for delete
  using (
    bucket_id = 'application-files' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- =============================================
-- DEFAULT DATA (Development Only)
-- =============================================

-- No custom OAuth clients needed - Supabase handles OAuth directly
-- All authentication is handled by Supabase's built-in auth system