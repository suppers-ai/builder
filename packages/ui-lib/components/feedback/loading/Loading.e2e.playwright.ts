import { expect, test } from "npm:@playwright/test";

test.describe("Loading E2E Tests", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:8000/components/feedback/loading");
  });

  test("loading display navigation and visibility", async ({ page }) => {
    // Test page navigation
    await page.click('text="Components"');
    await expect(page).toHaveURL(/components$/);

    // Navigate back to loading
    await page.goto("http://localhost:8000/components/feedback/loading");

    // Verify page loads correctly
    await expect(page.locator(".loading")).toBeVisible();
    await expect(page.locator("h1")).toContainText("Loading");
  });

  test("loading display animations are working", async ({ page }) => {
    // Test that loading animations are active
    const loading = page.locator(".loading").first();
    await expect(loading).toBeVisible();

    // Verify loading animation is active by checking computed styles
    const hasAnimation = await loading.evaluate((el) => {
      const style = window.getComputedStyle(el);
      return style.animationName !== "none" || style.transform !== "none";
    });

    expect(hasAnimation).toBeTruthy();
  });

  test("loading display different types render correctly", async ({ page }) => {
    // Test different loading types exist and are visible
    const loadingTypes = [
      ".loading-spinner",
      ".loading-dots",
      ".loading-ring",
      ".loading-ball",
      ".loading-bars",
      ".loading-infinity",
    ];

    for (const type of loadingTypes) {
      const element = page.locator(type);
      if (await element.count() > 0) {
        await expect(element.first()).toBeVisible();
      }
    }
  });

  test("loading display sizes are applied correctly", async ({ page }) => {
    // Test loading size variants
    const sizes = [
      ".loading-xs",
      ".loading-sm",
      ".loading-md",
      ".loading-lg",
    ];

    for (const size of sizes) {
      const element = page.locator(size);
      if (await element.count() > 0) {
        await expect(element.first()).toBeVisible();

        // Verify size classes are applied
        const hasClass = await element.first().evaluate((el, className) => {
          return el.classList.contains(className.replace(".", ""));
        }, size);
        expect(hasClass).toBeTruthy();
      }
    }
  });

  test("loading display accessibility", async ({ page }) => {
    // Test loading components have proper accessibility attributes
    const loading = page.locator(".loading").first();
    await expect(loading).toBeVisible();

    // Check for accessibility attributes
    const hasAriaLabel = await loading.evaluate((el) => {
      return el.hasAttribute("aria-label") ||
        el.hasAttribute("aria-labelledby") ||
        el.hasAttribute("role");
    });

    // Loading should have some accessibility indication
    expect(hasAriaLabel || await loading.textContent()).toBeTruthy();
  });

  test("loading display responsive behavior", async ({ page }) => {
    // Test responsive behavior
    const viewports = [
      { width: 375, height: 667 },
      { width: 768, height: 1024 },
      { width: 1920, height: 1080 },
    ];

    for (const viewport of viewports) {
      await page.setViewportSize(viewport);

      const loading = page.locator(".loading").first();
      await expect(loading).toBeVisible();

      // Ensure loading indicator doesn't cause overflow
      const boundingBox = await loading.boundingBox();
      expect(boundingBox?.width).toBeLessThanOrEqual(viewport.width);
    }
  });

  test("loading display theme switching", async ({ page }) => {
    // Test theme switching with loading components
    const themeController = page.locator("[data-theme-controller]");
    if (await themeController.count() > 0) {
      await themeController.click();

      const darkTheme = page.locator("[data-theme='dark']");
      if (await darkTheme.count() > 0) {
        await darkTheme.click();
        await page.waitForTimeout(200);

        // Verify theme applied
        const html = page.locator("html");
        await expect(html).toHaveAttribute("data-theme", "dark");

        // Loading should still be visible
        const loading = page.locator(".loading").first();
        await expect(loading).toBeVisible();
      }
    }
  });

  test("loading display with text content", async ({ page }) => {
    // Test loading indicators with text
    const loadingWithText = page.locator(".loading").filter({ hasText: "Loading" });
    if (await loadingWithText.count() > 0) {
      await expect(loadingWithText.first()).toBeVisible();
      await expect(loadingWithText.first()).toContainText("Loading");
    }
  });

  test("loading display performance", async ({ page }) => {
    // Test that loading components don't impact performance significantly
    const startTime = Date.now();

    await page.goto("http://localhost:8000/components/feedback/loading");
    const loading = page.locator(".loading").first();
    await expect(loading).toBeVisible();

    const loadTime = Date.now() - startTime;
    expect(loadTime).toBeLessThan(5000); // Should load within 5 seconds

    // Verify multiple loading indicators don't cause issues
    const allLoading = page.locator(".loading");
    const count = await allLoading.count();
    expect(count).toBeGreaterThan(0);

    // All should be visible
    for (let i = 0; i < Math.min(5, count); i++) {
      await expect(allLoading.nth(i)).toBeVisible();
    }
  });

  test("loading display state management", async ({ page }) => {
    // Test loading states in interactive scenarios
    const interactiveLoading = page.locator("[data-loading-trigger]");
    if (await interactiveLoading.count() > 0) {
      // Trigger loading state
      await interactiveLoading.click();

      // Verify loading appears
      const loading = page.locator(".loading");
      await expect(loading.first()).toBeVisible();

      // Wait for loading to complete if it's timed
      await page.waitForTimeout(2000);
    }
  });
});
