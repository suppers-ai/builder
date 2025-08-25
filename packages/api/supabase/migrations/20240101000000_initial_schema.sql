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

-- Function to check if user has permission on storage object
create or replace function public.check_storage_permission(
  p_user_id uuid,
  p_object_id uuid,
  p_permission_level text default 'view'
)
returns boolean
language plpgsql
security definer set search_path = public
as $$
declare
  v_has_permission boolean := false;
begin
  -- Check if user owns the object
  select exists(
    select 1 from public.storage_objects
    where id = p_object_id and user_id = p_user_id
  ) into v_has_permission;
  
  if v_has_permission then
    return true;
  end if;
  
  -- Check if user has shared access with required permission level
  with recursive accessible_folders as (
    -- Start with directly shared objects
    select so.id, so.parent_folder_id, ss.inherit_to_children, ss.permission_level
    from public.storage_objects so
    join public.storage_shares ss on ss.object_id = so.id
    where ss.shared_with_user_id = p_user_id
      and (ss.expires_at is null or ss.expires_at > now())
      and case 
        when p_permission_level = 'view' then ss.permission_level in ('view', 'edit', 'admin')
        when p_permission_level = 'edit' then ss.permission_level in ('edit', 'admin')
        when p_permission_level = 'admin' then ss.permission_level = 'admin'
        else false
      end
    
    union all
    
    -- Include children of shared folders where inherit_to_children is true
    select child.id, child.parent_folder_id, parent.inherit_to_children, parent.permission_level
    from public.storage_objects child
    join accessible_folders parent on child.parent_folder_id = parent.id
    where parent.inherit_to_children = true
  )
  select exists(select 1 from accessible_folders where id = p_object_id)
  into v_has_permission;
  
  return v_has_permission;
end;
$$;

-- Function to get all accessible storage objects for a user
create or replace function public.get_user_accessible_storage(p_user_id uuid)
returns table(
  id uuid,
  name text,
  parent_folder_id uuid,
  object_type text,
  file_size bigint,
  mime_type text,
  permission_level text,
  is_owner boolean,
  created_at timestamp with time zone
)
language plpgsql
security definer set search_path = public
as $$
begin
  return query
  with recursive accessible_objects as (
    -- User's own objects
    select 
      so.id,
      so.name,
      so.parent_folder_id,
      so.object_type,
      so.file_size,
      so.mime_type,
      'admin'::text as permission_level,
      true as is_owner,
      so.created_at
    from public.storage_objects so
    where so.user_id = p_user_id
    
    union
    
    -- Directly shared objects
    select 
      so.id,
      so.name,
      so.parent_folder_id,
      so.object_type,
      so.file_size,
      so.mime_type,
      ss.permission_level,
      false as is_owner,
      so.created_at
    from public.storage_objects so
    join public.storage_shares ss on ss.object_id = so.id
    where ss.shared_with_user_id = p_user_id
      and (ss.expires_at is null or ss.expires_at > now())
    
    union
    
    -- Children of shared folders (recursive)
    select 
      child.id,
      child.name,
      child.parent_folder_id,
      child.object_type,
      child.file_size,
      child.mime_type,
      parent_share.permission_level,
      false as is_owner,
      child.created_at
    from public.storage_objects child
    join public.storage_objects parent on child.parent_folder_id = parent.id
    join public.storage_shares parent_share on parent_share.object_id = parent.id
    where parent_share.shared_with_user_id = p_user_id
      and parent_share.inherit_to_children = true
      and (parent_share.expires_at is null or parent_share.expires_at > now())
  )
  select distinct on (ao.id)
    ao.id,
    ao.name,
    ao.parent_folder_id,
    ao.object_type,
    ao.file_size,
    ao.mime_type,
    ao.permission_level,
    ao.is_owner,
    ao.created_at
  from accessible_objects ao
  order by ao.id, ao.is_owner desc, 
    case ao.permission_level 
      when 'admin' then 1 
      when 'edit' then 2 
      when 'view' then 3 
    end;
end;
$$;

-- Function to update path_segments when moving objects
create or replace function public.update_path_segments()
returns trigger
language plpgsql
as $$
declare
  v_parent_segments text[];
begin
  if new.parent_folder_id is null then
    -- Root level object
    new.path_segments := array[new.name];
  else
    -- Get parent's path segments
    select path_segments into v_parent_segments
    from public.storage_objects
    where id = new.parent_folder_id;
    
    -- Append current object name to parent's path
    new.path_segments := v_parent_segments || new.name;
  end if;
  
  return new;
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

-- User status enum for account status
do $$ 
begin
    if not exists (select 1 from pg_type where typname = 'user_status') then
        create type user_status as enum ('active', 'suspended', 'deleted');
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
  status user_status default 'active'::user_status not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Applications table
create table if not exists public.applications (
  id uuid default uuid_generate_v4() primary key,
  slug text not null unique,
  name text not null,
  description text,
  website_url text,
  thumbnail_url text,
  display_entities_with_tags TEXT[], -- Array of tags that determine which places can be shown
  metadata JSONB, -- Additional application-specific data
  status application_status default 'draft'::application_status not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Storage objects table for all file types (recordings, images, documents, paintings, etc.)
create table if not exists public.storage_objects (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  parent_folder_id uuid references public.storage_objects(id) on delete cascade, -- Parent folder reference for hierarchy
  object_type text not null default 'file' check (object_type in ('file', 'folder')), -- Distinguish files from folders
  path_segments text[], -- Materialized path for fast ancestor queries (e.g., {'root', 'documents', 'projects'})
  file_path text not null,
  file_size bigint not null, -- File size in bytes (0 for folders)
  mime_type text not null, -- MIME type of the file (application/folder for folders)
  metadata jsonb default '{}'::jsonb not null, -- Flexible metadata (duration for videos, dimensions for images, drawing_data for paintings, etc.)
  thumbnail_url text, -- URL to thumbnail image (not base64)
  application_id uuid references public.applications(id) on delete cascade, -- Optional application association
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create trigger to automatically update path_segments
create trigger update_storage_path_segments
  before insert or update of parent_folder_id, name
  on public.storage_objects
  for each row
  execute function public.update_path_segments();

-- Storage shares table for fine-grained sharing permissions
create table if not exists public.storage_shares (
  id uuid default uuid_generate_v4() primary key,
  object_id uuid references public.storage_objects(id) on delete cascade not null,
  shared_with_user_id uuid references auth.users(id) on delete cascade,
  shared_with_email text, -- For sharing with non-users via email
  permission_level text not null check (permission_level in ('view', 'edit', 'admin')) default 'view',
  inherit_to_children boolean default true not null, -- Whether subfolders/files inherit this permission
  share_token text unique, -- Unique token for link-based sharing (public sharing)
  is_public boolean default false not null, -- True for public link shares
  expires_at timestamp with time zone, -- Optional expiration time
  created_by uuid references auth.users(id) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  -- Ensure share has a target (user, email, or public token)
  constraint share_target_check check (
    shared_with_user_id is not null or
    shared_with_email is not null or
    (share_token is not null and is_public = true)
  )
);

-- Create indexes for storage_shares table
create index if not exists idx_storage_shares_object_id on public.storage_shares(object_id);
create index if not exists idx_storage_shares_shared_with_user on public.storage_shares(shared_with_user_id);
create index if not exists idx_storage_shares_share_token on public.storage_shares(share_token) where share_token is not null;
create index if not exists idx_storage_shares_created_by on public.storage_shares(created_by);
create index if not exists idx_storage_shares_expires_at on public.storage_shares(expires_at) where expires_at is not null;

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

-- Applications policies - simplified access control
create policy "Users can view published applications"
  on public.applications for select
  using (status = 'published');

-- Admin operations are handled at the application level
-- No RLS policy needed for admin access to all applications

-- =============================================
-- SUBSCRIPTION TABLES (see migration 20240102000000_subscription_tables.sql)
-- =============================================
-- Note: Full subscription tables are defined in the migration file
-- This is just a reference of the key tables:

-- subscription_plans (plan_type: 'general' | 'application', application_id for app-specific plans)
-- user_subscriptions (users can have multiple: one general + multiple app-specific)
-- 
-- Key differences from old model:
-- - No more application/customDomains/apiCalls limits (admin creates apps)
-- - General plans: only storage_limit + bandwidth_limit
-- - Application plans: linked to specific apps with custom features
-- - Users can have one general subscription + multiple app-specific subscriptions

-- Storage objects policies
create policy "Users can view their own storage objects"
  on public.storage_objects for select
  using (user_id = auth.uid());

create policy "Users can view shared storage objects"
  on public.storage_objects for select
  using (
    -- Check if user has direct or inherited access through sharing
    exists (
      with recursive accessible_folders as (
        -- Start with directly shared objects
        select so.id, so.parent_folder_id, ss.inherit_to_children
        from public.storage_objects so
        join public.storage_shares ss on ss.object_id = so.id
        where ss.shared_with_user_id = auth.uid()
          and (ss.expires_at is null or ss.expires_at > now())
        
        union all
        
        -- Include children of shared folders where inherit_to_children is true
        select child.id, child.parent_folder_id, parent.inherit_to_children
        from public.storage_objects child
        join accessible_folders parent on child.parent_folder_id = parent.id
        where parent.inherit_to_children = true
      )
      select 1 from accessible_folders where id = storage_objects.id
    )
  );

create policy "Users can view publicly shared objects via token"
  on public.storage_objects for select
  using (
    -- Check if object has a public share token
    exists (
      select 1 from public.storage_shares
      where object_id = storage_objects.id
        and share_token is not null
        and (expires_at is null or expires_at > now())
    )
  );

create policy "Users can insert their own storage objects"
  on public.storage_objects for insert
  with check (user_id = auth.uid());

create policy "Users can update their own storage objects"
  on public.storage_objects for update
  using (user_id = auth.uid());

create policy "Users can update shared storage objects with edit permission"
  on public.storage_objects for update
  using (
    exists (
      with recursive accessible_folders as (
        -- Start with directly shared objects with edit/admin permission
        select so.id, so.parent_folder_id, ss.inherit_to_children, ss.permission_level
        from public.storage_objects so
        join public.storage_shares ss on ss.object_id = so.id
        where ss.shared_with_user_id = auth.uid()
          and ss.permission_level in ('edit', 'admin')
          and (ss.expires_at is null or ss.expires_at > now())
        
        union all
        
        -- Include children of shared folders where inherit_to_children is true
        select child.id, child.parent_folder_id, parent.inherit_to_children, parent.permission_level
        from public.storage_objects child
        join accessible_folders parent on child.parent_folder_id = parent.id
        where parent.inherit_to_children = true
      )
      select 1 from accessible_folders where id = storage_objects.id
    )
  );

create policy "Users can delete their own storage objects"
  on public.storage_objects for delete
  using (user_id = auth.uid());

create policy "Users can delete shared storage objects with admin permission"
  on public.storage_objects for delete
  using (
    exists (
      with recursive accessible_folders as (
        -- Start with directly shared objects with admin permission
        select so.id, so.parent_folder_id, ss.inherit_to_children, ss.permission_level
        from public.storage_objects so
        join public.storage_shares ss on ss.object_id = so.id
        where ss.shared_with_user_id = auth.uid()
          and ss.permission_level = 'admin'
          and (ss.expires_at is null or ss.expires_at > now())
        
        union all
        
        -- Include children of shared folders where inherit_to_children is true
        select child.id, child.parent_folder_id, parent.inherit_to_children, parent.permission_level
        from public.storage_objects child
        join accessible_folders parent on child.parent_folder_id = parent.id
        where parent.inherit_to_children = true
      )
      select 1 from accessible_folders where id = storage_objects.id
    )
  );

-- Storage shares policies
create policy "Users can view shares they created"
  on public.storage_shares for select
  using (created_by = auth.uid());

create policy "Users can view shares shared with them"
  on public.storage_shares for select
  using (shared_with_user_id = auth.uid());

create policy "Users can create shares for their objects"
  on public.storage_shares for insert
  with check (
    created_by = auth.uid()
    and exists (
      select 1 from public.storage_objects
      where id = object_id and user_id = auth.uid()
    )
  );

create policy "Users with admin permission can create shares"
  on public.storage_shares for insert
  with check (
    created_by = auth.uid()
    and exists (
      select 1 from public.storage_shares ss
      where ss.object_id = storage_shares.object_id
        and ss.shared_with_user_id = auth.uid()
        and ss.permission_level = 'admin'
        and (ss.expires_at is null or ss.expires_at > now())
    )
  );

create policy "Users can update shares they created"
  on public.storage_shares for update
  using (created_by = auth.uid());

create policy "Users can delete shares they created"
  on public.storage_shares for delete
  using (created_by = auth.uid());

create policy "Object owners can delete any shares on their objects"
  on public.storage_shares for delete
  using (
    exists (
      select 1 from public.storage_objects
      where id = object_id and user_id = auth.uid()
    )
  );

-- Application reviews policies
create policy "Authenticated users can view application reviews"
  on public.application_reviews for select
  using (auth.uid() is not null);

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
create index if not exists idx_users_status on public.users(status);

-- Applications indexes
create index if not exists idx_applications_status on public.applications(status);
create index if not exists idx_applications_slug on public.applications(slug);
create index if not exists idx_applications_created_at on public.applications(created_at);

-- Storage objects indexes
create index if not exists idx_storage_objects_user_id on public.storage_objects(user_id);
create index if not exists idx_storage_objects_application_id on public.storage_objects(application_id);
create index if not exists idx_storage_objects_user_created on public.storage_objects(user_id, created_at desc);
create index if not exists idx_storage_objects_mime_type_user on public.storage_objects(mime_type, user_id);
create index if not exists idx_storage_objects_parent_folder on public.storage_objects(parent_folder_id);
create index if not exists idx_storage_objects_user_parent on public.storage_objects(user_id, parent_folder_id);
create index if not exists idx_storage_objects_object_type on public.storage_objects(object_type);
create index if not exists idx_storage_objects_path_segments on public.storage_objects using gin(path_segments);

-- Storage shares indexes
create index if not exists idx_storage_shares_object_id on public.storage_shares(object_id);
create index if not exists idx_storage_shares_shared_with_user on public.storage_shares(shared_with_user_id);
create index if not exists idx_storage_shares_share_token on public.storage_shares(share_token);
create index if not exists idx_storage_shares_created_by on public.storage_shares(created_by);
create index if not exists idx_storage_shares_expires_at on public.storage_shares(expires_at);
create index if not exists idx_storage_shares_is_public on public.storage_shares(is_public) where is_public = true;

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
-- DEFAULT DATA
-- =============================================

-- No default applications needed at this time
-- Applications will be created through the admin interface

-- No custom OAuth clients needed - Supabase handles OAuth directly
-- All authentication is handled by Supabase's built-in auth system