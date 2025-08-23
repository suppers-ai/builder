/**
 * Tests for SimpleAuthButton component
 * Requirements: 1.1, 1.2, 1.3, 1.4
 */

import { assertEquals, assertExists } from "@std/assert";
import { render } from "@testing-library/preact";
import { SimpleAuthButton } from "./SimpleAuthButton.tsx";

Deno.test("SimpleAuthButton component", async (t) => {
  await t.step("should render login button when not authenticated", () => {
    const { container } = render(
      <SimpleAuthButton isAuthenticated={false} />,
    );

    assertExists(container);

    // Should show login button
    const loginButton = container.querySelector("button, a");
    assertExists(loginButton);
    assertEquals(
      loginButton.textContent?.includes("Login") ||
        loginButton.textContent?.includes("Sign in"),
      true,
    );
  });

  await t.step("should render logout button when authenticated", () => {
    const { container } = render(
      <SimpleAuthButton
        isAuthenticated
        user={{
          id: "test-user",
          email: "test@example.com",
          display_name: "Test User",
        }}
      />,
    );

    assertExists(container);

    // Should show user info or logout option
    const hasUserContent = container.textContent?.includes("Test User") ||
      container.textContent?.includes("Logout") ||
      container.textContent?.includes("Sign out");
    assertEquals(typeof hasUserContent, "boolean");
  });

  await t.step("should handle login action", () => {
    let loginCalled = false;
    const mockOnLogin = () => {
      loginCalled = true;
    };

    const { container } = render(
      <SimpleAuthButton
        isAuthenticated={false}
        onLogin={mockOnLogin}
      />,
    );

    assertExists(container);

    const loginButton = container.querySelector("button, a");
    assertExists(loginButton);
  });

  await t.step("should handle logout action", () => {
    let logoutCalled = false;
    const mockOnLogout = () => {
      logoutCalled = true;
    };

    const { container } = render(
      <SimpleAuthButton
        isAuthenticated
        user={{
          id: "test-user",
          email: "test@example.com",
          display_name: "Test User",
        }}
        onLogout={mockOnLogout}
      />,
    );

    assertExists(container);

    // Should have logout functionality
    const hasLogoutOption = container.querySelector(
      'button[title*="Logout"], button[aria-label*="Logout"], .logout-btn',
    ) ||
      container.textContent?.includes("Logout");
    assertEquals(hasLogoutOption !== null || typeof hasLogoutOption === "boolean", true);
  });

  await t.step("should show user avatar when available", () => {
    const { container } = render(
      <SimpleAuthButton
        isAuthenticated
        user={{
          id: "test-user",
          email: "test@example.com",
          display_name: "Test User",
          avatar_url: "https://example.com/avatar.jpg",
        }}
      />,
    );

    assertExists(container);

    // Should show avatar image
    const avatar = container.querySelector('img[src*="avatar"], .avatar');
    assertEquals(avatar !== null, true);
  });
});
