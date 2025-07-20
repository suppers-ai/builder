import { expect, test } from "@playwright/test";

test.describe("ComponentPageTemplate E2E Tests", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:8001/components/action/button"); // Use existing component page
    await page.waitForLoadState("networkidle");
  });

  test("component page template renders correctly", async ({ page }) => {
    await expect(page).toHaveTitle("DaisyUI Component Library - Fresh 2.0");
    await expect(page.locator("h1").first()).toBeVisible();
    await expect(page.locator(".breadcrumbs")).toBeVisible();
  });

  test("component page navigation works", async ({ page }) => {
    // Test breadcrumb navigation
    await expect(page.locator(".breadcrumbs")).toContainText("Home");
    await expect(page.locator(".breadcrumbs")).toContainText("Components");

    // Test sidebar navigation
    await expect(page.locator("aside")).toBeVisible();
    await expect(page.locator("aside")).toContainText("Components");
  });

  test("component examples are interactive", async ({ page }) => {
    // Test that examples are rendered
    const examples = page.locator(".card");
    const exampleCount = await examples.count();
    expect(exampleCount).toBeGreaterThan(0);

    // Test that the first example is visible
    await expect(examples.first()).toBeVisible();
  });

  test("API documentation is present", async ({ page }) => {
    // Most component pages should have API documentation
    await expect(page.locator("table, .api-table")).toBeVisible();
  });

  test("responsive behavior on mobile", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });

    await expect(page.locator("h1").first()).toBeVisible();
    await expect(page.locator("main").first()).toBeVisible();

    // Check if mobile navigation is present
    const hamburger = page.locator(
      'button[aria-label="Toggle menu"], .btn-ghost.btn-square.lg\\:hidden, button:has-text("☰")',
    );
    const hasHamburger = await hamburger.count() > 0;

    if (hasHamburger) {
      await expect(hamburger.first()).toBeVisible();
    }
  });

  test("keyboard navigation works", async ({ page }) => {
    // Test tab navigation through the page
    await page.keyboard.press("Tab");

    const focusedElement = page.locator(":focus");
    await expect(focusedElement).toBeVisible();

    // Continue tabbing to ensure navigation is functional
    await page.keyboard.press("Tab");
    await page.keyboard.press("Tab");

    const secondFocusedElement = page.locator(":focus");
    await expect(secondFocusedElement).toBeVisible();
  });

  test("page layout is consistent", async ({ page }) => {
    // Test that key layout elements are present
    await expect(page.locator("header, .navbar")).toBeVisible();
    await expect(page.locator("aside, .sidebar")).toBeVisible();
    await expect(page.locator("main")).toBeVisible();

    // Test that content is properly structured
    const mainContent = page.locator("main");
    const contentHeight = await mainContent.evaluate((el) => el.offsetHeight);
    expect(contentHeight).toBeGreaterThan(200);
  });

  test("page performance is acceptable", async ({ page }) => {
    const navigationPromise = page.waitForLoadState("networkidle");
    const startTime = Date.now();

    await page.goto("http://localhost:8001/components/action/button");
    await navigationPromise;

    const loadTime = Date.now() - startTime;
    expect(loadTime).toBeLessThan(3000);
  });
});
