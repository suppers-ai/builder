import { expect, test } from "npm:@playwright/test";

test.describe("Tooltip E2E Tests", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:8000/components/feedback/tooltip");
  });

  test("tooltip display navigation and visibility", async ({ page }) => {
    await page.click('text="Components"');
    await expect(page).toHaveURL(/components$/);

    await page.goto("http://localhost:8000/components/feedback/tooltip");
    await expect(page.locator(".tooltip")).toBeVisible();
    await expect(page.locator("h1")).toContainText("Tooltip");
  });

  test("tooltip display hover interaction", async ({ page }) => {
    const tooltip = page.locator(".tooltip").first();
    await expect(tooltip).toBeVisible();

    // Hover to show tooltip
    await tooltip.hover();
    await page.waitForTimeout(300);

    // Move away to hide
    await page.mouse.move(0, 0);
    await page.waitForTimeout(300);
  });

  test("tooltip display keyboard navigation", async ({ page }) => {
    const tooltip = page.locator(".tooltip").first();
    await tooltip.focus();

    // Tab navigation
    await page.keyboard.press("Tab");
    await page.waitForTimeout(100);
  });

  test("tooltip display positions", async ({ page }) => {
    const positions = ["tooltip-top", "tooltip-bottom", "tooltip-left", "tooltip-right"];

    for (const position of positions) {
      const tooltip = page.locator(`.${position}`);
      if (await tooltip.count() > 0) {
        await tooltip.first().hover();
        await page.waitForTimeout(200);
        await page.mouse.move(0, 0);
        await page.waitForTimeout(100);
      }
    }
  });

  test("tooltip display accessibility", async ({ page }) => {
    const tooltip = page.locator(".tooltip").first();
    await expect(tooltip).toBeVisible();

    const hasAriaAttributes = await tooltip.evaluate((el) => {
      return el.hasAttribute("data-tip") ||
        el.hasAttribute("title") ||
        el.hasAttribute("aria-label");
    });

    expect(hasAriaAttributes).toBeTruthy();
  });

  test("tooltip display responsive behavior", async ({ page }) => {
    const viewports = [
      { width: 375, height: 667 },
      { width: 768, height: 1024 },
      { width: 1920, height: 1080 },
    ];

    for (const viewport of viewports) {
      await page.setViewportSize(viewport);
      const tooltip = page.locator(".tooltip").first();
      await expect(tooltip).toBeVisible();

      await tooltip.hover();
      await page.waitForTimeout(200);
      await page.mouse.move(0, 0);
      await page.waitForTimeout(100);
    }
  });
});
