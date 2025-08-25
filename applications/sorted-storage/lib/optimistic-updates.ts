/**
 * Optimistic UI updates for better user experience
 * Provides immediate feedback while API calls are in progress
 * Requirements: 8.1, 8.5
 */

import type { StorageObject } from "../types/storage.ts";
import type { StorageError } from "../types/errors.ts";

interface OptimisticUpdate<T = any> {
  id: string;
  type: "create" | "update" | "delete";
  data: T;
  originalData?: T;
  timestamp: number;
  promise: Promise<T>;
  rollback: () => void;
}

interface OptimisticState<T = any> {
  items: T[];
  pendingUpdates: Map<string, OptimisticUpdate<T>>;
  errors: Map<string, StorageError>;
}

/**
 * Optimistic updates manager
 */
export class OptimisticUpdatesManager<T = StorageObject> {
  private state: OptimisticState<T> = {
    items: [],
    pendingUpdates: new Map(),
    errors: new Map(),
  };

  private listeners = new Set<(state: OptimisticState<T>) => void>();
  private errorTimeouts = new Set<number>();

  /**
   * Subscribe to state changes
   */
  subscribe(listener: (state: OptimisticState<T>) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * Get current state
   */
  getState(): OptimisticState<T> {
    return { ...this.state };
  }

  /**
   * Set base items
   */
  setItems(items: T[]): void {
    this.state.items = [...items];
    this.notifyListeners();
  }

  /**
   * Get items with optimistic updates applied
   */
  getOptimisticItems(): T[] {
    let items = [...this.state.items];

    // Apply pending updates
    for (const update of this.state.pendingUpdates.values()) {
      switch (update.type) {
        case "create":
          items.push(update.data);
          break;
        case "update":
          const updateIndex = items.findIndex((item: any) => item.id === (update.data as any).id);
          if (updateIndex !== -1) {
            items[updateIndex] = update.data;
          }
          break;
        case "delete":
          items = items.filter((item: any) => item.id !== (update.data as any).id);
          break;
      }
    }

    return items;
  }

  /**
   * Optimistically create an item
   */
  optimisticCreate(
    tempItem: T,
    promise: Promise<T>,
    rollback?: () => void,
  ): string {
    const updateId = crypto.randomUUID();

    const update: OptimisticUpdate<T> = {
      id: updateId,
      type: "create",
      data: tempItem,
      timestamp: Date.now(),
      promise,
      rollback: rollback || (() => {}),
    };

    this.state.pendingUpdates.set(updateId, update);
    this.notifyListeners();

    // Handle promise resolution
    promise
      .then((actualItem) => {
        this.commitUpdate(updateId, actualItem);
      })
      .catch((error) => {
        this.rollbackUpdate(updateId, error);
      });

    return updateId;
  }

  /**
   * Optimistically update an item
   */
  optimisticUpdate(
    updatedItem: T,
    promise: Promise<T>,
    rollback?: () => void,
  ): string {
    const updateId = crypto.randomUUID();
    const originalItem = this.state.items.find((item: any) => item.id === (updatedItem as any).id);

    const update: OptimisticUpdate<T> = {
      id: updateId,
      type: "update",
      data: updatedItem,
      originalData: originalItem,
      timestamp: Date.now(),
      promise,
      rollback: rollback || (() => {}),
    };

    this.state.pendingUpdates.set(updateId, update);
    this.notifyListeners();

    // Handle promise resolution
    promise
      .then((actualItem) => {
        this.commitUpdate(updateId, actualItem);
      })
      .catch((error) => {
        this.rollbackUpdate(updateId, error);
      });

    return updateId;
  }

  /**
   * Optimistically delete an item
   */
  optimisticDelete(
    itemToDelete: T,
    promise: Promise<void>,
    rollback?: () => void,
  ): string {
    const updateId = crypto.randomUUID();

    const update: OptimisticUpdate<T> = {
      id: updateId,
      type: "delete",
      data: itemToDelete,
      originalData: itemToDelete,
      timestamp: Date.now(),
      promise: promise.then(() => itemToDelete),
      rollback: rollback || (() => {}),
    };

    this.state.pendingUpdates.set(updateId, update);
    this.notifyListeners();

    // Handle promise resolution
    promise
      .then(() => {
        this.commitUpdate(updateId);
      })
      .catch((error) => {
        this.rollbackUpdate(updateId, error);
      });

    return updateId;
  }

  /**
   * Commit an optimistic update
   */
  private commitUpdate(updateId: string, actualData?: T): void {
    const update = this.state.pendingUpdates.get(updateId);
    if (!update) return;

    // Update the base items with actual data
    if (actualData && update.type !== "delete") {
      switch (update.type) {
        case "create":
          this.state.items.push(actualData);
          break;
        case "update":
          const index = this.state.items.findIndex((item: any) =>
            item.id === (actualData as any).id
          );
          if (index !== -1) {
            this.state.items[index] = actualData;
          }
          break;
      }
    } else if (update.type === "delete") {
      this.state.items = this.state.items.filter((item: any) =>
        item.id !== (update.data as any).id
      );
    }

    // Remove the pending update
    this.state.pendingUpdates.delete(updateId);
    this.state.errors.delete(updateId);

    this.notifyListeners();
  }

  /**
   * Rollback an optimistic update
   */
  private rollbackUpdate(updateId: string, error: StorageError): void {
    const update = this.state.pendingUpdates.get(updateId);
    if (!update) return;

    // Execute rollback function
    update.rollback();

    // Store error
    this.state.errors.set(updateId, error);

    // Remove the pending update
    this.state.pendingUpdates.delete(updateId);

    this.notifyListeners();

    // Auto-clear error after some time
    const timeoutId = setTimeout(() => {
      this.state.errors.delete(updateId);
      this.errorTimeouts.delete(timeoutId);
      this.notifyListeners();
    }, 5000);
    this.errorTimeouts.add(timeoutId);
  }

  /**
   * Cancel a pending update
   */
  cancelUpdate(updateId: string): void {
    const update = this.state.pendingUpdates.get(updateId);
    if (!update) return;

    update.rollback();
    this.state.pendingUpdates.delete(updateId);
    this.state.errors.delete(updateId);

    this.notifyListeners();
  }

  /**
   * Clear all pending updates and errors
   */
  clear(): void {
    // Execute rollback for all pending updates
    for (const update of this.state.pendingUpdates.values()) {
      update.rollback();
    }

    // Clear all error timeouts
    for (const timeoutId of this.errorTimeouts) {
      clearTimeout(timeoutId);
    }

    this.state.pendingUpdates.clear();
    this.state.errors.clear();
    this.errorTimeouts.clear();
    this.notifyListeners();
  }

  /**
   * Destroy the manager and clean up resources
   */
  destroy(): void {
    this.clear();
    this.listeners.clear();
  }

  /**
   * Get pending updates count
   */
  getPendingCount(): number {
    return this.state.pendingUpdates.size;
  }

  /**
   * Get errors
   */
  getErrors(): StorageError[] {
    return Array.from(this.state.errors.values());
  }

  /**
   * Check if an item is being updated
   */
  isPending(itemId: string): boolean {
    for (const update of this.state.pendingUpdates.values()) {
      if ((update.data as any).id === itemId) {
        return true;
      }
    }
    return false;
  }

  /**
   * Notify all listeners
   */
  private notifyListeners(): void {
    for (const listener of this.listeners) {
      listener(this.getState());
    }
  }
}

/**
 * Hook for using optimistic updates
 */
export function useOptimisticUpdates<T = StorageObject>(initialItems: T[] = []) {
  const manager = new OptimisticUpdatesManager<T>();

  // Set initial items
  manager.setItems(initialItems);

  return {
    items: manager.getOptimisticItems(),
    pendingCount: manager.getPendingCount(),
    errors: manager.getErrors(),

    optimisticCreate: (tempItem: T, promise: Promise<T>, rollback?: () => void) =>
      manager.optimisticCreate(tempItem, promise, rollback),

    optimisticUpdate: (updatedItem: T, promise: Promise<T>, rollback?: () => void) =>
      manager.optimisticUpdate(updatedItem, promise, rollback),

    optimisticDelete: (itemToDelete: T, promise: Promise<void>, rollback?: () => void) =>
      manager.optimisticDelete(itemToDelete, promise, rollback),

    cancelUpdate: (updateId: string) => manager.cancelUpdate(updateId),
    clear: () => manager.clear(),
    isPending: (itemId: string) => manager.isPending(itemId),

    subscribe: (listener: (state: OptimisticState<T>) => void) => manager.subscribe(listener),
  };
}

/**
 * Optimistic update helpers for common operations
 */
export const optimisticHelpers = {
  /**
   * Create optimistic file upload
   */
  createOptimisticFile: (file: File, folderId?: string): StorageObject => ({
    id: `temp-${crypto.randomUUID()}`,
    user_id: "current-user", // Will be replaced with actual user ID
    name: file.name,
    file_path: `temp/${file.name}`,
    file_size: file.size,
    mime_type: file.type,
    object_type: "file",
    parent_folder_id: folderId || null,
    thumbnail_url: null,
    metadata: {
      original_name: file.name,
      upload_status: "uploading",
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    application_id: null,
  }),

  /**
   * Create optimistic folder
   */
  createOptimisticFolder: (name: string, parentId?: string): StorageObject => ({
    id: `temp-${crypto.randomUUID()}`,
    user_id: "current-user", // Will be replaced with actual user ID
    name,
    file_path: `temp/folders/${name}`,
    file_size: 0,
    mime_type: "application/x-folder",
    object_type: "folder",
    parent_folder_id: parentId || null,
    thumbnail_url: null,
    metadata: {
      custom_name: name,
      creation_status: "creating",
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    application_id: null,
  }),

  /**
   * Create optimistic update for metadata changes
   */
  createOptimisticMetadataUpdate: (
    original: StorageObject,
    updates: Partial<StorageObject>,
  ): StorageObject => ({
    ...original,
    ...updates,
    updated_at: new Date().toISOString(),
    metadata: {
      ...original.metadata,
      ...updates.metadata,
      update_status: "updating",
    },
  }),
};
