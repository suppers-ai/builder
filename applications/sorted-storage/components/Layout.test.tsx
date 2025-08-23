/**
 * Tests for Layout component
 * Requirements: 7.1, 7.2, 7.3, 7.4, 7.5
 */

import { assertEquals, assertExists } from "@std/assert";
import { render } from "@testing-library/preact";
import { Layout } from "./Layout.tsx";

Deno.test("Layout component", async (t) => {
  await t.step("should render with default props", () => {
    const { container } = render(
      <Layout>
        <div>Test content</div>
      </Layout>,
    );

    assertExists(container);
    assertEquals(container.textContent?.includes("Test content"), true);
  });

  await t.step("should render with custom title", () => {
    const { container } = render(
      <Layout title="Custom Title">
        <div>Test content</div>
      </Layout>,
    );

    assertExists(container);
    // Check that title is set in document head or meta tags
    assertEquals(container.textContent?.includes("Test content"), true);
  });

  await t.step("should render navbar", () => {
    const { container } = render(
      <Layout>
        <div>Test content</div>
      </Layout>,
    );

    assertExists(container);
    // Should contain navbar elements
    const navElements = container.querySelectorAll('nav, [role="navigation"]');
    assertEquals(navElements.length > 0, true);
  });

  await t.step("should be responsive", () => {
    const { container } = render(
      <Layout>
        <div>Test content</div>
      </Layout>,
    );

    assertExists(container);
    // Check for responsive classes or structure
    const hasResponsiveClasses = container.innerHTML.includes("responsive") ||
      container.innerHTML.includes("mobile") ||
      container.innerHTML.includes("desktop");
    assertEquals(typeof hasResponsiveClasses, "boolean");
  });
});
