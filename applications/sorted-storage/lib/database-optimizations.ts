/**
 * Database query optimizations for sorted-storage
 * Provides optimized queries and indexing strategies
 * Requirements: 8.1, 8.3
 */

/**
 * Database indexes for optimal performance
 * These should be created in the database migration
 */
export const RECOMMENDED_INDEXES = [
  // Primary indexes for folder hierarchy
  {
    name: "idx_storage_objects_parent_id",
    table: "storage_objects",
    columns: ["parent_id"],
    description: "Optimize folder content queries",
  },
  {
    name: "idx_storage_objects_user_parent",
    table: "storage_objects",
    columns: ["user_id", "parent_id"],
    description: "Optimize user-specific folder queries",
  },
  {
    name: "idx_storage_objects_user_type",
    table: "storage_objects",
    columns: ["user_id", "object_type"],
    description: "Optimize queries by object type",
  },

  // Indexes for sorting and filtering
  {
    name: "idx_storage_objects_created_at",
    table: "storage_objects",
    columns: ["created_at"],
    description: "Optimize date-based sorting",
  },
  {
    name: "idx_storage_objects_updated_at",
    table: "storage_objects",
    columns: ["updated_at"],
    description: "Optimize last modified sorting",
  },
  {
    name: "idx_storage_objects_name",
    table: "storage_objects",
    columns: ["name"],
    description: "Optimize name-based sorting and search",
  },
  {
    name: "idx_storage_objects_size",
    table: "storage_objects",
    columns: ["file_size"],
    description: "Optimize size-based sorting",
  },
  {
    name: "idx_storage_objects_mime_type",
    table: "storage_objects",
    columns: ["mime_type"],
    description: "Optimize file type filtering",
  },

  // Composite indexes for common query patterns
  {
    name: "idx_storage_objects_user_parent_type",
    table: "storage_objects",
    columns: ["user_id", "parent_id", "object_type"],
    description: "Optimize folder content queries with type filtering",
  },
  {
    name: "idx_storage_objects_user_parent_created",
    table: "storage_objects",
    columns: ["user_id", "parent_id", "created_at"],
    description: "Optimize folder content queries with date sorting",
  },
  {
    name: "idx_storage_objects_user_parent_name",
    table: "storage_objects",
    columns: ["user_id", "parent_id", "name"],
    description: "Optimize folder content queries with name sorting",
  },

  // Indexes for sharing functionality
  {
    name: "idx_storage_objects_share_token",
    table: "storage_objects",
    columns: ["share_token"],
    description: "Optimize share token lookups",
  },
  {
    name: "idx_storage_objects_public",
    table: "storage_objects",
    columns: ["is_public"],
    description: "Optimize public content queries",
  },

  // Full-text search indexes (if supported)
  {
    name: "idx_storage_objects_search",
    table: "storage_objects",
    columns: ["name", "metadata"],
    type: "gin",
    description: "Full-text search on name and metadata",
  },
];

/**
 * SQL queries optimized for performance
 */
export const OPTIMIZED_QUERIES = {
  /**
   * Get folder contents with pagination and sorting
   */
  getFolderContents: (
    userId: string,
    parentId: string | null,
    sortBy: "name" | "created_at" | "updated_at" | "file_size" = "name",
    sortOrder: "asc" | "desc" = "asc",
    limit: number = 20,
    offset: number = 0,
  ) => ({
    query: `
      SELECT 
        id, user_id, name, file_path, file_size, mime_type, 
        object_type, parent_id, is_public, share_token, 
        thumbnail_url, metadata, created_at, updated_at
      FROM storage_objects 
      WHERE user_id = $1 AND parent_id ${parentId ? "= $2" : "IS NULL"}
      ORDER BY 
        CASE WHEN object_type = 'folder' THEN 0 ELSE 1 END,
        ${sortBy} ${sortOrder.toUpperCase()}
      LIMIT $${parentId ? "3" : "2"} OFFSET $${parentId ? "4" : "3"}
    `,
    params: parentId ? [userId, parentId, limit, offset] : [userId, limit, offset],
  }),

  /**
   * Get folder hierarchy for breadcrumbs
   */
  getFolderHierarchy: (userId: string, folderId: string) => ({
    query: `
      WITH RECURSIVE folder_path AS (
        SELECT id, name, parent_id, 0 as level
        FROM storage_objects 
        WHERE id = $2 AND user_id = $1 AND object_type = 'folder'
        
        UNION ALL
        
        SELECT s.id, s.name, s.parent_id, fp.level + 1
        FROM storage_objects s
        INNER JOIN folder_path fp ON s.id = fp.parent_id
        WHERE s.user_id = $1 AND s.object_type = 'folder'
      )
      SELECT id, name, parent_id, level
      FROM folder_path
      ORDER BY level DESC
    `,
    params: [userId, folderId],
  }),

  /**
   * Get folder item counts efficiently
   */
  getFolderCounts: (userId: string, folderIds: string[]) => ({
    query: `
      SELECT parent_id, COUNT(*) as item_count
      FROM storage_objects
      WHERE user_id = $1 AND parent_id = ANY($2)
      GROUP BY parent_id
    `,
    params: [userId, folderIds],
  }),

  /**
   * Search storage objects with full-text search
   */
  searchObjects: (
    userId: string,
    searchTerm: string,
    fileTypes: string[] = [],
    limit: number = 50,
    offset: number = 0,
  ) => ({
    query: `
      SELECT 
        id, user_id, name, file_path, file_size, mime_type, 
        object_type, parent_id, is_public, share_token, 
        thumbnail_url, metadata, created_at, updated_at,
        ts_rank(to_tsvector('english', name || ' ' || COALESCE(metadata->>'description', '')), plainto_tsquery('english', $2)) as rank
      FROM storage_objects 
      WHERE user_id = $1 
        AND (
          to_tsvector('english', name || ' ' || COALESCE(metadata->>'description', '')) @@ plainto_tsquery('english', $2)
          OR name ILIKE '%' || $2 || '%'
        )
        ${fileTypes.length > 0 ? "AND mime_type = ANY($3)" : ""}
      ORDER BY rank DESC, name ASC
      LIMIT $${fileTypes.length > 0 ? "4" : "3"} OFFSET $${fileTypes.length > 0 ? "5" : "4"}
    `,
    params: fileTypes.length > 0
      ? [userId, searchTerm, fileTypes, limit, offset]
      : [userId, searchTerm, limit, offset],
  }),

  /**
   * Get storage usage statistics
   */
  getStorageStats: (userId: string) => ({
    query: `
      SELECT 
        COUNT(*) as total_items,
        COUNT(*) FILTER (WHERE object_type = 'file') as file_count,
        COUNT(*) FILTER (WHERE object_type = 'folder') as folder_count,
        COALESCE(SUM(file_size), 0) as total_size,
        COALESCE(AVG(file_size) FILTER (WHERE object_type = 'file'), 0) as avg_file_size,
        MAX(created_at) as last_upload
      FROM storage_objects
      WHERE user_id = $1
    `,
    params: [userId],
  }),

  /**
   * Get recently modified items
   */
  getRecentItems: (userId: string, limit: number = 10) => ({
    query: `
      SELECT 
        id, user_id, name, file_path, file_size, mime_type, 
        object_type, parent_id, is_public, share_token, 
        thumbnail_url, metadata, created_at, updated_at
      FROM storage_objects 
      WHERE user_id = $1
      ORDER BY updated_at DESC
      LIMIT $2
    `,
    params: [userId, limit],
  }),

  /**
   * Get items by date range for timeline view
   */
  getItemsByDateRange: (
    userId: string,
    startDate: string,
    endDate: string,
    limit: number = 100,
    offset: number = 0,
  ) => ({
    query: `
      SELECT 
        id, user_id, name, file_path, file_size, mime_type, 
        object_type, parent_id, is_public, share_token, 
        thumbnail_url, metadata, created_at, updated_at,
        DATE(created_at) as date_group
      FROM storage_objects 
      WHERE user_id = $1 
        AND created_at >= $2 
        AND created_at <= $3
      ORDER BY created_at DESC
      LIMIT $4 OFFSET $5
    `,
    params: [userId, startDate, endDate, limit, offset],
  }),
};

/**
 * Query optimization utilities
 */
export const queryOptimizations = {
  /**
   * Build optimized WHERE clause for filtering
   */
  buildWhereClause: (filters: {
    userId: string;
    parentId?: string | null;
    objectType?: "file" | "folder";
    mimeTypes?: string[];
    dateRange?: { start: string; end: string };
    sizeRange?: { min: number; max: number };
    isPublic?: boolean;
  }) => {
    const conditions: string[] = ["user_id = $1"];
    const params: any[] = [filters.userId];
    let paramIndex = 2;

    if (filters.parentId !== undefined) {
      if (filters.parentId === null) {
        conditions.push("parent_id IS NULL");
      } else {
        conditions.push(`parent_id = $${paramIndex}`);
        params.push(filters.parentId);
        paramIndex++;
      }
    }

    if (filters.objectType) {
      conditions.push(`object_type = $${paramIndex}`);
      params.push(filters.objectType);
      paramIndex++;
    }

    if (filters.mimeTypes && filters.mimeTypes.length > 0) {
      conditions.push(`mime_type = ANY($${paramIndex})`);
      params.push(filters.mimeTypes);
      paramIndex++;
    }

    if (filters.dateRange) {
      conditions.push(`created_at >= $${paramIndex} AND created_at <= $${paramIndex + 1}`);
      params.push(filters.dateRange.start, filters.dateRange.end);
      paramIndex += 2;
    }

    if (filters.sizeRange) {
      conditions.push(`file_size >= $${paramIndex} AND file_size <= $${paramIndex + 1}`);
      params.push(filters.sizeRange.min, filters.sizeRange.max);
      paramIndex += 2;
    }

    if (filters.isPublic !== undefined) {
      conditions.push(`is_public = $${paramIndex}`);
      params.push(filters.isPublic);
      paramIndex++;
    }

    return {
      whereClause: conditions.join(" AND "),
      params,
    };
  },

  /**
   * Build ORDER BY clause for sorting
   */
  buildOrderByClause: (
    sortBy: "name" | "created_at" | "updated_at" | "file_size" | "mime_type" = "name",
    sortOrder: "asc" | "desc" = "asc",
  ) => {
    // Always sort folders first
    const folderFirst = "CASE WHEN object_type = 'folder' THEN 0 ELSE 1 END";

    return `ORDER BY ${folderFirst}, ${sortBy} ${sortOrder.toUpperCase()}`;
  },

  /**
   * Build pagination clause
   */
  buildPaginationClause: (page: number = 1, pageSize: number = 20) => {
    const offset = (page - 1) * pageSize;
    return {
      clause: `LIMIT ${pageSize} OFFSET ${offset}`,
      offset,
      limit: pageSize,
    };
  },
};

/**
 * Performance monitoring utilities
 */
export const performanceMonitoring = {
  /**
   * Log slow queries for optimization
   */
  logSlowQuery: (query: string, params: any[], duration: number, threshold: number = 1000) => {
    if (duration > threshold) {
      console.warn(`Slow query detected (${duration}ms):`, {
        query: query.replace(/\s+/g, " ").trim(),
        params,
        duration,
      });
    }
  },

  /**
   * Measure query execution time
   */
  measureQuery: async <T>(
    queryName: string,
    queryFn: () => Promise<T>,
  ): Promise<T> => {
    const startTime = performance.now();
    try {
      const result = await queryFn();
      const duration = performance.now() - startTime;

      // Log performance metrics
      console.debug(`Query ${queryName} completed in ${duration.toFixed(2)}ms`);

      return result;
    } catch (error) {
      const duration = performance.now() - startTime;
      console.error(`Query ${queryName} failed after ${duration.toFixed(2)}ms:`, error);
      throw error;
    }
  },

  /**
   * Get query execution plan (for development)
   */
  explainQuery: (query: string, params: any[]) => ({
    explainQuery: `EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON) ${query}`,
    params,
  }),
};
