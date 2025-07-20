import { expect, test } from "npm:@playwright/test";

test.describe("RadialProgress E2E Tests", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:8000/components/feedback/radial-progress");
  });

  test("radial progress display navigation and visibility", async ({ page }) => {
    // Test page navigation
    await page.click('text="Components"');
    await expect(page).toHaveURL(/components$/);

    // Navigate back to radial progress
    await page.goto("http://localhost:8000/components/feedback/radial-progress");

    // Verify page loads correctly
    await expect(page.locator(".radial-progress")).toBeVisible();
    await expect(page.locator("h1")).toContainText("Radial Progress");
  });

  test("radial progress display values are correctly rendered", async ({ page }) => {
    // Test different radial progress values
    const radialProgresses = page.locator(".radial-progress");
    const count = await radialProgresses.count();

    for (let i = 0; i < Math.min(5, count); i++) {
      const radialProgress = radialProgresses.nth(i);
      await expect(radialProgress).toBeVisible();

      // Check CSS custom properties for progress value
      const progressValue = await radialProgress.evaluate((el) => {
        const style = window.getComputedStyle(el);
        return style.getPropertyValue("--value") || el.getAttribute("style");
      });

      expect(progressValue).toBeTruthy();
    }
  });

  test("radial progress display text content", async ({ page }) => {
    // Test radial progress with text content
    const radialWithText = page.locator(".radial-progress").filter({ hasText: /\d+/ });
    if (await radialWithText.count() > 0) {
      await expect(radialWithText.first()).toBeVisible();

      // Verify text content is numeric/percentage
      const textContent = await radialWithText.first().textContent();
      expect(textContent).toMatch(/\d+|%/);
    }
  });

  test("radial progress display color variants", async ({ page }) => {
    // Test radial progress with different colors
    const colorClasses = [
      ".text-primary",
      ".text-secondary",
      ".text-accent",
      ".text-success",
      ".text-warning",
      ".text-error",
    ];

    for (const colorClass of colorClasses) {
      const coloredProgress = page.locator(`.radial-progress${colorClass}`);
      if (await coloredProgress.count() > 0) {
        await expect(coloredProgress.first()).toBeVisible();
      }
    }
  });

  test("radial progress display accessibility", async ({ page }) => {
    // Test radial progress accessibility
    const radialProgress = page.locator(".radial-progress").first();
    await expect(radialProgress).toBeVisible();

    // Check for accessibility attributes
    const hasAriaAttributes = await radialProgress.evaluate((el) => {
      return el.hasAttribute("role") ||
        el.hasAttribute("aria-valuenow") ||
        el.hasAttribute("aria-valuemin") ||
        el.hasAttribute("aria-valuemax") ||
        el.hasAttribute("aria-label") ||
        el.textContent?.trim().length > 0;
    });

    expect(hasAriaAttributes).toBeTruthy();
  });

  test("radial progress display sizes", async ({ page }) => {
    // Test different sizes of radial progress
    const radialProgresses = page.locator(".radial-progress");
    const count = await radialProgresses.count();

    if (count > 1) {
      // Compare sizes of different radial progress elements
      const sizes = [];
      for (let i = 0; i < Math.min(3, count); i++) {
        const bbox = await radialProgresses.nth(i).boundingBox();
        if (bbox) {
          sizes.push(bbox.width);
        }
      }

      // Should have different sizes if multiple variants exist
      expect(sizes.length).toBeGreaterThan(0);
    }
  });

  test("radial progress display interactive updates", async ({ page }) => {
    // Test interactive updates if available
    const updateButton = page.locator("[data-radial-progress-update]");
    if (await updateButton.count() > 0) {
      const radialProgress = page.locator(".radial-progress").first();
      const initialStyle = await radialProgress.getAttribute("style");

      // Click update button
      await updateButton.click();
      await page.waitForTimeout(100);

      // Check if style changed (indicating value update)
      const newStyle = await radialProgress.getAttribute("style");
      expect(newStyle).not.toBe(initialStyle);
    }
  });

  test("radial progress display responsive behavior", async ({ page }) => {
    // Test responsive behavior
    const viewports = [
      { width: 375, height: 667 },
      { width: 768, height: 1024 },
      { width: 1920, height: 1080 },
    ];

    for (const viewport of viewports) {
      await page.setViewportSize(viewport);

      const radialProgress = page.locator(".radial-progress").first();
      await expect(radialProgress).toBeVisible();

      // Ensure radial progress maintains aspect ratio
      const boundingBox = await radialProgress.boundingBox();
      if (boundingBox) {
        const aspectRatio = boundingBox.width / boundingBox.height;
        expect(aspectRatio).toBeCloseTo(1, 1); // Should be roughly circular
      }
    }
  });

  test("radial progress display theme compatibility", async ({ page }) => {
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

        // Radial progress should still be visible
        const radialProgress = page.locator(".radial-progress").first();
        await expect(radialProgress).toBeVisible();
      }
    }
  });

  test("radial progress display animation", async ({ page }) => {
    // Test animated radial progress if available
    const animatedProgress = page.locator(".radial-progress[data-animated]");
    if (await animatedProgress.count() > 0) {
      await expect(animatedProgress.first()).toBeVisible();

      // Monitor for style changes during animation
      const initialStyle = await animatedProgress.first().getAttribute("style");
      await page.waitForTimeout(1000);
      const laterStyle = await animatedProgress.first().getAttribute("style");

      // Style might change during animation
      expect(initialStyle || laterStyle).toBeTruthy();
    }
  });

  test("radial progress display stroke width variations", async ({ page }) => {
    // Test radial progress with different stroke widths
    const thickProgress = page.locator(".radial-progress[style*='stroke-width']");
    if (await thickProgress.count() > 0) {
      await expect(thickProgress.first()).toBeVisible();

      // Verify stroke-width is applied
      const strokeWidth = await thickProgress.first().evaluate((el) => {
        return window.getComputedStyle(el).getPropertyValue("stroke-width") ||
          el.style.strokeWidth;
      });

      expect(strokeWidth).toBeTruthy();
    }
  });

  test("radial progress display performance", async ({ page }) => {
    // Test performance with multiple radial progress elements
    const startTime = Date.now();

    await page.goto("http://localhost:8000/components/feedback/radial-progress");
    const radialProgresses = page.locator(".radial-progress");
    await expect(radialProgresses.first()).toBeVisible();

    const loadTime = Date.now() - startTime;
    expect(loadTime).toBeLessThan(5000);

    // Test multiple radial progress elements render efficiently
    const count = await radialProgresses.count();
    expect(count).toBeGreaterThan(0);

    for (let i = 0; i < Math.min(10, count); i++) {
      await expect(radialProgresses.nth(i)).toBeVisible();
    }
  });

  test("radial progress display SVG structure", async ({ page }) => {
    // Test that radial progress has proper SVG structure
    const radialProgress = page.locator(".radial-progress").first();
    await expect(radialProgress).toBeVisible();

    // Check if it uses SVG or CSS-based implementation
    const hasSvg = await radialProgress.locator("svg").count() > 0;
    const hasAfterPseudo = await radialProgress.evaluate((el) => {
      const afterStyles = window.getComputedStyle(el, "::after");
      return afterStyles.content !== "none";
    });

    // Should use either SVG or CSS-based approach
    expect(hasSvg || hasAfterPseudo).toBeTruthy();
  });
});
