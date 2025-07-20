import { expect, test } from "npm:@playwright/test";

test.describe("Tooltip Visual Tests", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:8000/components/feedback/tooltip");
  });

  test("tooltip display variants", async ({ page }) => {
    const section = page.locator(".examples-section").first();
    await expect(section).toHaveScreenshot("tooltip-variants.png");
  });

  test("tooltip display positions", async ({ page }) => {
    // Test tooltip in different positions
    const positions = [
      "tooltip-top",
      "tooltip-bottom",
      "tooltip-left",
      "tooltip-right",
    ];

    for (const position of positions) {
      const tooltip = page.locator(`.${position}`);
      if (await tooltip.count() > 0) {
        // Hover to show tooltip
        await tooltip.first().hover();
        await page.waitForTimeout(200);
        await expect(tooltip.first()).toHaveScreenshot(
          `tooltip-${position.replace("tooltip-", "")}.png`,
        );
      }
    }
  });

  test("tooltip display colors", async ({ page }) => {
    const colors = [
      "tooltip-primary",
      "tooltip-secondary",
      "tooltip-accent",
      "tooltip-success",
      "tooltip-warning",
      "tooltip-error",
    ];

    for (const color of colors) {
      const tooltip = page.locator(`.${color}`);
      if (await tooltip.count() > 0) {
        await tooltip.first().hover();
        await page.waitForTimeout(200);
        await expect(tooltip.first()).toHaveScreenshot(
          `tooltip-${color.replace("tooltip-", "")}.png`,
        );

        // Move away to hide tooltip
        await page.mouse.move(0, 0);
        await page.waitForTimeout(100);
      }
    }
  });

  test("tooltip display themes", async ({ page }) => {
    const themes = ["light", "dark", "cupcake", "cyberpunk", "synthwave"];

    for (const theme of themes) {
      await page.evaluate((theme) => {
        document.documentElement.setAttribute("data-theme", theme);
      }, theme);

      await page.waitForTimeout(100);
      const tooltip = page.locator(".tooltip").first();
      if (await tooltip.count() > 0) {
        await tooltip.hover();
        await page.waitForTimeout(200);
        await expect(tooltip).toHaveScreenshot(`tooltip-theme-${theme}.png`);

        // Move away
        await page.mouse.move(0, 0);
        await page.waitForTimeout(100);
      }
    }
  });

  test("tooltip display responsive design", async ({ page }) => {
    const viewports = [
      { width: 375, height: 667, name: "mobile" },
      { width: 768, height: 1024, name: "tablet" },
      { width: 1920, height: 1080, name: "desktop" },
    ];

    for (const viewport of viewports) {
      await page.setViewportSize(viewport);
      const tooltip = page.locator(".tooltip").first();
      if (await tooltip.count() > 0) {
        await tooltip.hover();
        await page.waitForTimeout(200);
        await expect(tooltip).toHaveScreenshot(`tooltip-${viewport.name}.png`);

        await page.mouse.move(0, 0);
        await page.waitForTimeout(100);
      }
    }
  });

  test("tooltip display with long text", async ({ page }) => {
    const longTooltip = page.locator(".tooltip").filter({
      hasText: "This is a very long tooltip text",
    });
    if (await longTooltip.count() > 0) {
      await longTooltip.first().hover();
      await page.waitForTimeout(200);
      await expect(longTooltip.first()).toHaveScreenshot("tooltip-long-text.png");
    }
  });

  test("tooltip display always open", async ({ page }) => {
    const openTooltip = page.locator(".tooltip-open");
    if (await openTooltip.count() > 0) {
      await expect(openTooltip.first()).toHaveScreenshot("tooltip-always-open.png");
    }
  });

  test("tooltip display hover states", async ({ page }) => {
    const tooltip = page.locator(".tooltip").first();
    if (await tooltip.count() > 0) {
      // Before hover
      await expect(tooltip).toHaveScreenshot("tooltip-before-hover.png");

      // During hover
      await tooltip.hover();
      await page.waitForTimeout(300); // Wait for tooltip to appear
      await expect(tooltip).toHaveScreenshot("tooltip-during-hover.png");

      // After hover
      await page.mouse.move(0, 0);
      await page.waitForTimeout(300); // Wait for tooltip to disappear
      await expect(tooltip).toHaveScreenshot("tooltip-after-hover.png");
    }
  });

  test("tooltip display with buttons", async ({ page }) => {
    const buttonTooltip = page.locator(".btn.tooltip");
    if (await buttonTooltip.count() > 0) {
      await buttonTooltip.first().hover();
      await page.waitForTimeout(200);
      await expect(buttonTooltip.first()).toHaveScreenshot("tooltip-on-button.png");
    }
  });
});
