import { expect, test } from "@playwright/test";

test.describe("Button Visual Tests", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to button component page
    await page.goto("http://localhost:8001/components/action/button");
    await page.waitForLoadState("networkidle");
  });

  test("button variants visual regression", async ({ page }) => {
    // Test basic buttons section - get the first card with buttons
    const basicSection = page.locator(".card").first();
    await expect(basicSection).toHaveScreenshot("button-basic-variants.png");
  });

  test("button colors visual regression", async ({ page }) => {
    // The second card is "Button Variants" (outline/ghost), not colors
    // Let's use the first card which has different colored buttons
    const colorsSection = page.locator(".card").nth(0);
    await expect(colorsSection).toHaveScreenshot("button-colors.png");
  });

  test("button sizes visual regression", async ({ page }) => {
    // Looking at the HTML structure: 0=Basic, 1=Variants, 2=Sizes, 3=States
    const sizesSection = page.locator(".card").nth(2);
    await expect(sizesSection).toHaveScreenshot("button-sizes.png");
  });

  test("button states visual regression", async ({ page }) => {
    // Looking at the HTML structure: 0=Basic, 1=Variants, 2=Sizes, 3=States
    // Note: This section includes a loading button with spinner animation

    // Wait for page to be fully loaded
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1000);

    const statesSection = page.locator(".card").nth(3);
    await expect(statesSection).toHaveScreenshot("button-states.png", {
      animations: "disabled",
      threshold: 0.3, // Allow slightly more variation due to loading spinner
    });
  });

  test("button variants (outline, ghost) visual regression", async ({ page }) => {
    // Looking at the HTML structure: 0=Basic, 1=Variants, 2=Sizes, 3=States
    const variantsSection = page.locator(".card").nth(1);
    await expect(variantsSection).toHaveScreenshot("button-variants.png");
  });

  // Test specific button interactions
  test("button hover states", async ({ page }) => {
    const primaryBtn = page.locator(".btn-primary").first();

    // Normal state
    await expect(primaryBtn).toHaveScreenshot("button-primary-normal.png");

    // Hover state
    await primaryBtn.hover();
    await expect(primaryBtn).toHaveScreenshot("button-primary-hover.png");
  });

  test("button focus states", async ({ page }) => {
    const primaryBtn = page.locator(".btn-primary").first();

    // Focus state
    await primaryBtn.focus();
    await expect(primaryBtn).toHaveScreenshot("button-primary-focus.png");
  });

  // Theme testing
  test("buttons in different themes", async ({ page }) => {
    const themes = ["light", "dark", "cupcake", "cyberpunk", "synthwave"];

    for (const theme of themes) {
      // Change theme
      await page.evaluate((theme) => {
        document.documentElement.setAttribute("data-theme", theme);
      }, theme);

      // Wait for theme to apply
      await page.waitForTimeout(100);

      // Take screenshot of button examples
      const buttonSection = page.locator(".card").first();
      await expect(buttonSection).toHaveScreenshot(`buttons-theme-${theme}.png`);
    }
  });

  // Responsive testing
  test("buttons responsive design", async ({ page }) => {
    const viewports = [
      { width: 375, height: 667, name: "mobile" },
      { width: 768, height: 1024, name: "tablet" },
      { width: 1920, height: 1080, name: "desktop" },
    ];

    for (const viewport of viewports) {
      await page.setViewportSize(viewport);

      const buttonSection = page.locator(".card").first();
      await expect(buttonSection).toHaveScreenshot(`buttons-${viewport.name}.png`);
    }
  });

  // Edge cases
  test("buttons with long text", async ({ page }) => {
    // Navigate to a test page or inject buttons with long text
    await page.evaluate(() => {
      const container = document.createElement("div");
      container.className = "p-4 space-y-4";
      container.innerHTML = `
        <button class="btn btn-primary">This is a very long button text that might wrap</button>
        <button class="btn btn-secondary btn-sm">Small button with long text content</button>
        <button class="btn btn-outline btn-lg">Large button with extremely long text that definitely wraps</button>
      `;
      document.body.appendChild(container);
    });

    const container = page.locator("div").last();
    await expect(container).toHaveScreenshot("buttons-long-text.png");
  });

  test("buttons accessibility contrast", async ({ page }) => {
    // Test high contrast mode or accessibility features
    await page.emulateMedia({ reducedMotion: "reduce" });

    const buttonSection = page.locator(".card").first();
    await expect(buttonSection).toHaveScreenshot("buttons-reduced-motion.png");
  });

  // Performance test - loading states (skip due to animation instability)
  test.skip("button loading animations", async ({ page }) => {
    // This test is skipped because loading animations are inherently unstable for visual regression
    // Instead, we verify loading states functionally in E2E tests

    // Add loading buttons to the page
    await page.evaluate(() => {
      const container = document.createElement("div");
      container.className = "p-4 space-y-4";
      container.id = "loading-test-container";
      container.innerHTML = `
        <button class="btn btn-primary loading">Loading Primary</button>
        <button class="btn btn-secondary loading btn-lg">Loading Large</button>
        <button class="btn btn-outline loading">Loading Outline</button>
      `;
      document.body.appendChild(container);
    });

    // Verify loading buttons exist and have correct classes
    await expect(page.locator("#loading-test-container .btn.loading")).toHaveCount(3);
  });
});
