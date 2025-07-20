import { expect, test } from "@playwright/test";

test.describe("Drawer Visual Tests", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:8001/components/layout/drawer");
    await page.waitForLoadState("networkidle");
  });

  test("drawer basic variants visual regression", async ({ page }) => {
    const basicSection = page.locator(".card").first();
    await expect(basicSection).toHaveScreenshot("drawer-basic-variants.png");
  });

  test("drawer with sidebar visual regression", async ({ page }) => {
    const sidebarSection = page.locator(".card").nth(1);
    await expect(sidebarSection).toHaveScreenshot("drawer-with-sidebar.png");
  });

  test("drawer responsive visual regression", async ({ page }) => {
    const responsiveSection = page.locator(".card").nth(2);
    await expect(responsiveSection).toHaveScreenshot("drawer-responsive.png");
  });

  test("drawer open state visual regression", async ({ page }) => {
    // Look for drawer toggle buttons
    const toggleButtons = page.locator(
      'label[for*="drawer"], button:has-text("Open"), .drawer-button',
    );
    const hasToggle = await toggleButtons.count() > 0;

    if (hasToggle) {
      // Click to open drawer
      await toggleButtons.first().click();
      await page.waitForTimeout(300); // Wait for animation

      const drawerSection = page.locator(".drawer").first();
      await expect(drawerSection).toHaveScreenshot("drawer-open-state.png");
    }
  });

  // Theme testing
  test("drawers in different themes", async ({ page }) => {
    const themes = ["light", "dark", "cupcake", "cyberpunk", "synthwave"];

    for (const theme of themes) {
      await page.evaluate((theme) => {
        document.documentElement.setAttribute("data-theme", theme);
      }, theme);

      await page.waitForTimeout(100);

      const drawerSection = page.locator(".card").first();
      await expect(drawerSection).toHaveScreenshot(`drawer-theme-${theme}.png`);
    }
  });

  // Responsive testing
  test("drawers responsive design", async ({ page }) => {
    const viewports = [
      { width: 375, height: 667, name: "mobile" },
      { width: 768, height: 1024, name: "tablet" },
      { width: 1920, height: 1080, name: "desktop" },
    ];

    for (const viewport of viewports) {
      await page.setViewportSize(viewport);

      const drawerSection = page.locator(".card").first();
      await expect(drawerSection).toHaveScreenshot(`drawer-${viewport.name}.png`);
    }
  });

  test("drawer with content visual regression", async ({ page }) => {
    await page.evaluate(() => {
      const container = document.createElement("div");
      container.className = "p-4";
      container.innerHTML = `
        <div class="drawer lg:drawer-open">
          <input id="test-drawer" type="checkbox" class="drawer-toggle" />
          <div class="drawer-content flex flex-col">
            <div class="navbar bg-base-300">
              <div class="flex-none">
                <label for="test-drawer" class="btn btn-square btn-ghost">
                  <svg class="inline-block w-6 h-6 stroke-current" fill="none" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
                  </svg>
                </label>
              </div>
              <div class="flex-1">
                <a class="btn btn-ghost normal-case text-xl">App Title</a>
              </div>
            </div>
            <div class="p-4">
              <h2 class="text-2xl font-bold">Main Content</h2>
              <p>This is the main content area.</p>
            </div>
          </div>
          <div class="drawer-side">
            <label for="test-drawer" class="drawer-overlay"></label>
            <aside class="w-80 min-h-full bg-base-200">
              <div class="p-4">
                <h3 class="font-bold text-lg">Sidebar</h3>
                <ul class="menu">
                  <li><a>Home</a></li>
                  <li><a>About</a></li>
                  <li><a>Contact</a></li>
                </ul>
              </div>
            </aside>
          </div>
        </div>
      `;
      document.body.appendChild(container);
    });

    const container = page.locator("div").last();
    await expect(container).toHaveScreenshot("drawer-with-content.png");
  });
});
