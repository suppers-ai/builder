import { expect, test } from "@playwright/test";

test.describe("Menu Visual Tests", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:8001/components/navigation/menu");
    await page.waitForLoadState("networkidle");
  });

  test("menu basic variants visual regression", async ({ page }) => {
    const basicSection = page.locator(".card").first();
    await expect(basicSection).toHaveScreenshot("menu-basic-variants.png");
  });

  test("menu with icons visual regression", async ({ page }) => {
    const iconsSection = page.locator(".card").nth(1);
    await expect(iconsSection).toHaveScreenshot("menu-with-icons.png");
  });

  test("menu responsive visual regression", async ({ page }) => {
    const responsiveSection = page.locator(".card").nth(2);
    await expect(responsiveSection).toHaveScreenshot("menu-responsive.png");
  });

  // Theme testing
  test("menus in different themes", async ({ page }) => {
    const themes = ["light", "dark", "cupcake", "cyberpunk", "synthwave"];

    for (const theme of themes) {
      await page.evaluate((theme) => {
        document.documentElement.setAttribute("data-theme", theme);
      }, theme);

      await page.waitForTimeout(100);

      const menuSection = page.locator(".card").first();
      await expect(menuSection).toHaveScreenshot(`menu-theme-${theme}.png`);
    }
  });

  // Responsive testing
  test("menus responsive design", async ({ page }) => {
    const viewports = [
      { width: 375, height: 667, name: "mobile" },
      { width: 768, height: 1024, name: "tablet" },
      { width: 1920, height: 1080, name: "desktop" },
    ];

    for (const viewport of viewports) {
      await page.setViewportSize(viewport);

      const menuSection = page.locator(".card").first();
      await expect(menuSection).toHaveScreenshot(`menu-${viewport.name}.png`);
    }
  });

  test("menu configurations", async ({ page }) => {
    await page.evaluate(() => {
      const container = document.createElement("div");
      container.className = "p-4 space-y-8";
      container.innerHTML = `
        <ul class="menu bg-base-200 w-56 rounded-box">
          <li><a>Item 1</a></li>
          <li><a>Item 2</a></li>
          <li><a>Item 3</a></li>
        </ul>
        <ul class="menu menu-horizontal bg-base-200 rounded-box">
          <li><a>Item 1</a></li>
          <li><a>Item 2</a></li>
          <li><a>Item 3</a></li>
        </ul>
        <ul class="menu bg-base-200 w-56 rounded-box">
          <li><a>📧 Inbox</a></li>
          <li><a>📝 Drafts</a></li>
          <li><a>📤 Sent</a></li>
          <li><a>🗑️ Trash</a></li>
        </ul>
      `;
      document.body.appendChild(container);
    });

    const container = page.locator("div").last();
    await expect(container).toHaveScreenshot("menu-configurations.png");
  });
});
