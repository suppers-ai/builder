import { expect, test } from "@playwright/test";

test.describe("Toggle Visual Tests", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to toggle component page
    await page.goto("http://localhost:8001/components/input/toggle");
    await page.waitForLoadState("networkidle");
  });

  test("toggle variants visual regression", async ({ page }) => {
    // Test basic toggles section
    const basicSection = page.locator(".card").first();
    await expect(basicSection).toHaveScreenshot("toggle-basic-variants.png");
  });

  test("toggle colors visual regression", async ({ page }) => {
    // Test color variants
    const colorsSection = page.locator(".card").nth(1);
    await expect(colorsSection).toHaveScreenshot("toggle-colors.png");
  });

  test("toggle sizes visual regression", async ({ page }) => {
    // Test size variants
    const sizesSection = page.locator(".card").nth(2);
    await expect(sizesSection).toHaveScreenshot("toggle-sizes.png");
  });

  test("toggle states visual regression", async ({ page }) => {
    // Test different states (checked, unchecked, disabled)
    const statesSection = page.locator(".card").nth(3);
    await expect(statesSection).toHaveScreenshot("toggle-states.png");
  });

  test("toggle interaction states", async ({ page }) => {
    const toggle = page.locator(".toggle").first();

    // Normal state
    await expect(toggle).toHaveScreenshot("toggle-normal.png");

    // Hover state
    await toggle.hover();
    await expect(toggle).toHaveScreenshot("toggle-hover.png");

    // Focus state
    await toggle.focus();
    await expect(toggle).toHaveScreenshot("toggle-focus.png");
  });

  test("toggle with labels", async ({ page }) => {
    // Test toggles with label text
    const labeledToggles = page.locator(".form-control");
    await expect(labeledToggles.first()).toHaveScreenshot("toggle-with-label.png");
  });

  test("toggles in different themes", async ({ page }) => {
    const themes = ["light", "dark", "cupcake", "cyberpunk"];

    for (const theme of themes) {
      await page.evaluate((theme) => {
        document.documentElement.setAttribute("data-theme", theme);
      }, theme);

      await page.waitForTimeout(100);

      const toggleSection = page.locator(".card").first();
      await expect(toggleSection).toHaveScreenshot(`toggles-theme-${theme}.png`);
    }
  });

  test("toggles responsive design", async ({ page }) => {
    const viewports = [
      { width: 375, height: 667, name: "mobile" },
      { width: 768, height: 1024, name: "tablet" },
      { width: 1920, height: 1080, name: "desktop" },
    ];

    for (const viewport of viewports) {
      await page.setViewportSize(viewport);

      const toggleSection = page.locator(".card").first();
      await expect(toggleSection).toHaveScreenshot(`toggles-${viewport.name}.png`);
    }
  });
});
