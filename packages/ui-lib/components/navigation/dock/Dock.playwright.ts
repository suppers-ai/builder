import { expect, test } from "@playwright/test";

test.describe("Dock Visual Tests", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:8001/components/dock");
    await page.waitForLoadState("networkidle");
  });

  test("dock basic variants visual regression", async ({ page }) => {
    const basicSection = page.locator(".card").first();
    await expect(basicSection).toHaveScreenshot("dock-basic-variants.png");
  });

  test("dock with icons visual regression", async ({ page }) => {
    const iconsSection = page.locator(".card").nth(1);
    await expect(iconsSection).toHaveScreenshot("dock-with-icons.png");
  });

  test("dock positioning visual regression", async ({ page }) => {
    const positionsSection = page.locator(".card").nth(2);
    await expect(positionsSection).toHaveScreenshot("dock-positioning.png");
  });

  test("dock hover effects", async ({ page }) => {
    const dockItems = page.locator(".dock .btn").first();

    // Normal state
    await expect(dockItems).toHaveScreenshot("dock-item-normal.png");

    // Hover state
    await dockItems.hover();
    await expect(dockItems).toHaveScreenshot("dock-item-hover.png");
  });

  // Theme testing
  test("docks in different themes", async ({ page }) => {
    const themes = ["light", "dark", "cupcake", "cyberpunk", "synthwave"];

    for (const theme of themes) {
      await page.evaluate((theme) => {
        document.documentElement.setAttribute("data-theme", theme);
      }, theme);

      await page.waitForTimeout(100);

      const dockSection = page.locator(".card").first();
      await expect(dockSection).toHaveScreenshot(`dock-theme-${theme}.png`);
    }
  });

  // Responsive testing
  test("docks responsive design", async ({ page }) => {
    const viewports = [
      { width: 375, height: 667, name: "mobile" },
      { width: 768, height: 1024, name: "tablet" },
      { width: 1920, height: 1080, name: "desktop" },
    ];

    for (const viewport of viewports) {
      await page.setViewportSize(viewport);

      const dockSection = page.locator(".card").first();
      await expect(dockSection).toHaveScreenshot(`dock-${viewport.name}.png`);
    }
  });

  test("dock configurations", async ({ page }) => {
    await page.evaluate(() => {
      const container = document.createElement("div");
      container.className = "p-4 space-y-8";
      container.innerHTML = `
        <div class="dock dock-vertical">
          <div class="dock-item"><button class="btn btn-ghost">🏠</button></div>
          <div class="dock-item"><button class="btn btn-ghost">📱</button></div>
          <div class="dock-item"><button class="btn btn-ghost">💻</button></div>
          <div class="dock-item"><button class="btn btn-ghost">⚙️</button></div>
        </div>
        <div class="dock dock-horizontal">
          <div class="dock-item"><button class="btn btn-ghost">🏠</button></div>
          <div class="dock-item"><button class="btn btn-ghost">📱</button></div>
          <div class="dock-item"><button class="btn btn-ghost">💻</button></div>
          <div class="dock-item"><button class="btn btn-ghost">⚙️</button></div>
        </div>
      `;
      document.body.appendChild(container);
    });

    const container = page.locator("div").last();
    await expect(container).toHaveScreenshot("dock-configurations.png");
  });
});
