-- Drop all objects in storageadapter schema
DROP TRIGGER IF EXISTS update_storage_path_segments ON storageadapter.storage_objects;
DROP TRIGGER IF EXISTS update_storage_objects_updated_at ON storageadapter.storage_objects;

DROP FUNCTION IF EXISTS storageadapter.update_path_segments();
DROP FUNCTION IF EXISTS storageadapter.check_storage_permission(UUID, UUID, TEXT);
DROP FUNCTION IF EXISTS storageadapter.increment_storage_usage(UUID, BIGINT);
DROP FUNCTION IF EXISTS storageadapter.increment_bandwidth_usage(UUID, BIGINT);

DROP TABLE IF EXISTS storageadapter.storage_access_logs;
DROP TABLE IF EXISTS storageadapter.storage_shares;
DROP TABLE IF EXISTS storageadapter.storage_objects;
DROP TABLE IF EXISTS storageadapter.storage_quotas;

DROP SCHEMA IF EXISTS storageadapter;