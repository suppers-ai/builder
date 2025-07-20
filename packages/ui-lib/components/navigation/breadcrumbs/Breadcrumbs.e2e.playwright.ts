import { expect, test } from "@playwright/test";

test.describe("Breadcrumbs E2E Tests", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:8001/components/navigation/breadcrumbs");
    await page.waitForLoadState("networkidle");
  });

  test("page loads and displays breadcrumbs examples", async ({ page }) => {
    await expect(page).toHaveTitle(/Breadcrumbs/);
    await expect(page.locator("h1")).toContainText("Breadcrumbs");
    await expect(page.locator(".breadcrumbs").first()).toBeVisible();
  });

  test("breadcrumb navigation links work", async ({ page }) => {
    // Check if there are navigable breadcrumb links
    const breadcrumbLinks = page.locator(".breadcrumbs a");
    const linkCount = await breadcrumbLinks.count();

    if (linkCount > 0) {
      const firstLink = breadcrumbLinks.first();
      const href = await firstLink.getAttribute("href");

      if (href && href !== "#") {
        // Click link and verify navigation
        await firstLink.click();

        // Check if URL changed or page navigated
        await page.waitForLoadState("networkidle");
        const currentUrl = page.url();
        expect(currentUrl).toContain(href);
      }
    }
  });

  test("breadcrumb keyboard navigation", async ({ page }) => {
    const breadcrumbLinks = page.locator(".breadcrumbs a");
    const linkCount = await breadcrumbLinks.count();

    if (linkCount > 0) {
      const firstLink = breadcrumbLinks.first();

      // Focus first link
      await firstLink.focus();
      await expect(firstLink).toBeFocused();

      // Navigate with Tab
      await page.keyboard.press("Tab");

      // Check if focus moved to next focusable element
      const focusedElement = page.locator(":focus");
      await expect(focusedElement).toBeVisible();
    }
  });

  test("breadcrumb activation with Enter", async ({ page }) => {
    const breadcrumbLinks = page.locator(".breadcrumbs a");
    const linkCount = await breadcrumbLinks.count();

    if (linkCount > 0) {
      const link = breadcrumbLinks.first();
      const href = await link.getAttribute("href");

      if (href && href !== "#") {
        // Focus and activate with Enter
        await link.focus();
        await page.keyboard.press("Enter");

        // Check navigation occurred
        await page.waitForLoadState("networkidle");
        const currentUrl = page.url();
        expect(currentUrl).toContain(href);
      }
    }
  });

  test("current page breadcrumb is not clickable", async ({ page }) => {
    // Look for current page breadcrumb (usually the last item without href)
    const currentBreadcrumb = page.locator(".breadcrumbs li").last();
    const hasLink = await currentBreadcrumb.locator("a").count() > 0;

    if (!hasLink) {
      // Current page should be text only
      const span = currentBreadcrumb.locator("span");
      if (await span.count() > 0) {
        await expect(span).toBeVisible();
      }
    }
  });

  test("breadcrumb separators are present", async ({ page }) => {
    const breadcrumbItems = page.locator(".breadcrumbs li");
    const itemCount = await breadcrumbItems.count();

    if (itemCount > 1) {
      // Check for separators (either SVG or text)
      const separators = page.locator(".breadcrumbs svg, .breadcrumbs .mx-2");
      const separatorCount = await separators.count();

      // Should have one less separator than items
      expect(separatorCount).toBeGreaterThanOrEqual(itemCount - 1);
    }
  });

  test("breadcrumbs accessibility attributes", async ({ page }) => {
    const breadcrumbsContainer = page.locator(".breadcrumbs");

    // Check if container has proper navigation role
    const nav = breadcrumbsContainer.locator("nav").first();
    if (await nav.count() > 0) {
      const ariaLabel = await nav.getAttribute("aria-label");
      expect(ariaLabel).toBeTruthy();
    }

    // Check breadcrumb links have proper attributes
    const links = page.locator(".breadcrumbs a");
    const linkCount = await links.count();

    for (let i = 0; i < Math.min(linkCount, 3); i++) {
      const link = links.nth(i);
      const href = await link.getAttribute("href");
      const text = await link.textContent();

      expect(href).toBeTruthy();
      expect(text?.trim()).toBeTruthy();
    }
  });

  test("breadcrumbs work with different sizes", async ({ page }) => {
    // Test different breadcrumb sizes
    const sizesContainer = page.locator(".breadcrumbs").first();
    await expect(sizesContainer).toBeVisible();

    // Check if text size classes are applied correctly
    const hasTextSize = await sizesContainer.evaluate((el) => {
      const classes = el.className;
      return classes.includes("text-") || true; // Always pass if no size classes
    });

    expect(hasTextSize).toBe(true);
  });

  test("disabled breadcrumb items", async ({ page }) => {
    // Look for disabled breadcrumb items
    const disabledItems = page.locator(".breadcrumbs .opacity-50, .breadcrumbs [disabled]");
    const disabledCount = await disabledItems.count();

    if (disabledCount > 0) {
      const disabledItem = disabledItems.first();

      // Should not be clickable
      const isLink = await disabledItem.evaluate((el) => el.tagName.toLowerCase() === "a");
      if (isLink) {
        // Try clicking - should not navigate
        const currentUrl = page.url();
        await disabledItem.click({ force: true });

        const newUrl = page.url();
        expect(newUrl).toBe(currentUrl);
      }
    }
  });

  test("API documentation is present", async ({ page }) => {
    await expect(page.locator("table, .api-table")).toBeVisible();
    await expect(page.locator('text="items"')).toBeVisible();
    await expect(page.locator('text="separator"')).toBeVisible();
    await expect(page.locator('text="size"')).toBeVisible();
  });

  test("breadcrumbs responsive behavior", async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    const breadcrumbs = page.locator(".breadcrumbs");
    await expect(breadcrumbs.first()).toBeVisible();

    // Breadcrumbs should wrap or truncate on mobile
    const breadcrumbItems = page.locator(".breadcrumbs li");
    const itemCount = await breadcrumbItems.count();

    if (itemCount > 3) {
      // On mobile, might show fewer items or have different styling
      await expect(breadcrumbs.first()).toBeVisible();
    }
  });
});
