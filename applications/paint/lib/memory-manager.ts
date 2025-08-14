// Advanced memory management for canvas history and drawing operations
import type { DrawingState, Stroke, InsertedImage } from '../types/paint.ts';

/**
 * Memory usage statistics
 */
export interface MemoryStats {
  totalMemoryUsage: number; // bytes
  historyMemoryUsage: number; // bytes
  strokeMemoryUsage: number; // bytes
  imageMemoryUsage: number; // bytes
  compressionRatio: number;
  gcCollections: number;
  lastGcTime: number;
}

/**
 * Memory management configuration
 */
export interface MemoryConfig {
  maxHistorySteps: number;
  maxMemoryUsage: number; // bytes
  compressionThreshold: number; // bytes
  gcInterval: number; // milliseconds
  enableCompression: boolean;
  enableLazyLoading: boolean;
}

/**
 * Compressed history state
 */
interface CompressedHistoryState {
  id: string;
  timestamp: number;
  compressedData: string;
  originalSize: number;
  compressedSize: number;
  isCompressed: true;
}

/**
 * Uncompressed history state
 */
interface UncompressedHistoryState {
  id: string;
  timestamp: number;
  imageData: ImageData;
  isCompressed: false;
}

/**
 * History state union type
 */
type HistoryState = CompressedHistoryState | UncompressedHistoryState;

/**
 * Advanced memory manager for canvas operations
 */
export class AdvancedMemoryManager {
  private config: MemoryConfig;
  private history: HistoryState[] = [];
  private currentIndex = -1;
  private memoryStats: MemoryStats;
  private gcTimer: number | null = null;
  private canvas: HTMLCanvasElement;
  private compressionWorker: Worker | null = null;

  constructor(canvas: HTMLCanvasElement, config: Partial<MemoryConfig> = {}) {
    this.canvas = canvas;
    this.config = {
      maxHistorySteps: 50,
      maxMemoryUsage: 100 * 1024 * 1024, // 100MB
      compressionThreshold: 5 * 1024 * 1024, // 5MB
      gcInterval: 30000, // 30 seconds
      enableCompression: true,
      enableLazyLoading: true,
      ...config,
    };

    this.memoryStats = {
      totalMemoryUsage: 0,
      historyMemoryUsage: 0,
      strokeMemoryUsage: 0,
      imageMemoryUsage: 0,
      compressionRatio: 1,
      gcCollections: 0,
      lastGcTime: 0,
    };

    this.initializeGarbageCollection();
    this.initializeCompressionWorker();
  }

  /**
   * Initialize garbage collection timer
   */
  private initializeGarbageCollection(): void {
    if (this.config.gcInterval > 0) {
      this.gcTimer = setInterval(() => {
        this.performGarbageCollection();
      }, this.config.gcInterval);
    }
  }

  /**
   * Initialize compression worker for background compression
   */
  private initializeCompressionWorker(): void {
    if (this.config.enableCompression && typeof Worker !== 'undefined') {
      try {
        // Create a simple compression worker inline
        const workerCode = `
          self.onmessage = function(e) {
            const { id, imageData } = e.data;
            try {
              // Simple compression using JSON.stringify with reduced precision
              const compressed = JSON.stringify(imageData, (key, value) => {
                if (typeof value === 'number') {
                  return Math.round(value);
                }
                return value;
              });
              
              self.postMessage({
                id,
                success: true,
                compressedData: compressed,
                originalSize: JSON.stringify(imageData).length,
                compressedSize: compressed.length
              });
            } catch (error) {
              self.postMessage({
                id,
                success: false,
                error: error.message
              });
            }
          };
        `;

        const blob = new Blob([workerCode], { type: 'application/javascript' });
        this.compressionWorker = new Worker(URL.createObjectURL(blob));
        
        this.compressionWorker.onmessage = (e) => {
          this.handleCompressionResult(e.data);
        };
      } catch (error) {
        console.warn('Failed to initialize compression worker:', error);
        this.compressionWorker = null;
      }
    }
  }

  /**
   * Handle compression worker results
   */
  private handleCompressionResult(result: any): void {
    if (result.success) {
      // Find and update the history state
      const historyState = this.history.find(state => state.id === result.id);
      if (historyState && !historyState.isCompressed) {
        // Replace with compressed version
        const compressedState: CompressedHistoryState = {
          id: result.id,
          timestamp: historyState.timestamp,
          compressedData: result.compressedData,
          originalSize: result.originalSize,
          compressedSize: result.compressedSize,
          isCompressed: true,
        };

        const index = this.history.indexOf(historyState);
        this.history[index] = compressedState;
        
        // Update memory stats
        this.updateMemoryStats();
      }
    }
  }

  /**
   * Save current canvas state to history
   */
  public saveState(): void {
    const ctx = this.canvas.getContext('2d');
    if (!ctx) return;

    try {
      const imageData = ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
      const stateId = crypto.randomUUID();
      const timestamp = Date.now();

      // Remove any states after current index (when user made new action after undo)
      this.history = this.history.slice(0, this.currentIndex + 1);

      // Create new history state
      const newState: UncompressedHistoryState = {
        id: stateId,
        timestamp,
        imageData,
        isCompressed: false,
      };

      this.history.push(newState);
      this.currentIndex = this.history.length - 1;

      // Check if we need to compress or remove old states
      this.manageMemory();

      // Schedule compression for this state if enabled
      if (this.config.enableCompression && this.compressionWorker) {
        this.scheduleCompression(newState);
      }

      this.updateMemoryStats();
    } catch (error) {
      console.error('Failed to save canvas state:', error);
    }
  }

  /**
   * Schedule compression for a history state
   */
  private scheduleCompression(state: UncompressedHistoryState): void {
    if (!this.compressionWorker) return;

    const estimatedSize = this.estimateImageDataSize(state.imageData);
    if (estimatedSize > this.config.compressionThreshold) {
      this.compressionWorker.postMessage({
        id: state.id,
        imageData: state.imageData,
      });
    }
  }

  /**
   * Estimate ImageData size in bytes
   */
  private estimateImageDataSize(imageData: ImageData): number {
    // ImageData contains width, height, and data array
    // data array is Uint8ClampedArray with 4 bytes per pixel (RGBA)
    return imageData.width * imageData.height * 4 + 16; // +16 for width/height metadata
  }

  /**
   * Undo last action
   */
  public undo(): boolean {
    if (!this.canUndo()) return false;

    this.currentIndex--;
    const state = this.history[this.currentIndex];
    
    if (state) {
      this.restoreState(state);
      return true;
    }
    
    return false;
  }

  /**
   * Redo previously undone action
   */
  public redo(): boolean {
    if (!this.canRedo()) return false;

    this.currentIndex++;
    const state = this.history[this.currentIndex];
    
    if (state) {
      this.restoreState(state);
      return true;
    }
    
    return false;
  }

  /**
   * Restore canvas state from history
   */
  private async restoreState(state: HistoryState): Promise<void> {
    const ctx = this.canvas.getContext('2d');
    if (!ctx) return;

    try {
      let imageData: ImageData;

      if (state.isCompressed) {
        // Decompress the state
        imageData = await this.decompressState(state);
      } else {
        imageData = state.imageData;
      }

      ctx.putImageData(imageData, 0, 0);
    } catch (error) {
      console.error('Failed to restore canvas state:', error);
    }
  }

  /**
   * Decompress a compressed history state
   */
  private async decompressState(state: CompressedHistoryState): Promise<ImageData> {
    try {
      const decompressed = JSON.parse(state.compressedData);
      
      // Reconstruct ImageData
      const imageData = new ImageData(
        new Uint8ClampedArray(decompressed.data),
        decompressed.width,
        decompressed.height
      );
      
      return imageData;
    } catch (error) {
      console.error('Failed to decompress state:', error);
      throw error;
    }
  }

  /**
   * Check if undo is possible
   */
  public canUndo(): boolean {
    return this.currentIndex > 0;
  }

  /**
   * Check if redo is possible
   */
  public canRedo(): boolean {
    return this.currentIndex < this.history.length - 1;
  }

  /**
   * Get current history information
   */
  public getHistoryInfo(): {
    canUndo: boolean;
    canRedo: boolean;
    currentIndex: number;
    totalStates: number;
    memoryUsage: number;
  } {
    return {
      canUndo: this.canUndo(),
      canRedo: this.canRedo(),
      currentIndex: this.currentIndex,
      totalStates: this.history.length,
      memoryUsage: this.memoryStats.historyMemoryUsage,
    };
  }

  /**
   * Clear all history
   */
  public clearHistory(): void {
    this.history = [];
    this.currentIndex = -1;
    this.updateMemoryStats();
    
    // Save current state as new initial state
    this.saveState();
  }

  /**
   * Manage memory usage by compressing or removing old states
   */
  private manageMemory(): void {
    // Remove excess history states
    while (this.history.length > this.config.maxHistorySteps) {
      this.history.shift();
      this.currentIndex--;
    }

    // Check total memory usage
    if (this.memoryStats.totalMemoryUsage > this.config.maxMemoryUsage) {
      this.performMemoryOptimization();
    }
  }

  /**
   * Perform memory optimization
   */
  private performMemoryOptimization(): void {
    // Compress oldest uncompressed states first
    const uncompressedStates = this.history.filter(state => !state.isCompressed);
    const oldestStates = uncompressedStates
      .sort((a, b) => a.timestamp - b.timestamp)
      .slice(0, Math.ceil(uncompressedStates.length / 2));

    for (const state of oldestStates) {
      if (this.compressionWorker && !state.isCompressed) {
        this.scheduleCompression(state as UncompressedHistoryState);
      }
    }

    // If still over limit, remove oldest states
    while (this.memoryStats.totalMemoryUsage > this.config.maxMemoryUsage && this.history.length > 10) {
      this.history.shift();
      this.currentIndex--;
    }

    this.updateMemoryStats();
  }

  /**
   * Perform garbage collection
   */
  private performGarbageCollection(): void {
    const startTime = performance.now();

    // Remove any orphaned or corrupted states
    this.history = this.history.filter(state => {
      if (state.isCompressed) {
        return state.compressedData && state.compressedData.length > 0;
      } else {
        return state.imageData && state.imageData.data && state.imageData.data.length > 0;
      }
    });

    // Adjust current index if needed
    this.currentIndex = Math.min(this.currentIndex, this.history.length - 1);

    // Update stats
    this.memoryStats.gcCollections++;
    this.memoryStats.lastGcTime = performance.now() - startTime;
    this.updateMemoryStats();

    // Force browser garbage collection if available
    if ('gc' in window && typeof (window as any).gc === 'function') {
      try {
        (window as any).gc();
      } catch (error) {
        // Ignore errors - gc might not be available
      }
    }
  }

  /**
   * Update memory usage statistics
   */
  private updateMemoryStats(): void {
    let historyMemoryUsage = 0;
    let totalCompressedSize = 0;
    let totalOriginalSize = 0;

    for (const state of this.history) {
      if (state.isCompressed) {
        historyMemoryUsage += state.compressedSize;
        totalCompressedSize += state.compressedSize;
        totalOriginalSize += state.originalSize;
      } else {
        const size = this.estimateImageDataSize(state.imageData);
        historyMemoryUsage += size;
        totalOriginalSize += size;
      }
    }

    this.memoryStats.historyMemoryUsage = historyMemoryUsage;
    this.memoryStats.totalMemoryUsage = historyMemoryUsage; // Add other memory usage here
    this.memoryStats.compressionRatio = totalOriginalSize > 0 ? totalCompressedSize / totalOriginalSize : 1;
  }

  /**
   * Get memory statistics
   */
  public getMemoryStats(): MemoryStats {
    return { ...this.memoryStats };
  }

  /**
   * Update memory configuration
   */
  public updateConfig(newConfig: Partial<MemoryConfig>): void {
    this.config = { ...this.config, ...newConfig };
    
    // Restart GC timer if interval changed
    if (newConfig.gcInterval !== undefined) {
      if (this.gcTimer) {
        clearInterval(this.gcTimer);
      }
      this.initializeGarbageCollection();
    }
    
    // Trigger memory management if limits changed
    if (newConfig.maxHistorySteps !== undefined || newConfig.maxMemoryUsage !== undefined) {
      this.manageMemory();
    }
  }

  /**
   * Estimate memory usage for drawing data
   */
  public estimateDrawingDataMemory(drawingState: DrawingState): number {
    let totalSize = 0;

    // Estimate stroke memory
    for (const stroke of drawingState.strokes) {
      // Each point: x(8) + y(8) + pressure(8) = 24 bytes
      // Plus stroke metadata: id(36) + color(7) + width(8) + timestamp(8) = 59 bytes
      totalSize += stroke.points.length * 24 + 59;
    }

    // Estimate image memory
    for (const image of drawingState.images) {
      // Estimate based on data URL length (rough approximation)
      totalSize += image.src.length + 100; // +100 for metadata
    }

    // Canvas size metadata
    totalSize += 100;

    return totalSize;
  }

  /**
   * Optimize drawing data for memory efficiency
   */
  public optimizeDrawingData(drawingState: DrawingState): DrawingState {
    const optimized: DrawingState = {
      ...drawingState,
      strokes: drawingState.strokes.map(stroke => ({
        ...stroke,
        points: this.optimizeStrokePoints(stroke.points),
      })),
      images: drawingState.images.map(image => ({
        ...image,
        src: this.optimizeImageSrc(image.src),
      })),
    };

    return optimized;
  }

  /**
   * Optimize stroke points for memory efficiency
   */
  private optimizeStrokePoints(points: Point[]): Point[] {
    if (points.length <= 2) return points;

    // Remove redundant points that are too close together
    const optimized: Point[] = [points[0]];
    const minDistance = 1.5; // Minimum distance between points

    for (let i = 1; i < points.length - 1; i++) {
      const lastPoint = optimized[optimized.length - 1];
      const currentPoint = points[i];
      
      const distance = Math.sqrt(
        Math.pow(currentPoint.x - lastPoint.x, 2) + 
        Math.pow(currentPoint.y - lastPoint.y, 2)
      );

      if (distance >= minDistance) {
        optimized.push({
          x: Math.round(currentPoint.x * 10) / 10, // Round to 1 decimal
          y: Math.round(currentPoint.y * 10) / 10,
          pressure: currentPoint.pressure ? Math.round(currentPoint.pressure * 100) / 100 : undefined,
        });
      }
    }

    // Always include the last point
    optimized.push(points[points.length - 1]);

    return optimized;
  }

  /**
   * Optimize image source for memory efficiency
   */
  private optimizeImageSrc(src: string): string {
    // For now, return as-is
    // Could implement image compression here
    return src;
  }

  /**
   * Clean up resources
   */
  public dispose(): void {
    if (this.gcTimer) {
      clearInterval(this.gcTimer);
      this.gcTimer = null;
    }

    if (this.compressionWorker) {
      this.compressionWorker.terminate();
      this.compressionWorker = null;
    }

    this.history = [];
    this.currentIndex = -1;
  }
}

/**
 * Memory-aware point type for optimized storage
 */
interface Point {
  x: number;
  y: number;
  pressure?: number;
}