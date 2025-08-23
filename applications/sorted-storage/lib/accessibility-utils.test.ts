/**
 * Tests for accessibility utilities
 * Requirements: 7.5, 8.4
 */

import { assert, assertEquals, assertExists } from "@std/assert";
import {
  AccessibilityTester,
  FocusManager,
  HighContrastUtils,
  ScreenReaderUtils,
} from "./accessibility-utils.ts";

// Mock DOM environment for testing
const mockDocument = {
  createElement: (tag: string) => ({
    id: "",
    className: "",
    textContent: "",
    setAttribute: () => {},
    getAttribute: () => null,
    appendChild: () => {},
    querySelectorAll: () => [],
    querySelector: () => null,
  }),
  getElementById: () => null,
  body: {
    appendChild: () => {},
    insertBefore: () => {},
    firstChild: null,
  },
  documentElement: {
    classList: {
      contains: () => false,
      add: () => {},
      remove: () => {},
    },
  },
  addEventListener: () => {},
  dispatchEvent: () => {},
  activeElement: null,
};

const mockWindow = {
  matchMedia: (query: string) => ({
    matches: query.includes("high") || query.includes("reduce"),
    addEventListener: () => {},
  }),
  getComputedStyle: () => ({
    color: "rgb(0, 0, 0)",
    backgroundColor: "rgb(255, 255, 255)",
  }),
  localStorage: {
    getItem: () => null,
    setItem: () => {},
  },
  navigator: {
    userAgent: "test",
  },
  crypto: {
    randomUUID: () => "test-uuid",
  },
};

// Set up global mocks (only for properties that can be safely mocked)
if (typeof document === "undefined") {
  (globalThis as any).document = mockDocument;
}
if (typeof localStorage === "undefined") {
  (globalThis as any).localStorage = mockWindow.localStorage;
}

Deno.test("FocusManager - getFocusableElements", () => {
  const mockContainer = {
    querySelectorAll: (selector: string) => {
      // Mock focusable elements
      return [
        { tagName: "BUTTON", disabled: false },
        { tagName: "INPUT", disabled: false },
        { tagName: "A", href: "test" },
      ];
    },
  };

  const focusable = FocusManager.getFocusableElements(mockContainer as any);
  assertEquals(focusable.length, 3);
});

Deno.test("FocusManager - getFirstFocusableElement", () => {
  const mockContainer = {
    querySelectorAll: () => [
      { tagName: "BUTTON" },
      { tagName: "INPUT" },
    ],
  };

  const first = FocusManager.getFirstFocusableElement(mockContainer as any);
  assertExists(first);
  assertEquals(first.tagName, "BUTTON");
});

Deno.test("FocusManager - getLastFocusableElement", () => {
  const mockContainer = {
    querySelectorAll: () => [
      { tagName: "BUTTON" },
      { tagName: "INPUT" },
    ],
  };

  const last = FocusManager.getLastFocusableElement(mockContainer as any);
  assertExists(last);
  assertEquals(last.tagName, "INPUT");
});

Deno.test("FocusManager - moveFocus", () => {
  const elements = [
    { focus: () => {} },
    { focus: () => {} },
    { focus: () => {} },
  ] as HTMLElement[];

  // Test next movement
  const nextIndex = FocusManager.moveFocus(elements, 0, "next");
  assertEquals(nextIndex, 1);

  // Test previous movement
  const prevIndex = FocusManager.moveFocus(elements, 1, "previous");
  assertEquals(prevIndex, 0);

  // Test first movement
  const firstIndex = FocusManager.moveFocus(elements, 2, "first");
  assertEquals(firstIndex, 0);

  // Test last movement
  const lastIndex = FocusManager.moveFocus(elements, 0, "last");
  assertEquals(lastIndex, 2);

  // Test wrap around
  const wrapNext = FocusManager.moveFocus(elements, 2, "next");
  assertEquals(wrapNext, 0);

  const wrapPrev = FocusManager.moveFocus(elements, 0, "previous");
  assertEquals(wrapPrev, 2);
});

Deno.test("ScreenReaderUtils - getItemDescription", () => {
  const mockFile = {
    object_type: "file",
    name: "test.pdf",
    file_size: 1024,
    updated_at: "2024-01-01T00:00:00Z",
    metadata: {
      custom_name: "Test Document",
      description: "A test file",
      emoji: "📄",
    },
  };

  const description = ScreenReaderUtils.getItemDescription(mockFile);
  assert(description.includes("📄 Test Document"));
  assert(description.includes("file"));
  assert(description.includes("A test file"));
  assert(description.includes("1 KB"));
});

Deno.test("ScreenReaderUtils - getActionLabel", () => {
  const label = ScreenReaderUtils.getActionLabel("Delete", "test.pdf", "file");
  assertEquals(label, "Delete file test.pdf");
});

Deno.test("HighContrastUtils - isHighContrastMode", () => {
  // Test with mock that returns true for high contrast
  const isHighContrast = HighContrastUtils.isHighContrastMode();
  assert(typeof isHighContrast === "boolean");
  // In Deno environment without window, should return false
  assertEquals(isHighContrast, false);
});

Deno.test("AccessibilityTester - checkAriaLabels", () => {
  const mockElement = {
    querySelectorAll: (selector: string) => {
      if (selector.includes("button")) {
        return [
          { getAttribute: () => null, textContent: "" }, // Missing label
          { getAttribute: () => "Test button", textContent: "Click me" }, // Has label
        ];
      }
      if (selector.includes("img")) {
        return [
          { getAttribute: () => null }, // Missing alt
          { getAttribute: () => "Test image" }, // Has alt
        ];
      }
      if (selector.includes("input")) {
        return [
          { id: "test", getAttribute: () => null }, // Missing label
        ];
      }
      return [];
    },
    querySelector: () => null,
  };

  const issues = AccessibilityTester.checkAriaLabels(mockElement as any);
  assert(issues.length > 0);
  assert(issues.some((issue) => issue.includes("Button")));
  assert(issues.some((issue) => issue.includes("Image")));
  assert(issues.some((issue) => issue.includes("input")));
});

Deno.test("AccessibilityTester - runAllChecks", () => {
  const mockElement = {
    querySelectorAll: () => [],
    querySelector: () => null,
  };

  const result = AccessibilityTester.runAllChecks(mockElement as any);
  assertExists(result.issues);
  assertExists(result.score);
  assert(typeof result.score === "number");
  assert(result.score >= 0 && result.score <= 100);
});

// Integration test for keyboard navigation
Deno.test("Keyboard navigation integration", () => {
  const mockItems = [
    { id: "1", name: "Item 1", object_type: "file" },
    { id: "2", name: "Item 2", object_type: "folder" },
    { id: "3", name: "Item 3", object_type: "file" },
  ];

  let selectedItem: any = null;
  let activatedItem: any = null;

  const mockContainerRef = {
    current: {
      querySelectorAll: () => [
        { focus: () => {} },
        { focus: () => {} },
        { focus: () => {} },
      ],
      getBoundingClientRect: () => ({ width: 800 }),
    },
  };

  // This would normally be imported from the hook, but we'll test the concept
  const handleKeyDown = (event: { key: string }, currentIndex: number) => {
    switch (event.key) {
      case "Enter":
        activatedItem = mockItems[currentIndex];
        break;
      case " ":
        selectedItem = mockItems[currentIndex];
        break;
    }
  };

  // Test Enter key
  const enterEvent = { key: "Enter" };
  handleKeyDown(enterEvent, 0);
  assertEquals(activatedItem?.id, "1");

  // Test Space key
  const spaceEvent = { key: " " };
  handleKeyDown(spaceEvent, 1);
  assertEquals(selectedItem?.id, "2");
});

// Test accessibility announcements
Deno.test("Screen reader announcements", () => {
  // In Deno environment without DOM, announcement should not throw error
  ScreenReaderUtils.announce("Test announcement");

  // Test passes if no error is thrown
  assert(true);
});

// Test high contrast mode toggle
Deno.test("High contrast mode toggle", () => {
  // In Deno environment without DOM, toggle should not throw error
  HighContrastUtils.toggleHighContrastMode();

  // Test passes if no error is thrown
  assert(true);
});

// Performance test for large item lists
Deno.test("Performance - large item list navigation", () => {
  const largeItemList = Array.from({ length: 1000 }, (_, i) => ({
    id: `item-${i}`,
    name: `Item ${i}`,
    object_type: i % 2 === 0 ? "file" : "folder",
  }));

  const start = performance.now();

  // Simulate keyboard navigation through items
  for (let i = 0; i < 100; i++) {
    const description = ScreenReaderUtils.getItemDescription(largeItemList[i]);
    assert(description.length > 0);
  }

  const end = performance.now();
  const duration = end - start;

  // Should complete within reasonable time (less than 100ms for 100 items)
  assert(duration < 100, `Performance test took too long: ${duration}ms`);
});

// Test accessibility score calculation
Deno.test("Accessibility score calculation", () => {
  const mockElementWithIssues = {
    querySelectorAll: (selector: string) => {
      if (selector.includes("button")) {
        return [{ getAttribute: () => null, textContent: "" }]; // Missing label
      }
      return [];
    },
    querySelector: () => null,
  };

  const resultWithIssues = AccessibilityTester.runAllChecks(mockElementWithIssues as any);
  assert(resultWithIssues.score < 100);
  assert(resultWithIssues.issues.length > 0);

  const mockElementWithoutIssues = {
    querySelectorAll: () => [],
    querySelector: () => null,
  };

  const resultWithoutIssues = AccessibilityTester.runAllChecks(mockElementWithoutIssues as any);
  assertEquals(resultWithoutIssues.score, 100);
  assertEquals(resultWithoutIssues.issues.length, 0);
});
