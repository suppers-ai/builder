import type {
  AuthEventCallback,
  AuthEventData,
  AuthEventType,
} from "@suppers/shared/types";

/**
 * Event manager for handling authentication events and callbacks
 * Manages event listeners, callback execution, and proper cleanup
 */
export class EventManager {
  private eventCallbacks: Map<AuthEventType, AuthEventCallback[]> = new Map();

  /**
   * Add event listener for a specific auth event type
   * @param event - The event type to listen for
   * @param callback - The callback function to execute when event is emitted
   */
  addEventListener(event: AuthEventType, callback: AuthEventCallback): void {
    if (!this.eventCallbacks.has(event)) {
      this.eventCallbacks.set(event, []);
    }
    
    const callbacks = this.eventCallbacks.get(event)!;
    
    // Prevent duplicate callbacks
    if (!callbacks.includes(callback)) {
      callbacks.push(callback);
    }
  }

  /**
   * Remove event listener for a specific auth event type
   * @param event - The event type to remove listener from
   * @param callback - The callback function to remove
   */
  removeEventListener(event: AuthEventType, callback: AuthEventCallback): void {
    const callbacks = this.eventCallbacks.get(event);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
      
      // Clean up empty callback arrays
      if (callbacks.length === 0) {
        this.eventCallbacks.delete(event);
      }
    }
  }

  /**
   * Emit event to all registered listeners
   * @param event - The event type to emit
   * @param data - Optional event data to pass to callbacks
   */
  emitEvent(event: AuthEventType, data?: AuthEventData[AuthEventType]): void {
    const callbacks = this.eventCallbacks.get(event);
    if (callbacks && callbacks.length > 0) {
      // Create a copy of callbacks to avoid issues if callbacks modify the array
      const callbacksCopy = [...callbacks];
      
      callbacksCopy.forEach((callback) => {
        try {
          callback(event, data);
        } catch (error) {
          console.error(`Error in event callback for ${event}:`, error);
          // Continue executing other callbacks even if one fails
        }
      });
    }
  }

  /**
   * Get the number of listeners for a specific event type
   * @param event - The event type to check
   * @returns The number of registered listeners
   */
  getListenerCount(event: AuthEventType): number {
    const callbacks = this.eventCallbacks.get(event);
    return callbacks ? callbacks.length : 0;
  }

  /**
   * Get all registered event types
   * @returns Array of event types that have listeners
   */
  getRegisteredEvents(): AuthEventType[] {
    return Array.from(this.eventCallbacks.keys());
  }

  /**
   * Remove all listeners for a specific event type
   * @param event - The event type to clear listeners for
   */
  removeAllListeners(event?: AuthEventType): void {
    if (event) {
      this.eventCallbacks.delete(event);
    } else {
      this.eventCallbacks.clear();
    }
  }

  /**
   * Check if there are any listeners for a specific event type
   * @param event - The event type to check
   * @returns True if there are listeners, false otherwise
   */
  hasListeners(event: AuthEventType): boolean {
    return this.getListenerCount(event) > 0;
  }

  /**
   * Cleanup all event listeners and resources
   * Should be called when the auth client is being destroyed
   */
  destroy(): void {
    this.eventCallbacks.clear();
  }
}