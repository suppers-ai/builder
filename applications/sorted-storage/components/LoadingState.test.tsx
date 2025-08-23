/**
 * Tests for LoadingState component
 * Requirements: 8.1, 8.3, 8.4
 */

import { assertEquals, assertExists } from "@std/assert";
import { render } from "@testing-library/preact";
import { LoadingState } from "./LoadingState.tsx";

Deno.test("LoadingState component", async (t) => {
  await t.step("should render default loading state", () => {
    const { container } = render(<LoadingState />);

    assertExists(container);
    assertEquals(container.textContent?.includes("Loading"), true);
  });

  await t.step("should render with custom message", () => {
    const { container } = render(<LoadingState message="Loading files..." />);

    assertExists(container);
    assertEquals(container.textContent?.includes("Loading files..."), true);
  });

  await t.step("should render with spinner", () => {
    const { container } = render(<LoadingState showSpinner />);

    assertExists(container);
    // Check for spinner element or loading indicator
    const hasSpinner = container.querySelector('[role="status"]') ||
      container.querySelector(".loading") ||
      container.querySelector(".spinner");
    assertEquals(hasSpinner !== null, true);
  });

  await t.step("should render with different sizes", () => {
    const { container: smallContainer } = render(<LoadingState size="sm" />);
    const { container: largeContainer } = render(<LoadingState size="lg" />);

    assertExists(smallContainer);
    assertExists(largeContainer);

    // Both should render successfully
    assertEquals(smallContainer.children.length > 0, true);
    assertEquals(largeContainer.children.length > 0, true);
  });
});
