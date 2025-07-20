import { expect, test } from "@playwright/test";

test.describe("Stack E2E Tests", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:8001/components/layout/stack");
    await page.waitForLoadState("networkidle");
  });

  test("page loads and displays stack examples", async ({ page }) => {
    await expect(page).toHaveTitle("DaisyUI Component Library - Fresh 2.0");
    await expect(page.locator("h1").first()).toContainText("Stack");
    await expect(page.locator(".stack").first()).toBeVisible();
  });

  test("navigation works correctly", async ({ page }) => {
    await expect(page.locator(".breadcrumbs")).toBeVisible();
    await expect(page.locator(".breadcrumbs")).toContainText("Home");
    await expect(page.locator(".breadcrumbs")).toContainText("Components");
    await expect(page.locator(".breadcrumbs")).toContainText("Stack");

    await page.click('.breadcrumbs a[href="/"]');
    await expect(page).toHaveURL("http://localhost:8001/");

    await page.goBack();
    await expect(page).toHaveURL(/stack$/);
  });

  test("stack examples render correctly", async ({ page }) => {
    const stacks = page.locator(".stack");
    const stackCount = await stacks.count();
    expect(stackCount).toBeGreaterThanOrEqual(1);
  });

  test("stack layering works correctly", async ({ page }) => {
    const stacks = page.locator(".stack");
    const hasStacks = await stacks.count() > 0;

    if (hasStacks) {
      const stack = stacks.first();
      const stackChildren = stack.locator("> *");
      const childCount = await stackChildren.count();

      // Stacks should have multiple children to demonstrate layering
      expect(childCount).toBeGreaterThan(1);

      // All children should be visible
      for (let i = 0; i < childCount; i++) {
        await expect(stackChildren.nth(i)).toBeVisible();
      }
    }
  });

  test("stack with images works", async ({ page }) => {
    const imageStacks = page.locator(".stack img");
    const hasImages = await imageStacks.count() > 0;

    if (hasImages) {
      const imageStack = imageStacks.first();
      await expect(imageStack).toBeVisible();

      // Check if image loaded
      await expect(imageStack).toHaveJSProperty("complete", true);
    }
  });

  test("stack interactive elements work", async ({ page }) => {
    const stackButtons = page.locator(".stack button");
    const stackLinks = page.locator(".stack a");

    const hasButtons = await stackButtons.count() > 0;
    const hasLinks = await stackLinks.count() > 0;

    if (hasButtons) {
      const button = stackButtons.first();
      await button.click();
      await expect(button).toBeVisible();
    }

    if (hasLinks) {
      const link = stackLinks.first();
      await link.hover();
      await expect(link).toBeVisible();
    }
  });

  test("API documentation is present", async ({ page }) => {
    await expect(page.locator("table, .api-table")).toBeVisible();
    await expect(page.locator('text="stack"')).toBeVisible();
  });

  test("responsive behavior on mobile", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.locator("h1").first()).toBeVisible();
    await expect(page.locator(".stack").first()).toBeVisible();
  });

  test("page performance is acceptable", async ({ page }) => {
    const navigationPromise = page.waitForLoadState("networkidle");
    const startTime = Date.now();
    await page.goto("http://localhost:8001/components/layout/stack");
    await navigationPromise;
    const loadTime = Date.now() - startTime;
    expect(loadTime).toBeLessThan(3000);
  });
});
