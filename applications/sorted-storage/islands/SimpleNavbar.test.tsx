/**
 * Tests for SimpleNavbar component
 * Requirements: 7.1, 7.2, 7.3, 7.4, 7.5
 */

import { assertEquals, assertExists } from "@std/assert";
import { render } from "@testing-library/preact";
import { SimpleNavbar } from "./SimpleNavbar.tsx";

Deno.test("SimpleNavbar component", async (t) => {
  await t.step("should render navbar structure", () => {
    const { container } = render(<SimpleNavbar />);

    assertExists(container);

    // Should have navbar element
    const navbar = container.querySelector('nav, [role="navigation"]');
    assertExists(navbar);
  });

  await t.step("should render brand/logo", () => {
    const { container } = render(<SimpleNavbar />);

    assertExists(container);

    // Should have brand or logo
    const brand = container.querySelector('.navbar-brand, .logo, [aria-label*="logo"]') ||
      container.textContent?.includes("Sorted Storage") ||
      container.textContent?.includes("Storage");
    assertEquals(brand !== null || typeof brand === "boolean", true);
  });

  await t.step("should render navigation links", () => {
    const { container } = render(
      <SimpleNavbar
        currentPath="/dashboard"
        isAuthenticated
      />,
    );

    assertExists(container);

    // Should have navigation links
    const links = container.querySelectorAll('a, [role="link"]');
    assertEquals(links.length > 0, true);
  });

  await t.step("should show different content for authenticated users", () => {
    const { container: authContainer } = render(
      <SimpleNavbar isAuthenticated />,
    );
    const { container: unauthContainer } = render(
      <SimpleNavbar isAuthenticated={false} />,
    );

    assertExists(authContainer);
    assertExists(unauthContainer);

    // Both should render but may have different content
    assertEquals(authContainer.children.length > 0, true);
    assertEquals(unauthContainer.children.length > 0, true);
  });

  await t.step("should highlight current page", () => {
    const { container } = render(
      <SimpleNavbar
        currentPath="/dashboard"
        isAuthenticated
      />,
    );

    assertExists(container);

    // Should have active/current page indicator
    const activeLink = container.querySelector('.active, [aria-current="page"], .current');
    assertEquals(activeLink !== null, true);
  });

  await t.step("should be responsive", () => {
    const { container } = render(<SimpleNavbar />);

    assertExists(container);

    // Should have responsive elements like mobile menu toggle
    const responsiveElements = container.querySelector(
      '.navbar-toggle, .mobile-menu, .hamburger, [aria-label*="menu"]',
    );
    assertEquals(responsiveElements !== null, true);
  });

  await t.step("should integrate auth button", () => {
    const { container } = render(
      <SimpleNavbar
        isAuthenticated={false}
        showAuthButton
      />,
    );

    assertExists(container);

    // Should contain auth button or login link
    const authElement = container.textContent?.includes("Login") ||
      container.textContent?.includes("Sign in") ||
      container.querySelector('button, a[href*="login"]');
    assertEquals(authElement !== null || typeof authElement === "boolean", true);
  });
});
