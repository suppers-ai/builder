import { expect, test } from "@playwright/test";

test.describe("Join E2E Tests", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:8001/components/layout/join");
    await page.waitForLoadState("networkidle");
  });

  test("page loads and displays join examples", async ({ page }) => {
    await expect(page).toHaveTitle("DaisyUI Component Library - Fresh 2.0");
    await expect(page.locator("h1").first()).toContainText("Join");
    await expect(page.locator(".join").first()).toBeVisible();
  });

  test("navigation works correctly", async ({ page }) => {
    await expect(page.locator(".breadcrumbs")).toBeVisible();
    await expect(page.locator(".breadcrumbs")).toContainText("Home");
    await expect(page.locator(".breadcrumbs")).toContainText("Components");
    await expect(page.locator(".breadcrumbs")).toContainText("Join");

    await page.click('.breadcrumbs a[href="/"]');
    await expect(page).toHaveURL("http://localhost:8001/");

    await page.goBack();
    await expect(page).toHaveURL(/join$/);
  });

  test("join examples render correctly", async ({ page }) => {
    const joins = page.locator(".join");
    const joinCount = await joins.count();
    expect(joinCount).toBeGreaterThanOrEqual(1);

    // Check for join items
    await expect(page.locator(".join-item").first()).toBeVisible();
  });

  test("join button interaction works", async ({ page }) => {
    const joinButtons = page.locator(".join button.join-item");
    const hasButtons = await joinButtons.count() > 0;

    if (hasButtons) {
      const button = joinButtons.first();
      await button.click();
      await expect(button).toBeVisible();
    }
  });

  test("join input functionality works", async ({ page }) => {
    const joinInputs = page.locator(".join input.join-item");
    const hasInputs = await joinInputs.count() > 0;

    if (hasInputs) {
      const input = joinInputs.first();
      await input.focus();
      await expect(input).toBeFocused();

      await input.fill("test@example.com");
      const value = await input.inputValue();
      expect(value).toBe("test@example.com");
    }
  });

  test("API documentation is present", async ({ page }) => {
    await expect(page.locator("table, .api-table")).toBeVisible();
    await expect(page.locator('text="join-item"')).toBeVisible();
  });

  test("responsive behavior on mobile", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.locator("h1").first()).toBeVisible();
    await expect(page.locator(".join").first()).toBeVisible();
  });

  test("page performance is acceptable", async ({ page }) => {
    const navigationPromise = page.waitForLoadState("networkidle");
    const startTime = Date.now();
    await page.goto("http://localhost:8001/components/layout/join");
    await navigationPromise;
    const loadTime = Date.now() - startTime;
    expect(loadTime).toBeLessThan(3000);
  });
});
