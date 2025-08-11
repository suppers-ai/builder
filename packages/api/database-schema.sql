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

-- Users table that syncs with auth.users
create table if not exists public.users (
  id uuid references auth.users(id) on delete cascade primary key,
  email text unique not null,
  full_name text,
  avatar_url text,
  role text default 'user'::text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

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
alter table public.user_access enable row level security;
alter table public.application_reviews enable row level security;
alter table public.custom_themes enable row level security;

-- Drop all existing policies to ensure clean state

drop policy if exists "Users can view their own profile" on public.users;
drop policy if exists "Users can update their own profile" on public.users;
drop policy if exists "Users can insert their own profile" on public.users;

drop policy if exists "Users can view their applications" on public.applications;
drop policy if exists "Users can insert their applications" on public.applications;
drop policy if exists "Users can update their applications" on public.applications;
drop policy if exists "Users can delete their applications" on public.applications;
drop policy if exists "Admins can view all applications" on public.applications;

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

-- Helper function to check if user is admin
create or replace function public.is_admin(user_id uuid)
returns boolean as $$
begin
  return (
    select role = 'admin'
    from public.users
    where id = user_id
  );
end;
$$ language plpgsql security definer;

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
create policy "Users can view their applications"
  on public.applications for select
  using (
    owner_id = auth.uid() OR
    exists (
      select 1 from public.user_access
      where user_id = auth.uid() and application_id = id
    ) OR
    public.is_admin(auth.uid())
  );

create policy "Users can insert their applications"
  on public.applications for insert
  with check (owner_id = auth.uid());

create policy "Users can update their applications"
  on public.applications for update
  using (
    owner_id = auth.uid() OR
    exists (
      select 1 from public.user_access
      where user_id = auth.uid() and application_id = id and access_level in ('write', 'admin')
    )
  );

create policy "Users can delete their applications"
  on public.applications for delete
  using (owner_id = auth.uid());

create policy "Admins can view all applications"
  on public.applications for all
  using (public.is_admin(auth.uid()));

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
create policy "Admins can view all reviews"
  on public.application_reviews for select
  using (public.is_admin(auth.uid()));

create policy "Application owners can view reviews of their apps"
  on public.application_reviews for select
  using (
    exists (
      select 1 from public.applications
      where id = application_id and owner_id = auth.uid()
    )
  );

create policy "Admins can create reviews"
  on public.application_reviews for insert
  with check (
    public.is_admin(auth.uid()) AND reviewer_id = auth.uid()
  );

create policy "Admins can update their reviews"
  on public.application_reviews for update
  using (
    reviewer_id = auth.uid() AND public.is_admin(auth.uid())
  );

create policy "Admins can delete reviews"
  on public.application_reviews for delete
  using (public.is_admin(auth.uid()));

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

create policy "Admins can manage all themes"
  on public.custom_themes for all
  using (public.is_admin(auth.uid()));

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

-- Storage policies for application files (using userId/applicationSlug/filename structure)
-- File structure: userId/applicationSlug/filename
-- Example: 550e8400-e29b-41d4-a716-446655440000/my-blog/config/settings.json

do $$
begin
  -- Check if we have permission to create policies on storage.objects
  -- This will succeed if run with service_role or appropriate permissions
  
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

  -- Ensure RLS is enabled (should already be enabled in Supabase)
  perform 1 from pg_tables where schemaname = 'storage' and tablename = 'objects';
  if found then
    alter table storage.objects enable row level security;
  end if;

  -- Policy 1: Users can upload files to their own applications
  create policy "Users can upload files to their own applications"
  on storage.objects for insert 
  with check (
    bucket_id = 'application-files' AND
    (storage.foldername(name))[1] = auth.uid()::text AND
    exists (
      select 1 from public.applications
      where slug = (storage.foldername(name))[2] and owner_id = auth.uid()
    )
  );

  -- Policy 2: Users can view files in their own applications
  create policy "Users can view files in their own applications"
  on storage.objects for select
  using (
    bucket_id = 'application-files' AND
    (storage.foldername(name))[1] = auth.uid()::text AND
    exists (
      select 1 from public.applications
      where slug = (storage.foldername(name))[2] and owner_id = auth.uid()
    )
  );

  -- Policy 3: Application collaborators can view files
  create policy "Application collaborators can view files"
  on storage.objects for select
  using (
    bucket_id = 'application-files' AND
    exists (
      select 1 from public.applications a
      join public.user_access ua on a.id = ua.application_id
      where a.slug = (storage.foldername(name))[2]
        and a.owner_id = (storage.foldername(name))[1]::uuid
        and ua.user_id = auth.uid()
    )
  );

  -- Policy 4: Application collaborators can upload files
  create policy "Application collaborators can upload files"
  on storage.objects for insert
  with check (
    bucket_id = 'application-files' AND
    exists (
      select 1 from public.applications a
      join public.user_access ua on a.id = ua.application_id
      where a.slug = (storage.foldername(name))[2]
        and a.owner_id = (storage.foldername(name))[1]::uuid
        and ua.user_id = auth.uid()
        and ua.access_level in ('write', 'admin')
    )
  );

  -- Policy 5: Users can delete files in their own applications
  create policy "Users can delete files in their own applications"
  on storage.objects for delete
  using (
    bucket_id = 'application-files' AND
    (storage.foldername(name))[1] = auth.uid()::text AND
    exists (
      select 1 from public.applications
      where slug = (storage.foldername(name))[2] and owner_id = auth.uid()
    )
  );

  -- Policy 6: Application collaborators can delete files
  create policy "Application collaborators can delete files"
  on storage.objects for delete
  using (
    bucket_id = 'application-files' AND
    exists (
      select 1 from public.applications a
      join public.user_access ua on a.id = ua.application_id
      where a.slug = (storage.foldername(name))[2]
        and a.owner_id = (storage.foldername(name))[1]::uuid
        and ua.user_id = auth.uid()
        and ua.access_level in ('write', 'admin')
    )
  );

  -- Policy 7: Users can update files in their own applications
  create policy "Users can update files in their own applications"
  on storage.objects for update
  using (
    bucket_id = 'application-files' AND
    (storage.foldername(name))[1] = auth.uid()::text AND
    exists (
      select 1 from public.applications
      where slug = (storage.foldername(name))[2] and owner_id = auth.uid()
    )
  );

  -- Policy 8: Application collaborators can update files
  create policy "Application collaborators can update files"
  on storage.objects for update
  using (
    bucket_id = 'application-files' AND
    exists (
      select 1 from public.applications a
      join public.user_access ua on a.id = ua.application_id
      where a.slug = (storage.foldername(name))[2]
        and a.owner_id = (storage.foldername(name))[1]::uuid
        and ua.user_id = auth.uid()
        and ua.access_level in ('write', 'admin')
    )
  );

  -- Policy 9: Admins can manage all storage files
  create policy "Admins can manage all storage files"
  on storage.objects for all
  using (
    bucket_id = 'application-files' AND
    public.is_admin(auth.uid())
  );

  -- Log success
  raise notice 'Storage policies created successfully';

exception
  when insufficient_privilege then
    raise warning 'Insufficient privileges to create storage policies. Run this script with service_role permissions or create policies manually through the Supabase Dashboard.';
    raise warning 'Storage bucket was created successfully, but policies need to be added separately.';
  when others then
    raise warning 'Error creating storage policies: %', sqlerrm;
    raise warning 'Storage bucket was created successfully, but policies need to be added manually.';
end $$;

-- =============================================
-- DEFAULT DATA (Development Only)
-- =============================================

-- No custom OAuth clients needed - Supabase handles OAuth directly
-- All authentication is handled by Supabase's built-in auth system