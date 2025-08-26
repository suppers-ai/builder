-- Create schema for storage adapter
CREATE SCHEMA IF NOT EXISTS storageadapter;

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Storage objects table
CREATE TABLE IF NOT EXISTS storageadapter.storage_objects (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL,
    name TEXT NOT NULL,
    parent_folder_id UUID REFERENCES storageadapter.storage_objects(id) ON DELETE CASCADE,
    object_type TEXT NOT NULL DEFAULT 'file' CHECK (object_type IN ('file', 'folder')),
    path_segments TEXT[],
    file_path TEXT NOT NULL,
    file_size BIGINT NOT NULL DEFAULT 0,
    mime_type TEXT NOT NULL DEFAULT 'application/octet-stream',
    metadata JSONB DEFAULT '{}'::JSONB NOT NULL,
    thumbnail_url TEXT,
    checksum TEXT,
    storage_provider TEXT DEFAULT 's3' NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Storage shares table
CREATE TABLE IF NOT EXISTS storageadapter.storage_shares (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    object_id UUID REFERENCES storageadapter.storage_objects(id) ON DELETE CASCADE NOT NULL,
    shared_with_user_id UUID,
    shared_with_email TEXT,
    permission_level TEXT NOT NULL CHECK (permission_level IN ('view', 'edit', 'admin')) DEFAULT 'view',
    inherit_to_children BOOLEAN DEFAULT TRUE NOT NULL,
    share_token TEXT UNIQUE,
    is_public BOOLEAN DEFAULT FALSE NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_by UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CHECK (
        (shared_with_user_id IS NOT NULL AND shared_with_email IS NULL) OR
        (shared_with_user_id IS NULL AND shared_with_email IS NOT NULL) OR
        (share_token IS NOT NULL)
    )
);

-- Storage access logs table
CREATE TABLE IF NOT EXISTS storageadapter.storage_access_logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    object_id UUID REFERENCES storageadapter.storage_objects(id) ON DELETE CASCADE NOT NULL,
    user_id UUID,
    ip_address INET,
    action TEXT NOT NULL CHECK (action IN ('view', 'download', 'upload', 'delete', 'share', 'edit')),
    user_agent TEXT,
    metadata JSONB DEFAULT '{}'::JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Storage quotas table
CREATE TABLE IF NOT EXISTS storageadapter.storage_quotas (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL UNIQUE,
    max_storage_bytes BIGINT NOT NULL DEFAULT 5368709120, -- 5GB default
    max_bandwidth_bytes BIGINT NOT NULL DEFAULT 10737418240, -- 10GB default
    storage_used BIGINT NOT NULL DEFAULT 0,
    bandwidth_used BIGINT NOT NULL DEFAULT 0,
    reset_bandwidth_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Function to update path segments
CREATE OR REPLACE FUNCTION storageadapter.update_path_segments()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
    v_parent_segments TEXT[];
BEGIN
    IF new.parent_folder_id IS NULL THEN
        new.path_segments := ARRAY[new.name];
    ELSE
        SELECT path_segments INTO v_parent_segments
        FROM storageadapter.storage_objects
        WHERE id = new.parent_folder_id;
        
        new.path_segments := v_parent_segments || new.name;
    END IF;
    
    RETURN new;
END;
$$;

-- Function to check storage permission
CREATE OR REPLACE FUNCTION storageadapter.check_storage_permission(
    p_user_id UUID,
    p_object_id UUID,
    p_permission_level TEXT DEFAULT 'view'
)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
DECLARE
    v_has_permission BOOLEAN := FALSE;
BEGIN
    -- Check if user owns the object
    SELECT EXISTS(
        SELECT 1 FROM storageadapter.storage_objects
        WHERE id = p_object_id AND user_id = p_user_id
    ) INTO v_has_permission;
    
    IF v_has_permission THEN
        RETURN TRUE;
    END IF;
    
    -- Check if user has shared access with required permission level
    WITH RECURSIVE accessible_folders AS (
        -- Start with directly shared objects
        SELECT so.id, so.parent_folder_id, ss.inherit_to_children, ss.permission_level
        FROM storageadapter.storage_objects so
        JOIN storageadapter.storage_shares ss ON ss.object_id = so.id
        WHERE ss.shared_with_user_id = p_user_id
            AND (ss.expires_at IS NULL OR ss.expires_at > NOW())
            AND CASE 
                WHEN p_permission_level = 'view' THEN ss.permission_level IN ('view', 'edit', 'admin')
                WHEN p_permission_level = 'edit' THEN ss.permission_level IN ('edit', 'admin')
                WHEN p_permission_level = 'admin' THEN ss.permission_level = 'admin'
                ELSE FALSE
            END
        
        UNION ALL
        
        -- Include children of shared folders where inherit_to_children is true
        SELECT child.id, child.parent_folder_id, parent.inherit_to_children, parent.permission_level
        FROM storageadapter.storage_objects child
        JOIN accessible_folders parent ON child.parent_folder_id = parent.id
        WHERE parent.inherit_to_children = TRUE
    )
    SELECT EXISTS(SELECT 1 FROM accessible_folders WHERE id = p_object_id)
    INTO v_has_permission;
    
    RETURN v_has_permission;
END;
$$;

-- Function to increment storage usage
CREATE OR REPLACE FUNCTION storageadapter.increment_storage_usage(
    p_user_id UUID, 
    p_size_delta BIGINT
)
RETURNS VOID
LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE storageadapter.storage_quotas 
    SET storage_used = storage_used + p_size_delta,
        updated_at = CURRENT_TIMESTAMP
    WHERE user_id = p_user_id;
    
    -- Create quota record if it doesn't exist
    IF NOT FOUND THEN
        INSERT INTO storageadapter.storage_quotas (user_id, storage_used)
        VALUES (p_user_id, GREATEST(p_size_delta, 0));
    END IF;
END;
$$;

-- Function to increment bandwidth usage
CREATE OR REPLACE FUNCTION storageadapter.increment_bandwidth_usage(
    p_user_id UUID, 
    p_bandwidth_delta BIGINT
)
RETURNS VOID
LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE storageadapter.storage_quotas 
    SET bandwidth_used = bandwidth_used + p_bandwidth_delta,
        updated_at = CURRENT_TIMESTAMP
    WHERE user_id = p_user_id;
    
    -- Create quota record if it doesn't exist
    IF NOT FOUND THEN
        INSERT INTO storageadapter.storage_quotas (user_id, bandwidth_used)
        VALUES (p_user_id, GREATEST(p_bandwidth_delta, 0));
    END IF;
END;
$$;

-- Triggers
CREATE TRIGGER update_storage_path_segments
    BEFORE INSERT OR UPDATE OF parent_folder_id, name
    ON storageadapter.storage_objects
    FOR EACH ROW
    EXECUTE FUNCTION storageadapter.update_path_segments();

CREATE TRIGGER update_storage_objects_updated_at
    BEFORE UPDATE ON storageadapter.storage_objects
    FOR EACH ROW
    EXECUTE FUNCTION storageadapter.update_path_segments();

-- Indexes for performance
CREATE INDEX idx_storage_objects_user_id ON storageadapter.storage_objects(user_id);
CREATE INDEX idx_storage_objects_parent_folder ON storageadapter.storage_objects(parent_folder_id);
CREATE INDEX idx_storage_objects_user_parent ON storageadapter.storage_objects(user_id, parent_folder_id);
CREATE INDEX idx_storage_objects_object_type ON storageadapter.storage_objects(object_type);
CREATE INDEX idx_storage_objects_path_segments ON storageadapter.storage_objects USING GIN(path_segments);
CREATE INDEX idx_storage_objects_checksum ON storageadapter.storage_objects(checksum) WHERE checksum IS NOT NULL;

CREATE INDEX idx_storage_shares_object_id ON storageadapter.storage_shares(object_id);
CREATE INDEX idx_storage_shares_shared_with_user ON storageadapter.storage_shares(shared_with_user_id) WHERE shared_with_user_id IS NOT NULL;
CREATE INDEX idx_storage_shares_share_token ON storageadapter.storage_shares(share_token) WHERE share_token IS NOT NULL;
CREATE INDEX idx_storage_shares_created_by ON storageadapter.storage_shares(created_by);
CREATE INDEX idx_storage_shares_expires_at ON storageadapter.storage_shares(expires_at) WHERE expires_at IS NOT NULL;
CREATE INDEX idx_storage_shares_is_public ON storageadapter.storage_shares(is_public) WHERE is_public = TRUE;

CREATE INDEX idx_storage_access_logs_object_id ON storageadapter.storage_access_logs(object_id);
CREATE INDEX idx_storage_access_logs_user_id ON storageadapter.storage_access_logs(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX idx_storage_access_logs_created_at ON storageadapter.storage_access_logs(created_at);

CREATE INDEX idx_storage_quotas_user_id ON storageadapter.storage_quotas(user_id);