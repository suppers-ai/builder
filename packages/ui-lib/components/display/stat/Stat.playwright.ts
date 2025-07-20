import { expect, test } from "@playwright/test";

test.describe("Stat Visual Tests", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:8001/components/display/stat");
    await page.waitForLoadState("networkidle");
  });

  test("stat variants visual regression", async ({ page }) => {
    const basicSection = page.locator(".card").first();
    await expect(basicSection).toHaveScreenshot("stat-basic-variants.png");
  });

  test("stat with figures visual regression", async ({ page }) => {
    const figuresSection = page.locator(".card").nth(1);
    await expect(figuresSection).toHaveScreenshot("stat-figures.png");
  });

  test("stat with actions visual regression", async ({ page }) => {
    const actionsSection = page.locator(".card").nth(2);
    await expect(actionsSection).toHaveScreenshot("stat-actions.png");
  });

  test("stat layouts visual regression", async ({ page }) => {
    const layoutsSection = page.locator(".card").nth(3);
    await expect(layoutsSection).toHaveScreenshot("stat-layouts.png");
  });

  test("stat interaction states", async ({ page }) => {
    const clickableStat = page.locator(".stat.cursor-pointer").first();

    if (await clickableStat.count() > 0) {
      // Normal state
      await expect(clickableStat).toHaveScreenshot("stat-normal.png");

      // Hover state
      await clickableStat.hover();
      await expect(clickableStat).toHaveScreenshot("stat-hover.png");
    }
  });

  test("stat with different value types", async ({ page }) => {
    // Create stats with different value types for visual testing
    await page.evaluate(() => {
      const container = document.createElement("div");
      container.className = "stats shadow";
      container.innerHTML = `
        <div class="stat">
          <div class="stat-title">Downloads</div>
          <div class="stat-value">31K</div>
          <div class="stat-desc">Jan 1st - Feb 1st</div>
        </div>
        <div class="stat">
          <div class="stat-title">Users</div>
          <div class="stat-value text-secondary">4,200</div>
          <div class="stat-desc text-secondary">↗︎ 400 (22%)</div>
        </div>
        <div class="stat">
          <div class="stat-title">New Registers</div>
          <div class="stat-value text-accent">1,200</div>
          <div class="stat-desc text-accent">↘︎ 90 (14%)</div>
        </div>
      `;
      document.body.appendChild(container);
    });

    const container = page.locator(".stats").last();
    await expect(container).toHaveScreenshot("stat-value-types.png");
  });

  test("stat with icons and figures", async ({ page }) => {
    // Create stats with various icons for visual testing
    await page.evaluate(() => {
      const container = document.createElement("div");
      container.className = "stats shadow";
      container.innerHTML = `
        <div class="stat">
          <div class="stat-figure text-primary">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="inline-block w-8 h-8 stroke-current">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
            </svg>
          </div>
          <div class="stat-title">Total Likes</div>
          <div class="stat-value text-primary">25.6K</div>
          <div class="stat-desc">21% more than last month</div>
        </div>
        <div class="stat">
          <div class="stat-figure text-secondary">
            <div class="avatar online">
              <div class="w-16 rounded-full">
                <img src="https://via.placeholder.com/64" />
              </div>
            </div>
          </div>
          <div class="stat-value">86%</div>
          <div class="stat-title">Tasks done</div>
          <div class="stat-desc text-secondary">31 tasks remaining</div>
        </div>
      `;
      document.body.appendChild(container);
    });

    const container = page.locator(".stats").last();
    await expect(container).toHaveScreenshot("stat-icons-figures.png");
  });

  test("stats in different themes", async ({ page }) => {
    const themes = ["light", "dark", "cupcake", "cyberpunk"];

    for (const theme of themes) {
      await page.evaluate((theme) => {
        document.documentElement.setAttribute("data-theme", theme);
      }, theme);

      await page.waitForTimeout(100);

      const statSection = page.locator(".stat").first();
      await expect(statSection).toHaveScreenshot(`stat-theme-${theme}.png`);
    }
  });

  test("stats responsive design", async ({ page }) => {
    const viewports = [
      { width: 375, height: 667, name: "mobile" },
      { width: 768, height: 1024, name: "tablet" },
      { width: 1920, height: 1080, name: "desktop" },
    ];

    for (const viewport of viewports) {
      await page.setViewportSize(viewport);

      const statSection = page.locator(".stats").first();
      await expect(statSection).toHaveScreenshot(`stats-${viewport.name}.png`);
    }
  });

  test("stat grid layouts", async ({ page }) => {
    // Create different grid layouts for visual testing
    await page.evaluate(() => {
      const container = document.createElement("div");
      container.className = "space-y-4";
      container.innerHTML = `
        <!-- Single stat -->
        <div class="stats shadow">
          <div class="stat">
            <div class="stat-title">Single Stat</div>
            <div class="stat-value">100%</div>
          </div>
        </div>
        
        <!-- Two stats -->
        <div class="stats shadow">
          <div class="stat">
            <div class="stat-title">First</div>
            <div class="stat-value">1st</div>
          </div>
          <div class="stat">
            <div class="stat-title">Second</div>
            <div class="stat-value">2nd</div>
          </div>
        </div>
        
        <!-- Four stats -->
        <div class="stats shadow">
          <div class="stat">
            <div class="stat-title">Q1</div>
            <div class="stat-value">25%</div>
          </div>
          <div class="stat">
            <div class="stat-title">Q2</div>
            <div class="stat-value">25%</div>
          </div>
          <div class="stat">
            <div class="stat-title">Q3</div>
            <div class="stat-value">25%</div>
          </div>
          <div class="stat">
            <div class="stat-title">Q4</div>
            <div class="stat-value">25%</div>
          </div>
        </div>
      `;
      document.body.appendChild(container);
    });

    const container = page.locator("div").last();
    await expect(container).toHaveScreenshot("stat-grid-layouts.png");
  });
});
