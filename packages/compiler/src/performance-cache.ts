// Performance caching system for compiled templates and component resolutions
import { fs, logger } from "../../shared/src/utils.ts";
import type { 
  ComponentDefinition, 
  ComponentRegistry
} from "../../shared/src/types.ts";
import type { ComponentResolutionResult } from "./component-resolver.ts";
import type { TemplateProcessingResult } from "./template-processor.ts";

/**
 * Template context for variable replacement
 */
export interface TemplateContext {
  /** Application metadata */
  app?: {
    name: string;
    version: string;
    description?: string;
    author?: string;
    license?: string;
  };
  /** Raw metadata object */
  metadata?: Record<string, unknown>;
  /** Theme configuration */
  theme?: Record<string, unknown>;
  /** Build configuration */
  build?: Record<string, unknown>;
  /** Additional context variables */
  [key: string]: unknown;
}

/**
 * Cache entry for component resolutions
 */
export interface ComponentCacheEntry {
  /** Component definition hash */
  hash: string;
  /** Resolution result */
  result: ComponentResolutionResult;
  /** Timestamp when cached */
  timestamp: number;
  /** Dependencies that affect this cache entry */
  dependencies: string[];
}

/**
 * Cache entry for template processing
 */
export interface TemplateCacheEntry {
  /** Template content hash */
  hash: string;
  /** Template context hash */
  contextHash: string;
  /** Processed content */
  content: string;
  /** Timestamp when cached */
  timestamp: number;
  /** Source file path */
  sourcePath: string;
  /** File modification time */
  sourceModTime: number;
}

/**
 * Cache entry for file operations
 */
export interface FileCacheEntry {
  /** File path */
  path: string;
  /** File hash */
  hash: string;
  /** File size */
  size: number;
  /** Modification time */
  modTime: number;
  /** Whether file exists */
  exists: boolean;
}

/**
 * Performance cache configuration
 */
export interface CacheConfig {
  /** Maximum number of component cache entries (default: 1000) */
  maxComponentEntries?: number;
  /** Maximum number of template cache entries (default: 500) */
  maxTemplateEntries?: number;
  /** Maximum number of file cache entries (default: 2000) */
  maxFileEntries?: number;
  /** Cache TTL in milliseconds (default: 1 hour) */
  ttl?: number;
  /** Whether to persist cache to disk (default: true) */
  persistToDisk?: boolean;
  /** Cache directory path (default: .cache) */
  cacheDir?: string;
}

/**
 * Performance cache for compilation operations
 */
export class PerformanceCache {
  private componentCache = new Map<string, ComponentCacheEntry>();
  private templateCache = new Map<string, TemplateCacheEntry>();
  private fileCache = new Map<string, FileCacheEntry>();
  private config: Required<CacheConfig>;
  private cacheDir: string;
  
  constructor(config: CacheConfig = {}) {
    this.config = {
      maxComponentEntries: config.maxComponentEntries ?? 1000,
      maxTemplateEntries: config.maxTemplateEntries ?? 500,
      maxFileEntries: config.maxFileEntries ?? 2000,
      ttl: config.ttl ?? 60 * 60 * 1000, // 1 hour
      persistToDisk: config.persistToDisk ?? true,
      cacheDir: config.cacheDir ?? '.cache'
    };
    
    this.cacheDir = fs.normalizePath(this.config.cacheDir);
  }
  
  /**
   * Initialize the cache system
   */
  async initialize(): Promise<void> {
    if (this.config.persistToDisk) {
      try {
        // Create cache directory
        await Deno.mkdir(this.cacheDir, { recursive: true });
        
        // Load existing cache from disk
        await this.loadFromDisk();
        
        logger.info(`Performance cache initialized at ${this.cacheDir}`);
      } catch (error) {
        logger.warn(`Failed to initialize cache: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
  }
  
  /**
   * Generate a hash for a component definition
   */
  private hashComponent(definition: ComponentDefinition): string {
    const content = JSON.stringify({
      type: definition.type,
      props: definition.props,
      children: definition.children,
      conditions: definition.conditions
    });
    
    return this.hashString(content);
  }
  
  /**
   * Generate a hash for template context
   */
  private hashTemplateContext(context: TemplateContext): string {
    const content = JSON.stringify(context);
    return this.hashString(content);
  }
  
  /**
   * Generate a simple hash for a string
   */
  private hashString(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36);
  }
  
  /**
   * Check if a cache entry is still valid
   */
  private isEntryValid(timestamp: number): boolean {
    return Date.now() - timestamp < this.config.ttl;
  }
  
  /**
   * Get cached component resolution result
   */
  getCachedComponent(definition: ComponentDefinition): ComponentResolutionResult | null {
    const hash = this.hashComponent(definition);
    const entry = this.componentCache.get(hash);
    
    if (entry && this.isEntryValid(entry.timestamp)) {
      logger.debug(`Cache hit for component: ${definition.type}`);
      return entry.result;
    }
    
    if (entry) {
      // Remove expired entry
      this.componentCache.delete(hash);
    }
    
    return null;
  }
  
  /**
   * Cache a component resolution result
   */
  cacheComponent(
    definition: ComponentDefinition, 
    result: ComponentResolutionResult,
    dependencies: string[] = []
  ): void {
    const hash = this.hashComponent(definition);
    
    // Enforce cache size limit
    if (this.componentCache.size >= this.config.maxComponentEntries) {
      this.evictOldestEntries(this.componentCache, Math.floor(this.config.maxComponentEntries * 0.1));
    }
    
    const entry: ComponentCacheEntry = {
      hash,
      result,
      timestamp: Date.now(),
      dependencies
    };
    
    this.componentCache.set(hash, entry);
    logger.debug(`Cached component resolution: ${definition.type}`);
  }
  
  /**
   * Get cached template processing result
   */
  async getCachedTemplate(
    templatePath: string, 
    context: TemplateContext
  ): Promise<string | null> {
    try {
      // Check if source file has been modified
      const stat = await Deno.stat(templatePath);
      const modTime = stat.mtime?.getTime() || 0;
      
      const contextHash = this.hashTemplateContext(context);
      const cacheKey = `${templatePath}:${contextHash}`;
      const entry = this.templateCache.get(cacheKey);
      
      if (entry && 
          this.isEntryValid(entry.timestamp) && 
          entry.sourceModTime === modTime) {
        logger.debug(`Cache hit for template: ${templatePath}`);
        return entry.content;
      }
      
      if (entry) {
        // Remove stale entry
        this.templateCache.delete(cacheKey);
      }
      
      return null;
    } catch (error) {
      // File doesn't exist or can't be accessed
      return null;
    }
  }
  
  /**
   * Cache a template processing result
   */
  async cacheTemplate(
    templatePath: string,
    context: TemplateContext,
    processedContent: string
  ): Promise<void> {
    try {
      const stat = await Deno.stat(templatePath);
      const modTime = stat.mtime?.getTime() || 0;
      
      const contextHash = this.hashTemplateContext(context);
      const cacheKey = `${templatePath}:${contextHash}`;
      
      // Enforce cache size limit
      if (this.templateCache.size >= this.config.maxTemplateEntries) {
        this.evictOldestEntries(this.templateCache, Math.floor(this.config.maxTemplateEntries * 0.1));
      }
      
      const entry: TemplateCacheEntry = {
        hash: this.hashString(processedContent),
        contextHash,
        content: processedContent,
        timestamp: Date.now(),
        sourcePath: templatePath,
        sourceModTime: modTime
      };
      
      this.templateCache.set(cacheKey, entry);
      logger.debug(`Cached template processing: ${templatePath}`);
    } catch (error) {
      logger.warn(`Failed to cache template: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  
  /**
   * Get cached file information
   */
  async getCachedFileInfo(filePath: string): Promise<FileCacheEntry | null> {
    const entry = this.fileCache.get(filePath);
    
    if (entry && this.isEntryValid(entry.modTime)) {
      try {
        // Verify file still exists and hasn't changed
        const stat = await Deno.stat(filePath);
        const modTime = stat.mtime?.getTime() || 0;
        
        if (entry.modTime === modTime) {
          return entry;
        }
      } catch (error) {
        // File doesn't exist anymore
        if (error instanceof Deno.errors.NotFound && !entry.exists) {
          return entry; // Cache hit for non-existent file
        }
      }
      
      // Remove stale entry
      this.fileCache.delete(filePath);
    }
    
    return null;
  }
  
  /**
   * Cache file information
   */
  async cacheFileInfo(filePath: string): Promise<FileCacheEntry> {
    try {
      const stat = await Deno.stat(filePath);
      const modTime = stat.mtime?.getTime() || 0;
      
      // For small files, calculate hash
      let hash = '';
      if (stat.size < 1024 * 1024) { // 1MB limit for hashing
        try {
          const content = await Deno.readFile(filePath);
          hash = this.hashString(new TextDecoder().decode(content));
        } catch {
          // Ignore hash calculation errors
        }
      }
      
      const entry: FileCacheEntry = {
        path: filePath,
        hash,
        size: stat.size,
        modTime,
        exists: true
      };
      
      // Enforce cache size limit
      if (this.fileCache.size >= this.config.maxFileEntries) {
        this.evictOldestFileEntries(Math.floor(this.config.maxFileEntries * 0.1));
      }
      
      this.fileCache.set(filePath, entry);
      return entry;
    } catch (error) {
      if (error instanceof Deno.errors.NotFound) {
        const entry: FileCacheEntry = {
          path: filePath,
          hash: '',
          size: 0,
          modTime: Date.now(),
          exists: false
        };
        
        this.fileCache.set(filePath, entry);
        return entry;
      }
      
      throw error;
    }
  }
  
  /**
   * Invalidate cache entries that depend on a file
   */
  invalidateDependencies(filePath: string): void {
    // Invalidate component cache entries that depend on this file
    for (const [key, entry] of this.componentCache.entries()) {
      if (entry.dependencies.includes(filePath)) {
        this.componentCache.delete(key);
        logger.debug(`Invalidated component cache entry due to dependency: ${filePath}`);
      }
    }
    
    // Invalidate template cache entries for this file
    for (const [key, entry] of this.templateCache.entries()) {
      if (entry.sourcePath === filePath) {
        this.templateCache.delete(key);
        logger.debug(`Invalidated template cache entry: ${filePath}`);
      }
    }
    
    // Remove file cache entry
    this.fileCache.delete(filePath);
  }
  
  /**
   * Clear all cache entries
   */
  clear(): void {
    this.componentCache.clear();
    this.templateCache.clear();
    this.fileCache.clear();
    logger.info("Performance cache cleared");
  }
  
  /**
   * Get cache statistics
   */
  getStats(): {
    components: { size: number; maxSize: number };
    templates: { size: number; maxSize: number };
    files: { size: number; maxSize: number };
  } {
    return {
      components: {
        size: this.componentCache.size,
        maxSize: this.config.maxComponentEntries
      },
      templates: {
        size: this.templateCache.size,
        maxSize: this.config.maxTemplateEntries
      },
      files: {
        size: this.fileCache.size,
        maxSize: this.config.maxFileEntries
      }
    };
  }
  
  /**
   * Evict oldest entries from a cache
   */
  private evictOldestEntries<T extends { timestamp: number }>(
    cache: Map<string, T>,
    count: number
  ): void {
    const entries = Array.from(cache.entries())
      .sort(([, a], [, b]) => a.timestamp - b.timestamp)
      .slice(0, count);
    
    for (const [key] of entries) {
      cache.delete(key);
    }
    
    logger.debug(`Evicted ${count} cache entries`);
  }
  
  /**
   * Evict oldest file cache entries
   */
  private evictOldestFileEntries(count: number): void {
    const entries = Array.from(this.fileCache.entries())
      .sort(([, a], [, b]) => a.modTime - b.modTime)
      .slice(0, count);
    
    for (const [key] of entries) {
      this.fileCache.delete(key);
    }
    
    logger.debug(`Evicted ${count} file cache entries`);
  }
  
  /**
   * Save cache to disk
   */
  async saveToDisk(): Promise<void> {
    if (!this.config.persistToDisk) return;
    
    try {
      const cacheData = {
        components: Array.from(this.componentCache.entries()),
        templates: Array.from(this.templateCache.entries()),
        files: Array.from(this.fileCache.entries()),
        timestamp: Date.now()
      };
      
      const cacheFile = fs.joinPath(this.cacheDir, 'cache.json');
      await Deno.writeTextFile(cacheFile, JSON.stringify(cacheData, null, 2));
      
      logger.debug(`Cache saved to disk: ${cacheFile}`);
    } catch (error) {
      logger.warn(`Failed to save cache to disk: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  
  /**
   * Load cache from disk
   */
  private async loadFromDisk(): Promise<void> {
    try {
      const cacheFile = fs.joinPath(this.cacheDir, 'cache.json');
      const cacheData = JSON.parse(await Deno.readTextFile(cacheFile));
      
      // Load component cache
      if (cacheData.components) {
        for (const [key, entry] of cacheData.components) {
          if (this.isEntryValid(entry.timestamp)) {
            this.componentCache.set(key, entry);
          }
        }
      }
      
      // Load template cache
      if (cacheData.templates) {
        for (const [key, entry] of cacheData.templates) {
          if (this.isEntryValid(entry.timestamp)) {
            this.templateCache.set(key, entry);
          }
        }
      }
      
      // Load file cache
      if (cacheData.files) {
        for (const [key, entry] of cacheData.files) {
          if (this.isEntryValid(entry.modTime)) {
            this.fileCache.set(key, entry);
          }
        }
      }
      
      logger.debug(`Cache loaded from disk: ${cacheFile}`);
    } catch (error) {
      if (!(error instanceof Deno.errors.NotFound)) {
        logger.warn(`Failed to load cache from disk: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
  }
}

// Export a default instance
export const performanceCache = new PerformanceCache();