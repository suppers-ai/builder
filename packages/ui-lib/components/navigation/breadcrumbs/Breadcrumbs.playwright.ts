import { expect, test } from "@playwright/test";

test.describe("Breadcrumbs Visual Tests", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:8001/components/navigation/breadcrumbs");
    await page.waitForLoadState("networkidle");
  });

  test("breadcrumbs variants visual regression", async ({ page }) => {
    const basicSection = page.locator(".card").first();
    await expect(basicSection).toHaveScreenshot("breadcrumbs-basic-variants.png");
  });

  test("breadcrumbs sizes visual regression", async ({ page }) => {
    const sizesSection = page.locator(".card").nth(1);
    await expect(sizesSection).toHaveScreenshot("breadcrumbs-sizes.png");
  });

  test("breadcrumbs separators visual regression", async ({ page }) => {
    const separatorsSection = page.locator(".card").nth(2);
    await expect(separatorsSection).toHaveScreenshot("breadcrumbs-separators.png");
  });

  test("breadcrumbs states visual regression", async ({ page }) => {
    const statesSection = page.locator(".card").nth(3);
    await expect(statesSection).toHaveScreenshot("breadcrumbs-states.png");
  });

  test("breadcrumbs interaction states", async ({ page }) => {
    const breadcrumbLink = page.locator(".breadcrumbs a").first();

    if (await breadcrumbLink.count() > 0) {
      // Normal state
      await expect(breadcrumbLink).toHaveScreenshot("breadcrumb-link-normal.png");

      // Hover state
      await breadcrumbLink.hover();
      await expect(breadcrumbLink).toHaveScreenshot("breadcrumb-link-hover.png");

      // Focus state
      await breadcrumbLink.focus();
      await expect(breadcrumbLink).toHaveScreenshot("breadcrumb-link-focus.png");
    }
  });

  test("breadcrumbs with long paths", async ({ page }) => {
    // Create breadcrumbs with long path for visual testing
    await page.evaluate(() => {
      const container = document.createElement("div");
      container.className = "p-4";
      container.innerHTML = `
        <div class="breadcrumbs text-sm">
          <ul>
            <li><a href="/">Home</a></li>
            <li><a href="/products">Products</a></li>
            <li><a href="/products/electronics">Electronics</a></li>
            <li><a href="/products/electronics/computers">Computers</a></li>
            <li><a href="/products/electronics/computers/laptops">Laptops</a></li>
            <li><span>Gaming Laptops</span></li>
          </ul>
        </div>
      `;
      document.body.appendChild(container);
    });

    const container = page.locator("div").last();
    await expect(container).toHaveScreenshot("breadcrumbs-long-path.png");
  });

  test("breadcrumbs in different themes", async ({ page }) => {
    const themes = ["light", "dark", "cupcake", "cyberpunk"];

    for (const theme of themes) {
      await page.evaluate((theme) => {
        document.documentElement.setAttribute("data-theme", theme);
      }, theme);

      await page.waitForTimeout(100);

      const breadcrumbsSection = page.locator(".card").first();
      await expect(breadcrumbsSection).toHaveScreenshot(`breadcrumbs-theme-${theme}.png`);
    }
  });

  test("breadcrumbs responsive design", async ({ page }) => {
    const viewports = [
      { width: 375, height: 667, name: "mobile" },
      { width: 768, height: 1024, name: "tablet" },
      { width: 1920, height: 1080, name: "desktop" },
    ];

    for (const viewport of viewports) {
      await page.setViewportSize(viewport);

      const breadcrumbsSection = page.locator(".card").first();
      await expect(breadcrumbsSection).toHaveScreenshot(`breadcrumbs-${viewport.name}.png`);
    }
  });

  test("breadcrumbs with custom separators", async ({ page }) => {
    // Create breadcrumbs with different separators for visual testing
    await page.evaluate(() => {
      const container = document.createElement("div");
      container.className = "p-4 space-y-4";
      container.innerHTML = `
        <div class="breadcrumbs">
          <ul>
            <li><a>Home</a></li>
            <li><span class="mx-2">→</span><a>Products</a></li>
            <li><span class="mx-2">→</span><span>Current</span></li>
          </ul>
        </div>
        <div class="breadcrumbs">
          <ul>
            <li><a>Home</a></li>
            <li><span class="mx-2">/</span><a>Docs</a></li>
            <li><span class="mx-2">/</span><span>API</span></li>
          </ul>
        </div>
      `;
      document.body.appendChild(container);
    });

    const container = page.locator("div").last();
    await expect(container).toHaveScreenshot("breadcrumbs-custom-separators.png");
  });
});
