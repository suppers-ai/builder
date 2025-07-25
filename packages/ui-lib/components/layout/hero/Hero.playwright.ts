import { expect, test } from "@playwright/test";

test.describe("Hero Visual Tests", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:8001/components/layout/hero");
    await page.waitForLoadState("networkidle");
  });

  test("hero variants visual regression", async ({ page }) => {
    const basicSection = page.locator(".card").first();
    await expect(basicSection).toHaveScreenshot("hero-basic-variants.png");
  });

  test("hero backgrounds visual regression", async ({ page }) => {
    const backgroundsSection = page.locator(".card").nth(1);
    await expect(backgroundsSection).toHaveScreenshot("hero-backgrounds.png");
  });

  test("hero sizes visual regression", async ({ page }) => {
    const sizesSection = page.locator(".card").nth(2);
    await expect(sizesSection).toHaveScreenshot("hero-sizes.png");
  });

  test("hero layouts visual regression", async ({ page }) => {
    const layoutsSection = page.locator(".card").nth(3);
    await expect(layoutsSection).toHaveScreenshot("hero-layouts.png");
  });

  test("hero CTA buttons interaction", async ({ page }) => {
    const ctaButton = page.locator(".btn-primary").first();

    if (await ctaButton.count() > 0) {
      // Normal state
      await expect(ctaButton).toHaveScreenshot("hero-cta-normal.png");

      // Hover state
      await ctaButton.hover();
      await expect(ctaButton).toHaveScreenshot("hero-cta-hover.png");

      // Focus state
      await ctaButton.focus();
      await expect(ctaButton).toHaveScreenshot("hero-cta-focus.png");
    }
  });

  test("hero with different content combinations", async ({ page }) => {
    // Create different hero configurations for visual testing
    await page.evaluate(() => {
      const container = document.createElement("div");
      container.className = "space-y-8";
      container.innerHTML = `
        <!-- Minimal Hero -->
        <div class="hero min-h-[40vh] bg-base-200">
          <div class="hero-content text-center">
            <div class="max-w-md">
              <h1 class="text-3xl font-bold">Minimal Hero</h1>
            </div>
          </div>
        </div>
        
        <!-- Hero with Image -->
        <div class="hero min-h-[40vh] bg-base-200">
          <div class="hero-content flex-col lg:flex-row">
            <img src="https://via.placeholder.com/300x200" class="max-w-sm rounded-lg shadow-2xl" />
            <div>
              <h1 class="text-3xl font-bold">Hero with Image</h1>
              <p class="py-6">Description text here</p>
              <button class="btn btn-primary">Get Started</button>
            </div>
          </div>
        </div>
      `;
      document.body.appendChild(container);
    });

    const container = page.locator("div").last();
    await expect(container).toHaveScreenshot("hero-content-combinations.png");
  });

  test("hero in different themes", async ({ page }) => {
    const themes = ["light", "dark", "cupcake", "cyberpunk"];

    for (const theme of themes) {
      await page.evaluate((theme) => {
        document.documentElement.setAttribute("data-theme", theme);
      }, theme);

      await page.waitForTimeout(100);

      const heroSection = page.locator(".hero").first();
      await expect(heroSection).toHaveScreenshot(`hero-theme-${theme}.png`);
    }
  });

  test("hero responsive design", async ({ page }) => {
    const viewports = [
      { width: 375, height: 667, name: "mobile" },
      { width: 768, height: 1024, name: "tablet" },
      { width: 1920, height: 1080, name: "desktop" },
    ];

    for (const viewport of viewports) {
      await page.setViewportSize(viewport);

      const heroSection = page.locator(".hero").first();
      await expect(heroSection).toHaveScreenshot(`hero-${viewport.name}.png`);
    }
  });

  test("hero gradient backgrounds", async ({ page }) => {
    // Create heroes with different gradient backgrounds
    await page.evaluate(() => {
      const container = document.createElement("div");
      container.className = "space-y-4";
      container.innerHTML = `
        <div class="hero min-h-[30vh] bg-gradient-to-r from-primary to-secondary">
          <div class="hero-content text-center text-primary-content">
            <h1 class="text-2xl font-bold">Primary Gradient</h1>
          </div>
        </div>
        <div class="hero min-h-[30vh] bg-gradient-to-br from-accent to-info">
          <div class="hero-content text-center text-accent-content">
            <h1 class="text-2xl font-bold">Accent Gradient</h1>
          </div>
        </div>
      `;
      document.body.appendChild(container);
    });

    const container = page.locator("div").last();
    await expect(container).toHaveScreenshot("hero-gradient.webp");
  });

  test("hero overlay effects", async ({ page }) => {
    // Create hero with overlay for visual testing
    await page.evaluate(() => {
      const container = document.createElement("div");
      container.className = "relative";
      container.innerHTML = `
        <div class="hero min-h-[50vh] bg-cover bg-center" style="background-image: url('https://via.placeholder.com/800x400/333/fff?text=Background');">
          <div class="hero-overlay bg-opacity-60"></div>
          <div class="hero-content text-center text-neutral-content relative z-10">
            <div class="max-w-md">
              <h1 class="mb-5 text-3xl font-bold text-white">Hero with Overlay</h1>
              <p class="mb-5 text-white">Dark overlay for better text readability</p>
              <button class="btn btn-primary">Action</button>
            </div>
          </div>
        </div>
      `;
      document.body.appendChild(container);
    });

    const container = page.locator("div").last();
    await expect(container).toHaveScreenshot("hero-overlay.png");
  });
});
