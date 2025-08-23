# Performance Optimizations

This document describes the performance optimizations implemented in the sorted-storage application
to meet requirements 8.1, 8.3, and 8.5.

## Overview

The sorted-storage application implements several performance optimization strategies:

1. **Virtual Scrolling** - For large file lists (>200 items)
2. **Lazy Loading & Pagination** - For medium-sized lists (>50 items)
3. **Caching** - For frequently accessed data
4. **Optimistic UI Updates** - For better user experience
5. **Database Query Optimization** - For efficient data retrieval

## 1. Virtual Scrolling

### Implementation

- **VirtualScrollList**: For timeline/list layouts
- **VirtualGrid**: For grid layouts
- **Auto-activation**: Automatically enabled when item count > 200

### Features

- Only renders visible items plus overscan buffer
- Smooth scrolling with position tracking
- Dynamic item sizing support
- Memory efficient for large datasets

### Usage

```typescript
<VirtualScrollList
  items={items}
  itemHeight={120}
  containerHeight={600}
  renderItem={renderItem}
  overscan={5}
/>;
```

## 2. Lazy Loading & Pagination

### Implementation

- **PaginatedList**: Handles pagination with infinite scroll
- **usePagination**: Hook for managing paginated data
- **Auto-activation**: Used for lists with 50-200 items

### Features

- Infinite scroll with intersection observer
- Manual "Load More" button option
- Loading states and error handling
- Configurable page sizes

### Usage

```typescript
const pagination = usePagination(
  items,
  pageSize,
  loadMoreFunction,
);

<PaginatedList
  items={items}
  pageSize={50}
  renderItem={renderItem}
  hasMore={pagination.hasMore}
  loadMore={pagination.loadMore}
  infiniteScroll={true}
/>;
```

## 3. Caching System

### Implementation

- **CacheManager**: Generic cache with TTL and LRU eviction
- **Specialized Caches**: For different data types
- **Cache Invalidation**: Smart invalidation strategies

### Cache Types

1. **Storage Objects Cache** (2 min TTL, 50 items max)
2. **Folder Structure Cache** (5 min TTL, 20 items max)
3. **Thumbnail Cache** (30 min TTL, 200 items max)
4. **User Preferences Cache** (24 hours TTL, 10 items max)

### Features

- Time-based expiration (TTL)
- Size-based eviction (LRU)
- Pattern-based invalidation
- Persistent storage option
- Hit/miss statistics

### Usage

```typescript
// Get or compute value
const data = await cache.getOrSet("key", async () => {
  return await fetchData();
});

// Invalidate by pattern
cache.invalidatePattern(/^user:123:/);

// Get statistics
const stats = cache.getStats();
console.log(`Hit rate: ${stats.hitRate}`);
```

## 4. Optimistic UI Updates

### Implementation

- **OptimisticUpdatesManager**: Manages optimistic operations
- **Rollback Support**: Automatic rollback on errors
- **Visual Feedback**: Pending states for operations

### Features

- Immediate UI feedback
- Automatic error handling
- Rollback on failure
- Pending operation tracking

### Usage

```typescript
const optimisticUpdates = useOptimisticUpdates(items);

// Optimistic create
const updateId = optimisticUpdates.optimisticCreate(
  tempItem,
  apiCall,
  rollbackFunction,
);

// Get optimistic items
const items = optimisticUpdates.items;
```

## 5. Database Query Optimization

### Recommended Indexes

```sql
-- Primary indexes for folder hierarchy
CREATE INDEX idx_storage_objects_parent_id ON storage_objects(parent_id);
CREATE INDEX idx_storage_objects_user_parent ON storage_objects(user_id, parent_id);

-- Indexes for sorting and filtering
CREATE INDEX idx_storage_objects_created_at ON storage_objects(created_at);
CREATE INDEX idx_storage_objects_name ON storage_objects(name);

-- Composite indexes for common patterns
CREATE INDEX idx_storage_objects_user_parent_type ON storage_objects(user_id, parent_id, object_type);
```

### Optimized Queries

- **Folder Contents**: Paginated with proper sorting
- **Breadcrumb Path**: Recursive CTE for hierarchy
- **Search**: Full-text search with ranking
- **Statistics**: Aggregated queries with filters

### Query Building

```typescript
const { whereClause, params } = queryOptimizations.buildWhereClause({
  userId: "user-123",
  parentId: "folder-456",
  objectType: "file",
});

const orderBy = queryOptimizations.buildOrderByClause("name", "asc");
const pagination = queryOptimizations.buildPaginationClause(1, 20);
```

## Performance Monitoring

### Metrics Tracked

- Cache hit rates
- Query execution times
- Render performance
- Memory usage
- Network requests

### Monitoring Tools

```typescript
// Measure query performance
const result = await performanceMonitoring.measureQuery(
  "getFolderContents",
  () => storageApi.getStorageObjects(folderId),
);

// Log slow queries
performanceMonitoring.logSlowQuery(query, params, duration);
```

## Configuration

### Performance Settings

```typescript
interface PerformanceConfig {
  // Virtual scrolling threshold
  virtualScrollThreshold: 200;
  
  // Pagination threshold
  paginationThreshold: 50;
  
  // Default page size
  defaultPageSize: 50;
  
  // Cache TTL settings
  cacheTTL: {
    storageObjects: 2 * 60 * 1000,    // 2 minutes
    folderStructure: 5 * 60 * 1000,   // 5 minutes
    thumbnails: 30 * 60 * 1000,       // 30 minutes
    preferences: 24 * 60 * 60 * 1000, // 24 hours
  };
  
  // Cache size limits
  cacheMaxSize: {
    storageObjects: 50,
    folderStructure: 20,
    thumbnails: 200,
    preferences: 10,
  };
}
```

### Auto-Optimization

The application automatically chooses the best rendering strategy:

- **< 50 items**: Regular rendering
- **50-200 items**: Pagination with infinite scroll
- **> 200 items**: Virtual scrolling

## Testing

### Performance Tests

```bash
# Run performance optimization tests
deno test lib/performance-optimizations.test.ts --allow-all

# Run with coverage
deno test lib/performance-optimizations.test.ts --coverage=coverage --allow-all
```

### Load Testing

```typescript
// Test with large datasets
const largeDataset = Array.from({ length: 1000 }, (_, i) => ({
  id: `item-${i}`,
  name: `Item ${i}`,
  // ... other properties
}));

// Measure render performance
const startTime = performance.now();
render(<StorageDashboard items={largeDataset} />);
const renderTime = performance.now() - startTime;
```

## Best Practices

### Cache Management

1. **Use appropriate TTL** - Balance freshness vs performance
2. **Invalidate smartly** - Use patterns to invalidate related data
3. **Monitor hit rates** - Adjust cache sizes based on usage
4. **Handle cache misses** - Always have fallback strategies

### Virtual Scrolling

1. **Fixed item heights** - Better performance than dynamic sizing
2. **Overscan buffer** - Prevent blank areas during fast scrolling
3. **Debounce scroll events** - Reduce unnecessary re-renders
4. **Memory cleanup** - Remove unused DOM elements

### Optimistic Updates

1. **Provide rollback** - Always handle failure cases
2. **Visual feedback** - Show pending states clearly
3. **Error handling** - Display meaningful error messages
4. **Consistency** - Ensure UI matches server state eventually

### Database Optimization

1. **Use indexes** - Create indexes for common query patterns
2. **Limit results** - Always use pagination for large datasets
3. **Batch operations** - Combine multiple queries when possible
4. **Monitor performance** - Track slow queries and optimize

## Troubleshooting

### Common Issues

1. **Memory leaks** - Ensure proper cleanup of intervals/timeouts
2. **Stale cache data** - Implement proper invalidation strategies
3. **Slow scrolling** - Check virtual scrolling configuration
4. **Network bottlenecks** - Optimize API calls and caching

### Debug Tools

```typescript
// Cache statistics
console.log(storageObjectsCache.getStats());

// Optimistic updates state
console.log(optimisticUpdates.getPendingCount());

// Performance metrics
console.log(performanceMonitoring.getMetrics());
```

## Future Improvements

1. **Service Worker Caching** - Offline support and background sync
2. **IndexedDB Storage** - Client-side database for large datasets
3. **Web Workers** - Background processing for heavy operations
4. **Streaming Updates** - Real-time data synchronization
5. **Predictive Loading** - Pre-load likely-to-be-accessed data
