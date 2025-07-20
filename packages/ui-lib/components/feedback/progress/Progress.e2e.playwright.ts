import { expect, test } from "npm:@playwright/test";

test.describe("Progress E2E Tests", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:8000/components/feedback/progress");
  });

  test("progress display navigation and visibility", async ({ page }) => {
    // Test page navigation
    await page.click('text="Components"');
    await expect(page).toHaveURL(/components$/);

    // Navigate back to progress
    await page.goto("http://localhost:8000/components/feedback/progress");

    // Verify page loads correctly
    await expect(page.locator(".progress")).toBeVisible();
    await expect(page.locator("h1")).toContainText("Progress");
  });

  test("progress display values are correctly rendered", async ({ page }) => {
    // Test different progress values
    const progressBars = page.locator(".progress");
    const count = await progressBars.count();

    for (let i = 0; i < Math.min(5, count); i++) {
      const progressBar = progressBars.nth(i);
      await expect(progressBar).toBeVisible();

      // Check if progress value is correctly applied
      const value = await progressBar.getAttribute("value");
      const max = await progressBar.getAttribute("max");

      if (value && max) {
        const progressValue = parseInt(value);
        const maxValue = parseInt(max);
        expect(progressValue).toBeLessThanOrEqual(maxValue);
        expect(progressValue).toBeGreaterThanOrEqual(0);
      }
    }
  });

  test("progress display color variants", async ({ page }) => {
    // Test progress color variants
    const colorClasses = [
      ".progress-primary",
      ".progress-secondary",
      ".progress-accent",
      ".progress-success",
      ".progress-warning",
      ".progress-error",
    ];

    for (const colorClass of colorClasses) {
      const progressBar = page.locator(colorClass);
      if (await progressBar.count() > 0) {
        await expect(progressBar.first()).toBeVisible();

        // Verify color class is applied
        const hasColorClass = await progressBar.first().evaluate((el, className) => {
          return el.classList.contains(className.replace(".progress-", "progress-"));
        }, colorClass);
        expect(hasColorClass).toBeTruthy();
      }
    }
  });

  test("progress display accessibility", async ({ page }) => {
    // Test progress bars have proper accessibility attributes
    const progressBar = page.locator(".progress").first();
    await expect(progressBar).toBeVisible();

    // Check for accessibility attributes
    const hasAriaAttributes = await progressBar.evaluate((el) => {
      return el.hasAttribute("role") ||
        el.hasAttribute("aria-valuenow") ||
        el.hasAttribute("aria-valuemin") ||
        el.hasAttribute("aria-valuemax") ||
        el.hasAttribute("aria-label");
    });

    expect(hasAriaAttributes).toBeTruthy();
  });

  test("progress display interactive updates", async ({ page }) => {
    // Test interactive progress updates if available
    const updateButton = page.locator("[data-progress-update]");
    if (await updateButton.count() > 0) {
      const progressBar = page.locator(".progress").first();
      const initialValue = await progressBar.getAttribute("value");

      // Click update button
      await updateButton.click();
      await page.waitForTimeout(100);

      // Check if value changed
      const newValue = await progressBar.getAttribute("value");
      expect(newValue).not.toBe(initialValue);
    }
  });

  test("progress display responsive behavior", async ({ page }) => {
    // Test responsive behavior
    const viewports = [
      { width: 375, height: 667 },
      { width: 768, height: 1024 },
      { width: 1920, height: 1080 },
    ];

    for (const viewport of viewports) {
      await page.setViewportSize(viewport);

      const progressBar = page.locator(".progress").first();
      await expect(progressBar).toBeVisible();

      // Ensure progress bar scales properly
      const boundingBox = await progressBar.boundingBox();
      expect(boundingBox?.width).toBeLessThanOrEqual(viewport.width);
      expect(boundingBox?.width).toBeGreaterThan(0);
    }
  });

  test("progress display theme compatibility", async ({ page }) => {
    // Test theme switching
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

        // Progress bars should still be visible and styled correctly
        const progressBar = page.locator(".progress").first();
        await expect(progressBar).toBeVisible();
      }
    }
  });

  test("progress display with labels", async ({ page }) => {
    // Test progress bars with percentage labels
    const progressWithLabel = page.locator(".progress").filter({ hasText: "%" });
    if (await progressWithLabel.count() > 0) {
      await expect(progressWithLabel.first()).toBeVisible();

      // Verify label text is reasonable
      const labelText = await progressWithLabel.first().textContent();
      expect(labelText).toMatch(/%|percent|complete/i);
    }
  });

  test("progress display animation", async ({ page }) => {
    // Test animated progress bars
    const animatedProgress = page.locator(".progress[data-animated]");
    if (await animatedProgress.count() > 0) {
      await expect(animatedProgress.first()).toBeVisible();

      // Monitor for value changes over time
      const initialValue = await animatedProgress.first().getAttribute("value");
      await page.waitForTimeout(1000);
      const laterValue = await animatedProgress.first().getAttribute("value");

      // Value might change during animation
      expect(initialValue || laterValue).toBeTruthy();
    }
  });

  test("progress display keyboard navigation", async ({ page }) => {
    // Test keyboard navigation if progress is focusable
    const progressBar = page.locator(".progress").first();
    await expect(progressBar).toBeVisible();

    // Try to focus the progress bar
    await progressBar.focus();

    // Check if it's focusable
    const isFocused = await progressBar.evaluate((el) => {
      return document.activeElement === el;
    });

    // Some progress bars might not be focusable, which is okay
    if (isFocused) {
      // Test keyboard interactions if applicable
      await page.keyboard.press("ArrowRight");
      await page.waitForTimeout(100);
    }
  });

  test("progress display performance", async ({ page }) => {
    // Test performance with multiple progress bars
    const startTime = Date.now();

    await page.goto("http://localhost:8000/components/feedback/progress");
    const progressBars = page.locator(".progress");
    await expect(progressBars.first()).toBeVisible();

    const loadTime = Date.now() - startTime;
    expect(loadTime).toBeLessThan(5000);

    // Test multiple progress bars render efficiently
    const count = await progressBars.count();
    expect(count).toBeGreaterThan(0);

    for (let i = 0; i < Math.min(10, count); i++) {
      await expect(progressBars.nth(i)).toBeVisible();
    }
  });
});
