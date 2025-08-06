-- =============================================
-- Supabase Database Schema (Idempotent Version)
-- Simplified to use Supabase's built-in auth only
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

-- Application reviews table for admin review process
create table if not exists public.application_reviews (
  id uuid default uuid_generate_v4() primary key,
  application_id uuid references public.applications(id) on delete cascade not null,
  reviewer_id uuid references public.users(id) on delete cascade not null,
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
  created_by uuid references public.users(id) on delete cascade not null,
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
drop policy if exists "Users can view own profile" on public.users;
drop policy if exists "Users can update own profile" on public.users;
drop policy if exists "Admins can view all users" on public.users;
drop policy if exists "Admins can update any user" on public.users;

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

-- Users policies
create policy "Users can view own profile"
  on public.users for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.users for update
  using (auth.uid() = id);

create policy "Admins can view all users"
  on public.users for select
  using (
    exists (
      select 1 from public.users
      where id = auth.uid() and role = 'admin'
    )
  );

create policy "Admins can update any user"
  on public.users for update
  using (
    exists (
      select 1 from public.users
      where id = auth.uid() and role = 'admin'
    )
  );

-- Applications policies
create policy "Users can view their applications"
  on public.applications for select
  using (
    owner_id = auth.uid() OR
    exists (
      select 1 from public.user_access
      where user_id = auth.uid() and application_id = id
    ) OR
    exists (
      select 1 from public.users
      where id = auth.uid() and role = 'admin'
    )
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
  using (
    exists (
      select 1 from public.users
      where id = auth.uid() and role = 'admin'
    )
  );

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
  using (
    exists (
      select 1 from public.users
      where id = auth.uid() and role = 'admin'
    )
  );

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
    exists (
      select 1 from public.users
      where id = auth.uid() and role = 'admin'
    ) AND reviewer_id = auth.uid()
  );

create policy "Admins can update their reviews"
  on public.application_reviews for update
  using (
    reviewer_id = auth.uid() AND
    exists (
      select 1 from public.users
      where id = auth.uid() and role = 'admin'
    )
  );

create policy "Admins can delete reviews"
  on public.application_reviews for delete
  using (
    exists (
      select 1 from public.users
      where id = auth.uid() and role = 'admin'
    )
  );

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
  using (
    exists (
      select 1 from public.users
      where id = auth.uid() and role = 'admin'
    )
  );

-- =============================================
-- FUNCTIONS
-- =============================================

-- Function to handle new user creation
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, email, first_name, last_name, display_name, avatar_url)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'first_name',
    new.raw_user_meta_data->>'last_name',
    new.raw_user_meta_data->>'display_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

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

-- Trigger for new user registration
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

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
-- DEFAULT DATA (Development Only)
-- =============================================

-- No custom OAuth clients needed - Supabase handles OAuth directly
-- All authentication is handled by Supabase's built-in auth system