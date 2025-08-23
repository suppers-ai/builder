/**
 * Accessibility utilities for keyboard navigation, focus management, and screen reader support
 * Requirements: 7.5, 8.4
 */

// Keyboard navigation constants
export const KEYBOARD_KEYS = {
  ENTER: "Enter",
  SPACE: " ",
  ESCAPE: "Escape",
  ARROW_UP: "ArrowUp",
  ARROW_DOWN: "ArrowDown",
  ARROW_LEFT: "ArrowLeft",
  ARROW_RIGHT: "ArrowRight",
  HOME: "Home",
  END: "End",
  PAGE_UP: "PageUp",
  PAGE_DOWN: "PageDown",
  TAB: "Tab",
  DELETE: "Delete",
  BACKSPACE: "Backspace",
} as const;

// Focus management utilities
export class FocusManager {
  private static focusableSelectors = [
    "button:not([disabled])",
    "input:not([disabled])",
    "select:not([disabled])",
    "textarea:not([disabled])",
    "a[href]",
    '[tabindex]:not([tabindex="-1"])',
    '[contenteditable="true"]',
  ].join(", ");

  /**
   * Get all focusable elements within a container
   */
  static getFocusableElements(container: Element): HTMLElement[] {
    return Array.from(container.querySelectorAll(this.focusableSelectors)) as HTMLElement[];
  }

  /**
   * Get the first focusable element in a container
   */
  static getFirstFocusableElement(container: Element): HTMLElement | null {
    const focusable = this.getFocusableElements(container);
    return focusable[0] || null;
  }

  /**
   * Get the last focusable element in a container
   */
  static getLastFocusableElement(container: Element): HTMLElement | null {
    const focusable = this.getFocusableElements(container);
    return focusable[focusable.length - 1] || null;
  }

  /**
   * Trap focus within a container (useful for modals)
   */
  static trapFocus(container: Element, event: KeyboardEvent): void {
    if (event.key !== KEYBOARD_KEYS.TAB) return;

    const focusable = this.getFocusableElements(container);
    if (focusable.length === 0) return;

    const firstFocusable = focusable[0];
    const lastFocusable = focusable[focusable.length - 1];

    if (event.shiftKey) {
      // Shift + Tab
      if (document.activeElement === firstFocusable) {
        event.preventDefault();
        lastFocusable.focus();
      }
    } else {
      // Tab
      if (document.activeElement === lastFocusable) {
        event.preventDefault();
        firstFocusable.focus();
      }
    }
  }

  /**
   * Move focus to the next/previous element in a list
   */
  static moveFocus(
    elements: HTMLElement[],
    currentIndex: number,
    direction: "next" | "previous" | "first" | "last",
  ): number {
    let newIndex = currentIndex;

    switch (direction) {
      case "next":
        newIndex = currentIndex < elements.length - 1 ? currentIndex + 1 : 0;
        break;
      case "previous":
        newIndex = currentIndex > 0 ? currentIndex - 1 : elements.length - 1;
        break;
      case "first":
        newIndex = 0;
        break;
      case "last":
        newIndex = elements.length - 1;
        break;
    }

    if (elements[newIndex]) {
      elements[newIndex].focus();
    }

    return newIndex;
  }
}

// Screen reader utilities
export class ScreenReaderUtils {
  /**
   * Create a live region for screen reader announcements
   */
  static createLiveRegion(
    id: string,
    politeness: "polite" | "assertive" = "polite",
  ): HTMLElement | null {
    // Check if we're in a browser environment
    if (typeof globalThis.document === "undefined") {
      return null;
    }

    let liveRegion = globalThis.document.getElementById(id);

    if (!liveRegion) {
      liveRegion = globalThis.document.createElement("div");
      liveRegion.id = id;
      liveRegion.setAttribute("aria-live", politeness);
      liveRegion.setAttribute("aria-atomic", "true");
      liveRegion.className = "sr-only";
      globalThis.document.body.appendChild(liveRegion);
    }

    return liveRegion;
  }

  /**
   * Announce a message to screen readers
   */
  static announce(message: string, politeness: "polite" | "assertive" = "polite"): void {
    const liveRegion = this.createLiveRegion("sr-live-region", politeness);

    if (!liveRegion) {
      return;
    }

    // Clear previous message
    liveRegion.textContent = "";

    // In test environment, set message immediately
    if (typeof Deno !== "undefined") {
      liveRegion.textContent = message;
      return;
    }

    // Add new message after a brief delay to ensure it's announced
    setTimeout(() => {
      if (liveRegion) {
        liveRegion.textContent = message;
      }
    }, 100);

    // Clear message after announcement
    setTimeout(() => {
      if (liveRegion) {
        liveRegion.textContent = "";
      }
    }, 1000);
  }

  /**
   * Generate descriptive text for file/folder items
   */
  static getItemDescription(item: any): string {
    const type = item.object_type === "folder" ? "folder" : "file";
    const name = item.metadata?.custom_name || item.name;
    const emoji = item.metadata?.emoji ? `${item.metadata.emoji} ` : "";
    const description = item.metadata?.description ? `, ${item.metadata.description}` : "";
    const size = item.object_type === "file" ? `, ${formatFileSize(item.file_size)}` : "";
    const date = `, modified ${formatDateForScreenReader(item.updated_at)}`;

    return `${emoji}${name}, ${type}${description}${size}${date}`;
  }

  /**
   * Generate ARIA label for action buttons
   */
  static getActionLabel(action: string, itemName: string, itemType: "file" | "folder"): string {
    return `${action} ${itemType} ${itemName}`;
  }
}

// Keyboard navigation hook for grid/list items
export function useKeyboardNavigation(
  items: any[],
  onSelect: (item: any) => void,
  onActivate: (item: any) => void,
  containerRef: { current: HTMLElement | null },
) {
  const handleKeyDown = (event: KeyboardEvent, currentIndex: number) => {
    const { key, ctrlKey, metaKey, shiftKey } = event;

    // Get grid dimensions for 2D navigation
    const container = containerRef.current;
    if (!container) return;

    const itemElements = Array.from(
      container.querySelectorAll("[data-item-index]"),
    ) as HTMLElement[];
    const containerRect = container.getBoundingClientRect();
    const firstItemRect = itemElements[0]?.getBoundingClientRect();

    if (!firstItemRect) return;

    // Calculate approximate columns based on item width
    const itemWidth = firstItemRect.width;
    const containerWidth = containerRect.width;
    const columns = Math.floor(containerWidth / itemWidth) || 1;

    let newIndex = currentIndex;
    let shouldPreventDefault = true;

    switch (key) {
      case KEYBOARD_KEYS.ARROW_RIGHT:
        newIndex = Math.min(currentIndex + 1, items.length - 1);
        break;

      case KEYBOARD_KEYS.ARROW_LEFT:
        newIndex = Math.max(currentIndex - 1, 0);
        break;

      case KEYBOARD_KEYS.ARROW_DOWN:
        newIndex = Math.min(currentIndex + columns, items.length - 1);
        break;

      case KEYBOARD_KEYS.ARROW_UP:
        newIndex = Math.max(currentIndex - columns, 0);
        break;

      case KEYBOARD_KEYS.HOME:
        newIndex = 0;
        break;

      case KEYBOARD_KEYS.END:
        newIndex = items.length - 1;
        break;

      case KEYBOARD_KEYS.PAGE_UP:
        newIndex = Math.max(currentIndex - (columns * 3), 0);
        break;

      case KEYBOARD_KEYS.PAGE_DOWN:
        newIndex = Math.min(currentIndex + (columns * 3), items.length - 1);
        break;

      case KEYBOARD_KEYS.ENTER:
      case KEYBOARD_KEYS.SPACE:
        if (items[currentIndex]) {
          if (shiftKey || ctrlKey || metaKey) {
            onSelect(items[currentIndex]);
          } else {
            onActivate(items[currentIndex]);
          }
        }
        break;

      default:
        shouldPreventDefault = false;
    }

    if (shouldPreventDefault) {
      event.preventDefault();

      if (newIndex !== currentIndex && itemElements[newIndex]) {
        itemElements[newIndex].focus();

        // Announce the new item to screen readers
        const item = items[newIndex];
        if (item) {
          ScreenReaderUtils.announce(ScreenReaderUtils.getItemDescription(item));
        }
      }
    }
  };

  return { handleKeyDown };
}

// High contrast mode detection and utilities
export class HighContrastUtils {
  /**
   * Detect if high contrast mode is enabled
   */
  static isHighContrastMode(): boolean {
    // Check if we're in a browser environment
    if (typeof globalThis.window === "undefined" || typeof globalThis.document === "undefined") {
      return false;
    }

    // Check for Windows high contrast mode
    if (
      globalThis.window.matchMedia &&
      globalThis.window.matchMedia("(prefers-contrast: high)").matches
    ) {
      return true;
    }

    // Check for forced colors (Windows high contrast)
    if (
      globalThis.window.matchMedia &&
      globalThis.window.matchMedia("(forced-colors: active)").matches
    ) {
      return true;
    }

    // Check for custom high contrast setting
    return globalThis.document.documentElement.classList.contains("high-contrast");
  }

  /**
   * Toggle high contrast mode
   */
  static toggleHighContrastMode(): void {
    // Check if we're in a browser environment
    if (
      typeof globalThis.document === "undefined" || typeof globalThis.localStorage === "undefined"
    ) {
      return;
    }

    const isEnabled = this.isHighContrastMode();

    if (isEnabled) {
      globalThis.document.documentElement.classList.remove("high-contrast");
      globalThis.localStorage.setItem("high-contrast-mode", "false");
    } else {
      globalThis.document.documentElement.classList.add("high-contrast");
      globalThis.localStorage.setItem("high-contrast-mode", "true");
    }

    // Announce the change
    ScreenReaderUtils.announce(
      `High contrast mode ${isEnabled ? "disabled" : "enabled"}`,
      "assertive",
    );
  }

  /**
   * Initialize high contrast mode from user preference
   */
  static initializeHighContrastMode(): void {
    // Check if we're in a browser environment
    if (
      typeof globalThis.localStorage === "undefined" ||
      typeof globalThis.window === "undefined" ||
      typeof globalThis.document === "undefined"
    ) {
      return;
    }

    const savedPreference = globalThis.localStorage.getItem("high-contrast-mode");
    const systemPreference = globalThis.window.matchMedia &&
      globalThis.window.matchMedia("(prefers-contrast: high)").matches;

    if (savedPreference === "true" || (savedPreference === null && systemPreference)) {
      globalThis.document.documentElement.classList.add("high-contrast");
    }

    // Listen for system preference changes
    if (globalThis.window.matchMedia) {
      globalThis.window.matchMedia("(prefers-contrast: high)").addEventListener("change", (e) => {
        if (globalThis.localStorage.getItem("high-contrast-mode") === null) {
          if (e.matches) {
            globalThis.document.documentElement.classList.add("high-contrast");
          } else {
            globalThis.document.documentElement.classList.remove("high-contrast");
          }
        }
      });
    }
  }
}

// Accessibility testing utilities
export class AccessibilityTester {
  /**
   * Check if an element has proper ARIA labels
   */
  static checkAriaLabels(element: Element): string[] {
    const issues: string[] = [];

    // Check for buttons without labels
    const buttons = element.querySelectorAll("button");
    buttons.forEach((button, index) => {
      const hasLabel = button.getAttribute("aria-label") ||
        button.getAttribute("aria-labelledby") ||
        button.textContent?.trim();

      if (!hasLabel) {
        issues.push(`Button ${index + 1} is missing an accessible label`);
      }
    });

    // Check for images without alt text
    const images = element.querySelectorAll("img");
    images.forEach((img, index) => {
      if (!img.getAttribute("alt")) {
        issues.push(`Image ${index + 1} is missing alt text`);
      }
    });

    // Check for form inputs without labels
    const inputs = element.querySelectorAll("input, select, textarea");
    inputs.forEach((input, index) => {
      const hasLabel = input.getAttribute("aria-label") ||
        input.getAttribute("aria-labelledby") ||
        element.querySelector(`label[for="${input.id}"]`);

      if (!hasLabel) {
        issues.push(`Form input ${index + 1} is missing a label`);
      }
    });

    return issues;
  }

  /**
   * Check color contrast ratios
   */
  static checkColorContrast(element: Element): string[] {
    const issues: string[] = [];

    // This is a simplified check - in a real implementation,
    // you would use a proper color contrast calculation library
    const textElements = element.querySelectorAll("*");

    textElements.forEach((el) => {
      const styles = globalThis.getComputedStyle(el);
      const color = styles.color;
      const backgroundColor = styles.backgroundColor;

      // Skip elements without text content
      if (!el.textContent?.trim()) return;

      // This is a placeholder - implement actual contrast ratio calculation
      // For now, just check if colors are set
      if (color === "rgba(0, 0, 0, 0)" || backgroundColor === "rgba(0, 0, 0, 0)") {
        // Could indicate potential contrast issues
      }
    });

    return issues;
  }

  /**
   * Run all accessibility checks
   */
  static runAllChecks(element: Element): { issues: string[]; score: number } {
    const ariaIssues = this.checkAriaLabels(element);
    const contrastIssues = this.checkColorContrast(element);

    const allIssues = [...ariaIssues, ...contrastIssues];
    const totalChecks = 10; // Arbitrary number of checks
    const score = Math.max(0, ((totalChecks - allIssues.length) / totalChecks) * 100);

    return {
      issues: allIssues,
      score: Math.round(score),
    };
  }
}

// Utility functions
function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 bytes";

  const k = 1024;
  const sizes = ["bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

function formatDateForScreenReader(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "today";
  if (diffDays === 1) return "yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;

  return date.toLocaleDateString();
}
