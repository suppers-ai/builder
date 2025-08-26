-- Drop triggers
DROP TRIGGER IF EXISTS update_purchases_updated_at ON formulapricing.purchases;
DROP TRIGGER IF EXISTS update_payment_sessions_updated_at ON formulapricing.payment_sessions;
DROP TRIGGER IF EXISTS update_payment_providers_updated_at ON formulapricing.payment_providers;

-- Drop function
DROP FUNCTION IF EXISTS formulapricing.update_updated_at_column();

-- Drop indexes
DROP INDEX IF EXISTS formulapricing.idx_provider_payment;
DROP INDEX IF EXISTS formulapricing.idx_purchase_status;
DROP INDEX IF EXISTS formulapricing.idx_user_purchases;
DROP INDEX IF EXISTS formulapricing.idx_session_status;
DROP INDEX IF EXISTS formulapricing.idx_user_sessions;
DROP INDEX IF EXISTS formulapricing.idx_provider_session;

-- Drop tables in reverse order of dependencies
DROP TABLE IF EXISTS formulapricing.payment_webhooks;
DROP TABLE IF EXISTS formulapricing.purchases;
DROP TABLE IF EXISTS formulapricing.payment_sessions;
DROP TABLE IF EXISTS formulapricing.payment_providers;