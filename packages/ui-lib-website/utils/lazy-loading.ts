// Lazy loading utilities for performance optimization

/**
 * Intersection Observer for lazy loading images
 */
export function createImageLazyLoader() {
  if (typeof window === "undefined") return;

  const imageObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const img = entry.target as HTMLImageElement;

        // Replace data-src with src for lazy loading
        if (img.dataset.src) {
          img.src = img.dataset.src;
          img.removeAttribute("data-src");
        }

        // Replace data-srcset with srcset
        if (img.dataset.srcset) {
          img.srcset = img.dataset.srcset;
          img.removeAttribute("data-srcset");
        }

        // Add loaded class for transitions
        img.classList.add("lazy-loaded");

        // Stop observing this image
        observer.unobserve(img);
      }
    });
  }, {
    rootMargin: "50px 0px", // Start loading 50px before entering viewport
    threshold: 0.01,
  });

  // Observe all images with data-src
  const lazyImages = document.querySelectorAll("img[data-src]");
  lazyImages.forEach((img) => imageObserver.observe(img));

  return imageObserver;
}

/**
 * Intersection Observer for lazy loading component previews
 */
export function createComponentPreviewLazyLoader() {
  if (typeof window === "undefined") return;

  const previewObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const element = entry.target as HTMLElement;

        // Add loaded class for animations
        element.classList.add("preview-loaded");

        // Trigger any lazy-loaded content inside
        const lazyContent = element.querySelector("[data-lazy-content]");
        if (lazyContent) {
          lazyContent.removeAttribute("data-lazy-content");
        }

        // Stop observing this element
        observer.unobserve(element);
      }
    });
  }, {
    rootMargin: "100px 0px", // Start loading 100px before entering viewport
    threshold: 0.1,
  });

  // Observe all component preview cards
  const previewCards = document.querySelectorAll(".component-preview-card");
  previewCards.forEach((card) => previewObserver.observe(card));

  return previewObserver;
}

/**
 * Preload critical resources
 */
export function preloadCriticalResources() {
  if (typeof document === "undefined") return;

  // Preload critical CSS
  const criticalCSS = [
    "/styles.css",
    "/theme-transitions.css",
    "/spacing-system.css",
  ];

  criticalCSS.forEach((href) => {
    const link = document.createElement("link");
    link.rel = "preload";
    link.as = "style";
    link.href = href;
    document.head.appendChild(link);
  });

  // Preload critical fonts
  const criticalFonts = [
    "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap",
  ];

  criticalFonts.forEach((href) => {
    const link = document.createElement("link");
    link.rel = "preload";
    link.as = "style";
    link.href = href;
    document.head.appendChild(link);
  });
}

/**
 * Implement virtual scrolling for large lists
 */
export class VirtualScrollManager {
  private container: HTMLElement;
  private items: any[];
  private itemHeight: number;
  private visibleItems: number;
  private scrollTop: number = 0;
  private renderCallback: (items: any[], startIndex: number) => void;

  constructor(
    container: HTMLElement,
    items: any[],
    itemHeight: number,
    renderCallback: (items: any[], startIndex: number) => void,
  ) {
    this.container = container;
    this.items = items;
    this.itemHeight = itemHeight;
    this.visibleItems = Math.ceil(container.clientHeight / itemHeight) + 2; // Buffer
    this.renderCallback = renderCallback;

    this.setupScrollListener();
    this.render();
  }

  private setupScrollListener() {
    this.container.addEventListener("scroll", () => {
      this.scrollTop = this.container.scrollTop;
      this.render();
    });
  }

  private render() {
    const startIndex = Math.floor(this.scrollTop / this.itemHeight);
    const endIndex = Math.min(startIndex + this.visibleItems, this.items.length);

    const visibleItems = this.items.slice(startIndex, endIndex);
    this.renderCallback(visibleItems, startIndex);

    // Set container height to maintain scroll position
    const totalHeight = this.items.length * this.itemHeight;
    this.container.style.height = `${totalHeight}px`;
  }

  updateItems(newItems: any[]) {
    this.items = newItems;
    this.render();
  }
}

/**
 * Debounce function for performance optimization
 */
export function debounce<T extends (...args: any[]) => void>(
  func: T,
  delay: number,
): (...args: Parameters<T>) => void {
  let timeoutId: number;

  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
}

/**
 * Throttle function for scroll events
 */
export function throttle<T extends (...args: any[]) => void>(
  func: T,
  delay: number,
): (...args: Parameters<T>) => void {
  let lastCall = 0;

  return (...args: Parameters<T>) => {
    const now = Date.now();
    if (now - lastCall >= delay) {
      lastCall = now;
      func(...args);
    }
  };
}

/**
 * Resource prefetching for anticipated navigation
 */
export function prefetchResource(url: string, type: "script" | "style" | "fetch" = "fetch") {
  if (typeof document === "undefined") return;

  switch (type) {
    case "script":
      const script = document.createElement("link");
      script.rel = "prefetch";
      script.as = "script";
      script.href = url;
      document.head.appendChild(script);
      break;

    case "style":
      const style = document.createElement("link");
      style.rel = "prefetch";
      style.as = "style";
      style.href = url;
      document.head.appendChild(style);
      break;

    case "fetch":
    default:
      fetch(url, { method: "HEAD" }).catch(() => {
        // Silently fail for prefetch
      });
      break;
  }
}

/**
 * Memory management for component cleanup
 */
export class MemoryManager {
  private static observers: IntersectionObserver[] = [];
  private static eventListeners: { element: Element; type: string; listener: EventListener }[] = [];

  static addObserver(observer: IntersectionObserver) {
    this.observers.push(observer);
  }

  static addEventListener(element: Element, type: string, listener: EventListener) {
    element.addEventListener(type, listener);
    this.eventListeners.push({ element, type, listener });
  }

  static cleanup() {
    // Disconnect all observers
    this.observers.forEach((observer) => observer.disconnect());
    this.observers = [];

    // Remove all event listeners
    this.eventListeners.forEach(({ element, type, listener }) => {
      element.removeEventListener(type, listener);
    });
    this.eventListeners = [];
  }
}

/**
 * Performance monitoring utilities
 */
export class PerformanceMonitor {
  private static marks: Map<string, number> = new Map();

  static mark(name: string) {
    if (typeof performance !== "undefined") {
      performance.mark(name);
      this.marks.set(name, performance.now());
    }
  }

  static measure(name: string, startMark: string, endMark?: string) {
    if (typeof performance !== "undefined") {
      try {
        if (endMark) {
          performance.measure(name, startMark, endMark);
        } else {
          performance.measure(name, startMark);
        }

        const measure = performance.getEntriesByName(name, "measure")[0];
        console.log(`Performance: ${name} took ${measure.duration.toFixed(2)}ms`);
        return measure.duration;
      } catch (error) {
        console.warn("Performance measurement failed:", error);
      }
    }
    return 0;
  }

  static getMetrics() {
    if (typeof performance !== "undefined") {
      const navigation = performance.getEntriesByType(
        "navigation",
      )[0] as PerformanceNavigationTiming;
      const paint = performance.getEntriesByType("paint");

      return {
        domContentLoaded: navigation.domContentLoadedEventEnd -
          navigation.domContentLoadedEventStart,
        loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
        firstPaint: paint.find((entry) => entry.name === "first-paint")?.startTime || 0,
        firstContentfulPaint: paint.find((entry) =>
          entry.name === "first-contentful-paint"
        )?.startTime || 0,
        marks: Array.from(this.marks.entries()),
      };
    }
    return null;
  }
}
