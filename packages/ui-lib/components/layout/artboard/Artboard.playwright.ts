import { expect, test } from "@playwright/test";

test.describe("Artboard Visual Tests", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:8001/components/layout/artboard");
    await page.waitForLoadState("networkidle");
  });

  test("artboard basic variants visual regression", async ({ page }) => {
    const basicSection = page.locator(".card").first();
    await expect(basicSection).toHaveScreenshot("artboard-basic-variants.png");
  });

  test("artboard sizes visual regression", async ({ page }) => {
    const sizesSection = page.locator(".card").nth(1);
    await expect(sizesSection).toHaveScreenshot("artboard-sizes.png");
  });

  test("artboard with content visual regression", async ({ page }) => {
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(500);

    const contentSection = page.locator(".card").nth(2);
    await expect(contentSection).toHaveScreenshot("artboard-with-content.png");
  });

  test("artboard phone mockup visual regression", async ({ page }) => {
    const phoneSection = page.locator(".card").nth(3);
    await expect(phoneSection).toHaveScreenshot("artboard-phone-mockup.png");
  });

  // Theme testing
  test("artboards in different themes", async ({ page }) => {
    const themes = ["light", "dark", "cupcake", "cyberpunk", "synthwave"];

    for (const theme of themes) {
      await page.evaluate((theme) => {
        document.documentElement.setAttribute("data-theme", theme);
      }, theme);

      await page.waitForTimeout(100);

      const artboardSection = page.locator(".card").first();
      await expect(artboardSection).toHaveScreenshot(`artboard-theme-${theme}.png`);
    }
  });

  // Responsive testing
  test("artboards responsive design", async ({ page }) => {
    const viewports = [
      { width: 375, height: 667, name: "mobile" },
      { width: 768, height: 1024, name: "tablet" },
      { width: 1920, height: 1080, name: "desktop" },
    ];

    for (const viewport of viewports) {
      await page.setViewportSize(viewport);

      const artboardSection = page.locator(".card").first();
      await expect(artboardSection).toHaveScreenshot(`artboard-${viewport.name}.png`);
    }
  });

  test("artboard accessibility features", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });

    const artboardSection = page.locator(".card").first();
    await expect(artboardSection).toHaveScreenshot("artboard-reduced-motion.png");
  });

  test("artboard with different configurations", async ({ page }) => {
    await page.evaluate(() => {
      const container = document.createElement("div");
      container.className = "p-4 space-y-4";
      container.innerHTML = `
        <div class="artboard artboard-horizontal phone-1">
          <div class="p-4">Horizontal Phone</div>
        </div>
        <div class="artboard artboard-horizontal phone-2">
          <div class="p-4">Horizontal Phone 2</div>
        </div>
        <div class="artboard artboard-horizontal phone-3">
          <div class="p-4">Horizontal Phone 3</div>
        </div>
        <div class="artboard artboard-horizontal phone-4">
          <div class="p-4">Horizontal Phone 4</div>
        </div>
        <div class="artboard artboard-horizontal phone-5">
          <div class="p-4">Horizontal Phone 5</div>
        </div>
        <div class="artboard artboard-horizontal phone-6">
          <div class="p-4">Horizontal Phone 6</div>
        </div>
      `;
      document.body.appendChild(container);
    });

    const container = page.locator("div").last();
    await expect(container).toHaveScreenshot("artboard-horizontal-phones.png");
  });

  test("artboard with demo content", async ({ page }) => {
    await page.evaluate(() => {
      const container = document.createElement("div");
      container.className = "p-4 space-y-4";
      container.innerHTML = `
        <div class="artboard phone-2">
          <div class="p-4 h-full flex flex-col">
            <div class="navbar bg-base-200 mb-4">
              <div class="navbar-start">
                <div class="navbar-item">App</div>
              </div>
            </div>
            <div class="flex-1 p-4">
              <h2 class="text-lg font-bold mb-2">Welcome</h2>
              <p class="text-sm">This is a demo app interface</p>
              <div class="mt-4">
                <button class="btn btn-primary btn-sm">Get Started</button>
              </div>
            </div>
          </div>
        </div>
      `;
      document.body.appendChild(container);
    });

    const container = page.locator("div").last();
    await expect(container).toHaveScreenshot("artboard-demo-content.png");
  });
});
