import { expect, test } from "@playwright/test";

test.describe("Join Visual Tests", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:8001/components/layout/join");
    await page.waitForLoadState("networkidle");
  });

  test("join basic variants visual regression", async ({ page }) => {
    const basicSection = page.locator(".card").first();
    await expect(basicSection).toHaveScreenshot("join-basic-variants.png");
  });

  test("join with buttons visual regression", async ({ page }) => {
    const buttonSection = page.locator(".card").nth(1);
    await expect(buttonSection).toHaveScreenshot("join-with-buttons.png");
  });

  test("join with inputs visual regression", async ({ page }) => {
    const inputSection = page.locator(".card").nth(2);
    await expect(inputSection).toHaveScreenshot("join-with-inputs.png");
  });

  // Theme testing
  test("joins in different themes", async ({ page }) => {
    const themes = ["light", "dark", "cupcake", "cyberpunk", "synthwave"];

    for (const theme of themes) {
      await page.evaluate((theme) => {
        document.documentElement.setAttribute("data-theme", theme);
      }, theme);

      await page.waitForTimeout(100);

      const joinSection = page.locator(".card").first();
      await expect(joinSection).toHaveScreenshot(`join-theme-${theme}.png`);
    }
  });

  // Responsive testing
  test("joins responsive design", async ({ page }) => {
    const viewports = [
      { width: 375, height: 667, name: "mobile" },
      { width: 768, height: 1024, name: "tablet" },
      { width: 1920, height: 1080, name: "desktop" },
    ];

    for (const viewport of viewports) {
      await page.setViewportSize(viewport);

      const joinSection = page.locator(".card").first();
      await expect(joinSection).toHaveScreenshot(`join-${viewport.name}.png`);
    }
  });

  test("join configurations", async ({ page }) => {
    await page.evaluate(() => {
      const container = document.createElement("div");
      container.className = "p-4 space-y-4";
      container.innerHTML = `
        <div class="join">
          <button class="btn join-item">Button</button>
          <button class="btn join-item">Button</button>
          <button class="btn join-item">Button</button>
        </div>
        <div class="join">
          <input class="input input-bordered join-item" placeholder="Email"/>
          <button class="btn join-item rounded-r-full">Subscribe</button>
        </div>
        <div class="join">
          <input type="radio" name="options" data-title="1" class="btn join-item" />
          <input type="radio" name="options" data-title="2" class="btn join-item" />
          <input type="radio" name="options" data-title="3" class="btn join-item" />
        </div>
      `;
      document.body.appendChild(container);
    });

    const container = page.locator("div").last();
    await expect(container).toHaveScreenshot("join-configurations.png");
  });
});
