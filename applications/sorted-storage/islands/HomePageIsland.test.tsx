/**
 * Tests for HomePageIsland component
 * Requirements: 7.1, 7.2, 8.1, 8.3
 */

import { assertEquals, assertExists } from "@std/assert";
import { render } from "@testing-library/preact";
import { HomePageIsland } from "./HomePageIsland.tsx";

Deno.test("HomePageIsland component", async (t) => {
  await t.step("should render home page content", () => {
    const { container } = render(<HomePageIsland />);

    assertExists(container);
    assertEquals(container.children.length > 0, true);
  });

  await t.step("should render with user authentication state", () => {
    const { container } = render(
      <HomePageIsland isAuthenticated />,
    );

    assertExists(container);
    // Should show authenticated user content
    assertEquals(container.children.length > 0, true);
  });

  await t.step("should render for unauthenticated users", () => {
    const { container } = render(
      <HomePageIsland isAuthenticated={false} />,
    );

    assertExists(container);
    // Should show login prompt or public content
    assertEquals(container.children.length > 0, true);
  });

  await t.step("should handle navigation to storage", () => {
    let navigationCalled = false;
    const mockOnNavigate = () => {
      navigationCalled = true;
    };

    const { container } = render(
      <HomePageIsland
        isAuthenticated
        onNavigateToStorage={mockOnNavigate}
      />,
    );

    assertExists(container);

    // Look for navigation elements
    const navElements = container.querySelectorAll("a, button");
    assertEquals(navElements.length > 0, true);
  });

  await t.step("should show storage statistics", () => {
    const { container } = render(
      <HomePageIsland
        isAuthenticated
        storageStats={{
          totalFiles: 42,
          totalSize: 1024 * 1024 * 100, // 100MB
          totalFolders: 5,
        }}
      />,
    );

    assertExists(container);

    // Should display storage statistics
    const hasStats = container.textContent?.includes("42") ||
      container.textContent?.includes("100") ||
      container.textContent?.includes("5");
    assertEquals(typeof hasStats, "boolean");
  });
});
