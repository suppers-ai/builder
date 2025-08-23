/**
 * Type configuration caching service
 * Provides fast access to entity and product type configurations
 */

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

export interface TypeCache {
  entityTypes: Map<string, CacheEntry<any>>;
  productTypes: Map<string, CacheEntry<any>>;
  entitySubTypes: Map<string, CacheEntry<any>>;
  productSubTypes: Map<string, CacheEntry<any>>;
}

export class TypeCacheService {
  private cache: TypeCache = {
    entityTypes: new Map(),
    productTypes: new Map(),
    entitySubTypes: new Map(),
    productSubTypes: new Map(),
  };

  private defaultTTL = 5 * 60 * 1000; // 5 minutes default TTL

  /**
   * Get entity type configuration with caching
   */
  async getEntityType(typeId: string, fetcher: () => Promise<any>): Promise<any> {
    const cacheKey = `entity_type_${typeId}`;
    const cached = this.cache.entityTypes.get(cacheKey);

    if (cached && this.isValid(cached)) {
      return cached.data;
    }

    const data = await fetcher();
    this.cache.entityTypes.set(cacheKey, {
      data,
      timestamp: Date.now(),
      ttl: this.defaultTTL,
    });

    return data;
  }

  /**
   * Get product type configuration with caching
   */
  async getProductType(typeId: string, fetcher: () => Promise<any>): Promise<any> {
    const cacheKey = `product_type_${typeId}`;
    const cached = this.cache.productTypes.get(cacheKey);

    if (cached && this.isValid(cached)) {
      return cached.data;
    }

    const data = await fetcher();
    this.cache.productTypes.set(cacheKey, {
      data,
      timestamp: Date.now(),
      ttl: this.defaultTTL,
    });

    return data;
  }

  /**
   * Get all entity types with caching
   */
  async getAllEntityTypes(fetcher: () => Promise<any[]>): Promise<any[]> {
    const cacheKey = "all_entity_types";
    const cached = this.cache.entityTypes.get(cacheKey);

    if (cached && this.isValid(cached)) {
      return cached.data;
    }

    const data = await fetcher();
    this.cache.entityTypes.set(cacheKey, {
      data,
      timestamp: Date.now(),
      ttl: this.defaultTTL,
    });

    return data;
  }

  /**
   * Get all product types with caching
   */
  async getAllProductTypes(fetcher: () => Promise<any[]>): Promise<any[]> {
    const cacheKey = "all_product_types";
    const cached = this.cache.productTypes.get(cacheKey);

    if (cached && this.isValid(cached)) {
      return cached.data;
    }

    const data = await fetcher();
    this.cache.productTypes.set(cacheKey, {
      data,
      timestamp: Date.now(),
      ttl: this.defaultTTL,
    });

    return data;
  }

  /**
   * Invalidate specific type cache
   */
  invalidateEntityType(typeId?: string): void {
    if (typeId) {
      this.cache.entityTypes.delete(`entity_type_${typeId}`);
    } else {
      // Invalidate all entity types
      this.cache.entityTypes.clear();
    }
    // Always invalidate the "all" cache when any type changes
    this.cache.entityTypes.delete("all_entity_types");
  }

  /**
   * Invalidate specific product type cache
   */
  invalidateProductType(typeId?: string): void {
    if (typeId) {
      this.cache.productTypes.delete(`product_type_${typeId}`);
    } else {
      // Invalidate all product types
      this.cache.productTypes.clear();
    }
    // Always invalidate the "all" cache when any type changes
    this.cache.productTypes.delete("all_product_types");
  }

  /**
   * Get merged schema for entity type + sub-type with caching
   */
  async getMergedEntitySchema(
    typeId: string,
    subTypeId: string | null,
    fetcher: () => Promise<any>,
  ): Promise<any> {
    const cacheKey = `merged_entity_${typeId}_${subTypeId || "none"}`;
    const cached = this.cache.entityTypes.get(cacheKey);

    if (cached && this.isValid(cached)) {
      return cached.data;
    }

    const data = await fetcher();
    this.cache.entityTypes.set(cacheKey, {
      data,
      timestamp: Date.now(),
      ttl: this.defaultTTL,
    });

    return data;
  }

  /**
   * Get merged schema for product type + sub-type with caching
   */
  async getMergedProductSchema(
    typeId: string,
    subTypeId: string | null,
    fetcher: () => Promise<any>,
  ): Promise<any> {
    const cacheKey = `merged_product_${typeId}_${subTypeId || "none"}`;
    const cached = this.cache.productTypes.get(cacheKey);

    if (cached && this.isValid(cached)) {
      return cached.data;
    }

    const data = await fetcher();
    this.cache.productTypes.set(cacheKey, {
      data,
      timestamp: Date.now(),
      ttl: this.defaultTTL,
    });

    return data;
  }

  /**
   * Preload frequently used types
   */
  async preloadCommonTypes(
    entityTypeFetcher: () => Promise<any[]>,
    productTypeFetcher: () => Promise<any[]>,
  ): Promise<void> {
    try {
      // Preload all types in parallel
      await Promise.all([
        this.getAllEntityTypes(entityTypeFetcher),
        this.getAllProductTypes(productTypeFetcher),
      ]);
    } catch (error) {
      console.warn("Failed to preload types:", error);
    }
  }

  /**
   * Cleanup expired cache entries
   */
  cleanup(): void {
    const now = Date.now();

    // Cleanup entity types
    for (const [key, entry] of this.cache.entityTypes.entries()) {
      if (!this.isValid(entry, now)) {
        this.cache.entityTypes.delete(key);
      }
    }

    // Cleanup product types
    for (const [key, entry] of this.cache.productTypes.entries()) {
      if (!this.isValid(entry, now)) {
        this.cache.productTypes.delete(key);
      }
    }

    // Cleanup sub-types
    for (const [key, entry] of this.cache.entitySubTypes.entries()) {
      if (!this.isValid(entry, now)) {
        this.cache.entitySubTypes.delete(key);
      }
    }

    for (const [key, entry] of this.cache.productSubTypes.entries()) {
      if (!this.isValid(entry, now)) {
        this.cache.productSubTypes.delete(key);
      }
    }
  }

  /**
   * Get cache statistics
   */
  getStats(): {
    entityTypes: number;
    productTypes: number;
    entitySubTypes: number;
    productSubTypes: number;
    totalSize: number;
  } {
    return {
      entityTypes: this.cache.entityTypes.size,
      productTypes: this.cache.productTypes.size,
      entitySubTypes: this.cache.entitySubTypes.size,
      productSubTypes: this.cache.productSubTypes.size,
      totalSize: this.cache.entityTypes.size +
        this.cache.productTypes.size +
        this.cache.entitySubTypes.size +
        this.cache.productSubTypes.size,
    };
  }

  /**
   * Clear all caches
   */
  clearAll(): void {
    this.cache.entityTypes.clear();
    this.cache.productTypes.clear();
    this.cache.entitySubTypes.clear();
    this.cache.productSubTypes.clear();
  }

  /**
   * Check if cache entry is still valid
   */
  private isValid(entry: CacheEntry<any>, currentTime?: number): boolean {
    const now = currentTime || Date.now();
    return (now - entry.timestamp) < entry.ttl;
  }
}

// Global cache instance
export const typeCacheService = new TypeCacheService();

// Cleanup interval - run every 10 minutes
setInterval(() => {
  typeCacheService.cleanup();
}, 10 * 60 * 1000);
