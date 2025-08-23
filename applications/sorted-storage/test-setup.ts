/**
 * Test setup and configuration for sorted-storage application
 * Requirements: 8.1, 8.2, 8.3, 8.4, 8.5
 */

// Mock global objects for testing environment
// deno-lint-ignore no-explicit-any
(globalThis as any).IntersectionObserver = class MockIntersectionObserver {
  callback: IntersectionObserverCallback;

  constructor(callback: IntersectionObserverCallback) {
    this.callback = callback;
  }

  observe() {
    // Mock implementation
  }

  unobserve() {
    // Mock implementation
  }

  disconnect() {
    // Mock implementation
  }

  trigger(entries: Partial<IntersectionObserverEntry>[]) {
    // deno-lint-ignore no-explicit-any
    this.callback(entries as IntersectionObserverEntry[], this as any);
  }
};

// Mock fetch for API calls
// deno-lint-ignore no-explicit-any
(globalThis as any).fetch = (_url: string, _options?: RequestInit) => {
  // Default mock response
  return Promise.resolve(
    new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    }),
  );
};

// Mock File and FileReader for upload tests
(globalThis as any).File = class MockFile {
  constructor(
    public chunks: BlobPart[],
    public name: string,
    public options: FilePropertyBag = {},
  ) {
    this.size = chunks.reduce((size, chunk) => {
      if (typeof chunk === "string") return size + chunk.length;
      if (chunk instanceof ArrayBuffer) return size + chunk.byteLength;
      return size + (chunk as any).size || 0;
    }, 0);
    this.type = options.type || "";
    this.lastModified = options.lastModified || Date.now();
  }

  size: number;
  type: string;
  lastModified: number;

  stream() {
    return new ReadableStream();
  }

  text() {
    return Promise.resolve("mock file content");
  }

  arrayBuffer() {
    return Promise.resolve(new ArrayBuffer(0));
  }

  slice() {
    return new MockFile([], this.name);
  }
};

(globalThis as any).FileReader = class MockFileReader extends EventTarget {
  result: string | ArrayBuffer | null = null;
  error: DOMException | null = null;
  readyState: number = 0;

  readAsDataURL(file: File) {
    setTimeout(() => {
      this.result = `data:${file.type};base64,mock-data`;
      this.readyState = 2;
      this.dispatchEvent(new Event("load"));
    }, 0);
  }

  readAsText(file: File) {
    setTimeout(() => {
      this.result = "mock file content";
      this.readyState = 2;
      this.dispatchEvent(new Event("load"));
    }, 0);
  }
};

// Mock URL.createObjectURL
(globalThis as any).URL = {
  createObjectURL: (blob: Blob) => `blob:mock-url-${Date.now()}`,
  revokeObjectURL: (url: string) => {},
};

// Mock localStorage
(globalThis as any).localStorage = {
  getItem: (key: string) => null,
  setItem: (key: string, value: string) => {},
  removeItem: (key: string) => {},
  clear: () => {},
  length: 0,
  key: (index: number) => null,
};

// Mock sessionStorage
(globalThis as any).sessionStorage = {
  getItem: (key: string) => null,
  setItem: (key: string, value: string) => {},
  removeItem: (key: string) => {},
  clear: () => {},
  length: 0,
  key: (index: number) => null,
};

export {};
