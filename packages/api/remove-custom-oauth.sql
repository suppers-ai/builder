-- =============================================
-- Remove Custom OAuth Tables and Functions
-- (Since we're using Supabase's built-in OAuth)
-- =============================================

-- Remove OAuth-related policies
drop policy if exists "Service role can manage oauth codes" on public.oauth_codes;
drop policy if exists "Service role can manage oauth tokens" on public.oauth_tokens;
drop policy if exists "Users can view own oauth clients" on public.oauth_clients;
drop policy if exists "Users can create oauth clients" on public.oauth_clients;
drop policy if exists "Users can update own oauth clients" on public.oauth_clients;
drop policy if exists "Users can delete own oauth clients" on public.oauth_clients;

-- Remove OAuth-related triggers
drop trigger if exists handle_updated_at_oauth_clients on public.oauth_clients;

-- Remove OAuth-related indexes 
drop index if exists idx_oauth_codes_client_id;
drop index if exists idx_oauth_codes_expires_at;
drop index if exists idx_oauth_tokens_client_id;
drop index if exists idx_oauth_tokens_expires_at;
drop index if exists idx_oauth_clients_client_id;

-- Remove OAuth-related tables
drop table if exists public.oauth_codes;
drop table if exists public.oauth_tokens;
drop table if exists public.oauth_clients;

-- Remove OAuth cleanup function
drop function if exists public.cleanup_expired_oauth();

-- Note: Keep the applications, users, and access tables as they are for actual business logic