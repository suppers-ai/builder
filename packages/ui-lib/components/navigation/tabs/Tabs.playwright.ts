import { expect, test } from "@playwright/test";

test.describe("Tabs Visual Tests", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:8001/components/navigation/tabs");
    await page.waitForLoadState("networkidle");
  });

  test("tabs variants visual regression", async ({ page }) => {
    const basicSection = page.locator(".card").first();
    await expect(basicSection).toHaveScreenshot("tabs-basic-variants.png");
  });

  test("tabs styles visual regression", async ({ page }) => {
    // Test bordered, lifted, boxed styles
    const stylesSection = page.locator(".card").nth(1);
    await expect(stylesSection).toHaveScreenshot("tabs-styles.png");
  });

  test("tabs sizes visual regression", async ({ page }) => {
    const sizesSection = page.locator(".card").nth(2);
    await expect(sizesSection).toHaveScreenshot("tabs-sizes.png");
  });

  test("tab content visual regression", async ({ page }) => {
    const contentSection = page.locator(".card").nth(3);
    await expect(contentSection).toHaveScreenshot("tabs-content.png");
  });

  test("tab interaction states", async ({ page }) => {
    const tab = page.locator(".tab").first();

    // Normal state
    await expect(tab).toHaveScreenshot("tab-normal.png");

    // Hover state
    await tab.hover();
    await expect(tab).toHaveScreenshot("tab-hover.png");

    // Active state (if not already active)
    const isActive = await tab.evaluate((el) => el.classList.contains("tab-active"));
    if (!isActive) {
      await tab.click();
      await expect(tab).toHaveScreenshot("tab-active.png");
    }
  });

  test("tabs with different content lengths", async ({ page }) => {
    // Create tabs with varying content lengths for visual testing
    await page.evaluate(() => {
      const container = document.createElement("div");
      container.className = "p-4";
      container.innerHTML = `
        <div class="tabs tabs-boxed">
          <a class="tab tab-active">Short</a>
          <a class="tab">Medium Length Tab</a>
          <a class="tab">Very Long Tab Title That Might Wrap</a>
          <a class="tab">X</a>
        </div>
      `;
      document.body.appendChild(container);
    });

    const container = page.locator("div").last();
    await expect(container).toHaveScreenshot("tabs-varying-lengths.png");
  });

  test("tabs in different themes", async ({ page }) => {
    const themes = ["light", "dark", "cupcake", "cyberpunk"];

    for (const theme of themes) {
      await page.evaluate((theme) => {
        document.documentElement.setAttribute("data-theme", theme);
      }, theme);

      await page.waitForTimeout(100);

      const tabsSection = page.locator(".card").first();
      await expect(tabsSection).toHaveScreenshot(`tabs-theme-${theme}.png`);
    }
  });

  test("tabs responsive design", async ({ page }) => {
    const viewports = [
      { width: 375, height: 667, name: "mobile" },
      { width: 768, height: 1024, name: "tablet" },
      { width: 1920, height: 1080, name: "desktop" },
    ];

    for (const viewport of viewports) {
      await page.setViewportSize(viewport);

      const tabsSection = page.locator(".card").first();
      await expect(tabsSection).toHaveScreenshot(`tabs-${viewport.name}.png`);
    }
  });

  test("disabled tabs visual state", async ({ page }) => {
    // Create tabs with disabled state for visual testing
    await page.evaluate(() => {
      const container = document.createElement("div");
      container.className = "p-4";
      container.innerHTML = `
        <div class="tabs">
          <a class="tab tab-active">Active Tab</a>
          <a class="tab">Normal Tab</a>
          <a class="tab tab-disabled">Disabled Tab</a>
        </div>
      `;
      document.body.appendChild(container);
    });

    const container = page.locator("div").last();
    await expect(container).toHaveScreenshot("tabs-disabled.png");
  });
});
