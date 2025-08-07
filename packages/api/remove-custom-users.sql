-- =============================================
-- Migration Script: Remove Custom Users Table
-- =============================================
-- This script removes the custom users table and migrates to using
-- Supabase's built-in auth.users with user_metadata only
--
-- Run this script ONLY if you have a custom users table that needs to be removed
-- DO NOT run this if you're starting fresh - use the updated schema instead
-- =============================================

-- Step 1: Drop all policies that reference the users table
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Admins can view all users" ON public.users;
DROP POLICY IF EXISTS "Admins can update any user" ON public.users;

-- Step 2: Drop triggers that reference the users table
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS handle_updated_at_users ON public.users;

-- Step 3: Drop functions that reference the users table
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Step 4: Update foreign key constraints to point to auth.users instead of public.users
-- Applications table
DO $$ 
BEGIN
    -- Drop the old foreign key constraint
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'applications_owner_id_fkey' 
        AND table_name = 'applications'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.applications DROP CONSTRAINT applications_owner_id_fkey;
    END IF;
    
    -- Add new foreign key constraint pointing to auth.users
    ALTER TABLE public.applications 
    ADD CONSTRAINT applications_owner_id_fkey 
    FOREIGN KEY (owner_id) REFERENCES auth.users(id) ON DELETE CASCADE;
END $$;

-- User access table
DO $$ 
BEGIN
    -- Drop old foreign key constraints
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'user_access_user_id_fkey' 
        AND table_name = 'user_access'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.user_access DROP CONSTRAINT user_access_user_id_fkey;
    END IF;
    
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'user_access_granted_by_fkey' 
        AND table_name = 'user_access'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.user_access DROP CONSTRAINT user_access_granted_by_fkey;
    END IF;
    
    -- Add new foreign key constraints pointing to auth.users
    ALTER TABLE public.user_access 
    ADD CONSTRAINT user_access_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
    
    ALTER TABLE public.user_access 
    ADD CONSTRAINT user_access_granted_by_fkey 
    FOREIGN KEY (granted_by) REFERENCES auth.users(id) ON DELETE CASCADE;
END $$;

-- Application reviews table
DO $$ 
BEGIN
    -- Drop old foreign key constraint
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'application_reviews_reviewer_id_fkey' 
        AND table_name = 'application_reviews'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.application_reviews DROP CONSTRAINT application_reviews_reviewer_id_fkey;
    END IF;
    
    -- Add new foreign key constraint pointing to auth.users
    ALTER TABLE public.application_reviews 
    ADD CONSTRAINT application_reviews_reviewer_id_fkey 
    FOREIGN KEY (reviewer_id) REFERENCES auth.users(id) ON DELETE CASCADE;
END $$;

-- Custom themes table
DO $$ 
BEGIN
    -- Drop old foreign key constraint
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'custom_themes_created_by_fkey' 
        AND table_name = 'custom_themes'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.custom_themes DROP CONSTRAINT custom_themes_created_by_fkey;
    END IF;
    
    -- Add new foreign key constraint pointing to auth.users
    ALTER TABLE public.custom_themes 
    ADD CONSTRAINT custom_themes_created_by_fkey 
    FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE CASCADE;
END $$;

-- Step 5: Drop the users table (this will cascade and remove dependent objects)
DROP TABLE IF EXISTS public.users CASCADE;

-- Step 6: Drop user-related indexes if they exist
DROP INDEX IF EXISTS idx_users_email;
DROP INDEX IF EXISTS idx_users_role;

-- Step 7: Create the helper function for checking admin status
CREATE OR REPLACE FUNCTION public.is_admin(user_id uuid)
RETURNS boolean AS $$
BEGIN
  RETURN (
    SELECT (raw_user_meta_data->>'role')::text = 'admin'
    FROM auth.users
    WHERE id = user_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 8: Recreate policies that use the new admin function
-- Applications policies
CREATE POLICY "Users can view their applications"
  ON public.applications FOR SELECT
  USING (
    owner_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.user_access
      WHERE user_id = auth.uid() AND application_id = id
    ) OR
    public.is_admin(auth.uid())
  );

CREATE POLICY "Admins can view all applications"
  ON public.applications FOR ALL
  USING (public.is_admin(auth.uid()));

-- Application reviews policies  
CREATE POLICY "Admins can view all reviews"
  ON public.application_reviews FOR SELECT
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can create reviews"
  ON public.application_reviews FOR INSERT
  WITH CHECK (
    public.is_admin(auth.uid()) AND reviewer_id = auth.uid()
  );

CREATE POLICY "Admins can update their reviews"
  ON public.application_reviews FOR UPDATE
  USING (
    reviewer_id = auth.uid() AND public.is_admin(auth.uid())
  );

CREATE POLICY "Admins can delete reviews"
  ON public.application_reviews FOR DELETE
  USING (public.is_admin(auth.uid()));

-- Custom themes policies
CREATE POLICY "Admins can manage all themes"
  ON public.custom_themes FOR ALL
  USING (public.is_admin(auth.uid()));

-- =============================================
-- VERIFICATION
-- =============================================

-- Verify migration and show results
DO $$
DECLARE
    fk_count INTEGER;
BEGIN
    -- Check if users table is gone
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'users') THEN
        RAISE NOTICE 'WARNING: Users table still exists!';
    ELSE
        RAISE NOTICE 'SUCCESS: Users table has been removed';
    END IF;
    
    -- Count foreign keys pointing to auth.users
    SELECT COUNT(*) INTO fk_count
    FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
    JOIN information_schema.constraint_column_usage ccu ON tc.constraint_name = ccu.constraint_name
    WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_schema = 'public'
    AND ccu.table_name = 'users'
    AND ccu.table_schema = 'auth';
    
    IF fk_count > 0 THEN
        RAISE NOTICE 'SUCCESS: % foreign keys now point to auth.users', fk_count;
    ELSE
        RAISE NOTICE 'INFO: No foreign keys found pointing to auth.users (this might be expected if tables are empty)';
    END IF;
    
    -- Migration completion messages
    RAISE NOTICE 'Migration completed successfully!';
    RAISE NOTICE 'User data is now managed through Supabase auth.users.user_metadata';
    RAISE NOTICE 'Make sure your application code has been updated to use user_metadata fields:';
    RAISE NOTICE '- first_name, last_name, display_name, avatar_url, role, theme_id';
END $$;