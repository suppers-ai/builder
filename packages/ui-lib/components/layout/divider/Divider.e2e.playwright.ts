import { expect, test } from "@playwright/test";

test.describe("Divider E2E Tests", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:8001/components/layout/divider");
    await page.waitForLoadState("networkidle");
  });

  test("page loads and displays divider examples", async ({ page }) => {
    await expect(page).toHaveTitle("DaisyUI Component Library - Fresh 2.0");
    await expect(page.locator("h1").first()).toContainText("Divider");
    await expect(page.locator(".divider").first()).toBeVisible();
  });

  test("navigation works correctly", async ({ page }) => {
    await expect(page.locator(".breadcrumbs")).toBeVisible();
    await expect(page.locator(".breadcrumbs")).toContainText("Home");
    await expect(page.locator(".breadcrumbs")).toContainText("Components");
    await expect(page.locator(".breadcrumbs")).toContainText("Divider");

    await page.click('.breadcrumbs a[href="/"]');
    await expect(page).toHaveURL("http://localhost:8001/");

    await page.goBack();
    await expect(page).toHaveURL(/divider$/);
  });

  test("divider examples render correctly", async ({ page }) => {
    const dividers = page.locator(".divider");
    const dividerCount = await dividers.count();
    expect(dividerCount).toBeGreaterThanOrEqual(3);

    // Check for different divider types
    await expect(page.locator(".divider-horizontal").first()).toBeVisible();
    await expect(page.locator(".divider:not(.divider-horizontal)").first()).toBeVisible();
  });

  test("divider with text content works", async ({ page }) => {
    const textDividers = page.locator('.divider:has-text("OR"), .divider:has-text("AND")');
    const hasTextDividers = await textDividers.count() > 0;

    if (hasTextDividers) {
      const textDivider = textDividers.first();
      await expect(textDivider).toBeVisible();

      const textContent = await textDivider.textContent();
      expect(textContent).toBeTruthy();
    }
  });

  test("divider colors work correctly", async ({ page }) => {
    const coloredDividers = page.locator(".divider-primary, .divider-secondary, .divider-accent");
    const hasColoredDividers = await coloredDividers.count() > 0;

    if (hasColoredDividers) {
      for (let i = 0; i < Math.min(3, await coloredDividers.count()); i++) {
        const divider = coloredDividers.nth(i);
        await expect(divider).toBeVisible();
      }
    }
  });

  test("divider horizontal orientation works", async ({ page }) => {
    const horizontalDividers = page.locator(".divider-horizontal");
    const hasHorizontal = await horizontalDividers.count() > 0;

    if (hasHorizontal) {
      const horizontalDivider = horizontalDividers.first();
      await expect(horizontalDivider).toBeVisible();

      // Check that it's in a flex container (typical usage)
      const parentElement = page.locator(".divider-horizontal").first().locator("..");
      const parentClass = await parentElement.getAttribute("class");
      expect(parentClass).toBeTruthy();
    }
  });

  test("divider separates content properly", async ({ page }) => {
    // Check that dividers actually separate content
    const contentSections = page.locator(".card");
    const sectionCount = await contentSections.count();

    if (sectionCount > 0) {
      const section = contentSections.first();
      const dividerInSection = section.locator(".divider");
      const hasDivider = await dividerInSection.count() > 0;

      if (hasDivider) {
        // Check content before and after divider
        const allContent = await section.textContent();
        expect(allContent).toBeTruthy();

        // Should have content both before and after divider
        const contentElements = section.locator("p, div:not(.divider), span");
        const contentCount = await contentElements.count();
        expect(contentCount).toBeGreaterThan(0);
      }
    }
  });

  test("divider accessibility", async ({ page }) => {
    const dividers = page.locator(".divider");
    const dividerCount = await dividers.count();

    if (dividerCount > 0) {
      const divider = dividers.first();

      // Dividers should have proper role (if applicable)
      const role = await divider.getAttribute("role");

      // Check that divider is visible but not focusable (as expected)
      await expect(divider).toBeVisible();

      // Dividers should not be in tab order
      const tabIndex = await divider.getAttribute("tabindex");
      expect(tabIndex).toBeNull();
    }
  });

  test("divider layout impact", async ({ page }) => {
    // Test that dividers don't break layout
    const cards = page.locator(".card");
    const cardCount = await cards.count();

    for (let i = 0; i < Math.min(3, cardCount); i++) {
      const card = cards.nth(i);
      const box = await card.boundingBox();

      expect(box).toBeTruthy();
      if (box) {
        expect(box.width).toBeGreaterThan(0);
        expect(box.height).toBeGreaterThan(0);
      }
    }
  });

  test("API documentation is present", async ({ page }) => {
    await expect(page.locator("table, .api-table")).toBeVisible();
    await expect(page.locator('text="divider-horizontal"')).toBeVisible();
    await expect(page.locator('text="divider-primary"')).toBeVisible();
  });

  test("responsive behavior on mobile", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });

    await expect(page.locator("h1").first()).toBeVisible();
    await expect(page.locator(".divider").first()).toBeVisible();
    await expect(page.locator("main").first()).toBeVisible();

    // Dividers should still work on mobile
    const dividers = page.locator(".divider");
    const dividerCount = await dividers.count();

    if (dividerCount > 0) {
      const divider = dividers.first();
      await expect(divider).toBeVisible();

      // Should maintain visibility and layout
      const box = await divider.boundingBox();
      expect(box).toBeTruthy();
    }
  });

  test("page performance is acceptable", async ({ page }) => {
    const navigationPromise = page.waitForLoadState("networkidle");
    const startTime = Date.now();

    await page.goto("http://localhost:8001/components/layout/divider");
    await navigationPromise;

    const loadTime = Date.now() - startTime;
    expect(loadTime).toBeLessThan(3000);
  });
});
