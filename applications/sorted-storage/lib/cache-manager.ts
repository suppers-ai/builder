/**
 * Cache manager for frequently accessed data
 * Implements in-memory and localStorage caching with TTL
 * Requirements: 8.1, 8.3, 8.5
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
  accessCount: number;
  lastAccessed: number;
}

interface CacheOptions {
  ttl?: number; // Time to live in milliseconds
  maxSize?: number; // Maximum number of entries
  persistent?: boolean; // Whether to persist to localStorage
  namespace?: string; // Namespace for localStorage keys
}

interface CacheStats {
  hits: number;
  misses: number;
  size: number;
  hitRate: number;
}

/**
 * Generic cache manager with TTL and LRU eviction
 */
export class CacheManager<T = any> {
  private cache = new Map<string, CacheEntry<T>>();
  private stats = { hits: 0, misses: 0 };
  private options: Required<CacheOptions>;
  private cleanupInterval: number | null = null;

  constructor(options: CacheOptions = {}) {
    this.options = {
      ttl: options.ttl || 5 * 60 * 1000, // 5 minutes default
      maxSize: options.maxSize || 100,
      persistent: options.persistent || false,
      namespace: options.namespace || "sorted-storage-cache",
    };

    // Load from localStorage if persistent
    if (this.options.persistent) {
      this.loadFromStorage();
    }

    // Cleanup expired entries periodically
    this.cleanupInterval = setInterval(() => this.cleanup(), 60 * 1000); // Every minute
  }

  /**
   * Destroy the cache manager and clean up resources
   */
  destroy(): void {
    if (this.cleanupInterval !== null) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
    this.clear();
  }

  /**
   * Get item from cache
   */
  get(key: string): T | null {
    const entry = this.cache.get(key);

    if (!entry) {
      this.stats.misses++;
      return null;
    }

    // Check if expired
    if (this.isExpired(entry)) {
      this.cache.delete(key);
      this.stats.misses++;
      return null;
    }

    // Update access statistics
    entry.accessCount++;
    entry.lastAccessed = Date.now();
    this.stats.hits++;

    return entry.data;
  }

  /**
   * Set item in cache
   */
  set(key: string, data: T, ttl?: number): void {
    const now = Date.now();
    const entry: CacheEntry<T> = {
      data,
      timestamp: now,
      ttl: ttl || this.options.ttl,
      accessCount: 0,
      lastAccessed: now,
    };

    // Evict if at max size
    if (this.cache.size >= this.options.maxSize) {
      this.evictLRU();
    }

    this.cache.set(key, entry);

    // Persist to localStorage if enabled
    if (this.options.persistent) {
      this.saveToStorage(key, entry);
    }
  }

  /**
   * Check if key exists and is not expired
   */
  has(key: string): boolean {
    const entry = this.cache.get(key);
    return entry !== undefined && !this.isExpired(entry);
  }

  /**
   * Delete item from cache
   */
  delete(key: string): boolean {
    const deleted = this.cache.delete(key);

    if (this.options.persistent) {
      if (typeof localStorage !== "undefined") {
        localStorage.removeItem(`${this.options.namespace}:${key}`);
      }
    }

    return deleted;
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.cache.clear();
    this.stats = { hits: 0, misses: 0 };

    if (this.options.persistent && typeof localStorage !== "undefined") {
      // Clear all keys with our namespace
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(`${this.options.namespace}:`)) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach((key) => localStorage.removeItem(key));
    }
  }

  /**
   * Get cache statistics
   */
  getStats(): CacheStats {
    return {
      ...this.stats,
      size: this.cache.size,
      hitRate: this.stats.hits / (this.stats.hits + this.stats.misses) || 0,
    };
  }

  /**
   * Get or set with async function
   */
  async getOrSet<R = T>(
    key: string,
    factory: () => Promise<R>,
    ttl?: number,
  ): Promise<R> {
    const cached = this.get(key) as R;
    if (cached !== null) {
      return cached;
    }

    const data = await factory();
    this.set(key, data as unknown as T, ttl);
    return data;
  }

  /**
   * Invalidate cache entries by pattern
   */
  invalidatePattern(pattern: RegExp): number {
    let count = 0;
    for (const key of this.cache.keys()) {
      if (pattern.test(key)) {
        this.delete(key);
        count++;
      }
    }
    return count;
  }

  /**
   * Get all keys in cache
   */
  keys(): string[] {
    return Array.from(this.cache.keys());
  }

  /**
   * Check if entry is expired
   */
  private isExpired(entry: CacheEntry<T>): boolean {
    return Date.now() - entry.timestamp > entry.ttl;
  }

  /**
   * Evict least recently used entry
   */
  private evictLRU(): void {
    let oldestKey: string | null = null;
    let oldestTime = Infinity;

    for (const [key, entry] of this.cache.entries()) {
      if (entry.lastAccessed < oldestTime) {
        oldestTime = entry.lastAccessed;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.delete(oldestKey);
    }
  }

  /**
   * Clean up expired entries
   */
  private cleanup(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];

    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach((key) => this.delete(key));
  }

  /**
   * Load cache from localStorage
   */
  private loadFromStorage(): void {
    if (typeof localStorage === "undefined") return;
    
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const storageKey = localStorage.key(i);
        if (!storageKey || !storageKey.startsWith(`${this.options.namespace}:`)) {
          continue;
        }

        const key = storageKey.replace(`${this.options.namespace}:`, "");
        const stored = localStorage.getItem(storageKey);
        if (!stored) continue;

        const entry: CacheEntry<T> = JSON.parse(stored);

        // Only load if not expired
        if (!this.isExpired(entry)) {
          this.cache.set(key, entry);
        } else {
          localStorage.removeItem(storageKey);
        }
      }
    } catch (error) {
      console.warn("Failed to load cache from localStorage:", error);
    }
  }

  /**
   * Save entry to localStorage
   */
  private saveToStorage(key: string, entry: CacheEntry<T>): void {
    if (typeof localStorage === "undefined") return;
    
    try {
      const storageKey = `${this.options.namespace}:${key}`;
      localStorage.setItem(storageKey, JSON.stringify(entry));
    } catch (error) {
      console.warn("Failed to save cache to localStorage:", error);
    }
  }
}

/**
 * Specialized cache managers for different data types
 */

// Storage objects cache
export const storageObjectsCache = new CacheManager({
  ttl: 2 * 60 * 1000, // 2 minutes
  maxSize: 50,
  persistent: true,
  namespace: "storage-objects",
});

// Folder structure cache
export const folderStructureCache = new CacheManager({
  ttl: 5 * 60 * 1000, // 5 minutes
  maxSize: 20,
  persistent: true,
  namespace: "folder-structure",
});

// Thumbnail cache
export const thumbnailCache = new CacheManager({
  ttl: 30 * 60 * 1000, // 30 minutes
  maxSize: 200,
  persistent: true,
  namespace: "thumbnails",
});

// User preferences cache
export const preferencesCache = new CacheManager({
  ttl: 24 * 60 * 60 * 1000, // 24 hours
  maxSize: 10,
  persistent: true,
  namespace: "user-preferences",
});

/**
 * Cache key generators
 */
export const cacheKeys = {
  storageObjects: (folderId?: string) => `storage-objects:${folderId || "root"}`,

  folderStructure: (folderId?: string) => `folder-structure:${folderId || "root"}`,

  folderCounts: (folderId: string) => `folder-counts:${folderId}`,

  breadcrumbs: (folderId?: string) => `breadcrumbs:${folderId || "root"}`,

  thumbnail: (fileId: string) => `thumbnail:${fileId}`,

  userPreferences: (userId: string) => `preferences:${userId}`,

  searchResults: (query: string, filters: string) => `search:${query}:${filters}`,
};

/**
 * Cache invalidation helpers
 */
export const cacheInvalidation = {
  /**
   * Invalidate all storage-related caches for a folder
   */
  invalidateFolder: (folderId?: string) => {
    const patterns = [
      new RegExp(`^storage-objects:${folderId || "root"}`),
      new RegExp(`^folder-structure:${folderId || "root"}`),
      new RegExp(`^folder-counts:${folderId || "root"}`),
      new RegExp(`^breadcrumbs:${folderId || "root"}`),
    ];

    patterns.forEach((pattern) => {
      storageObjectsCache.invalidatePattern(pattern);
      folderStructureCache.invalidatePattern(pattern);
    });
  },

  /**
   * Invalidate all caches when storage changes
   */
  invalidateAll: () => {
    storageObjectsCache.clear();
    folderStructureCache.clear();
  },

  /**
   * Invalidate search caches
   */
  invalidateSearch: () => {
    storageObjectsCache.invalidatePattern(/^search:/);
  },
};

/**
 * Cache warming utilities
 */
export const cacheWarming = {
  /**
   * Pre-load frequently accessed folders
   */
  warmFolderCache: async (folderIds: string[], loadFn: (id: string) => Promise<any>) => {
    const promises = folderIds.map(async (folderId) => {
      const key = cacheKeys.storageObjects(folderId);
      if (!storageObjectsCache.has(key)) {
        try {
          const data = await loadFn(folderId);
          storageObjectsCache.set(key, data);
        } catch (error) {
          console.warn(`Failed to warm cache for folder ${folderId}:`, error);
        }
      }
    });

    await Promise.allSettled(promises);
  },
};
