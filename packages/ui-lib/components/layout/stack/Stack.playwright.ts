import { expect, test } from "@playwright/test";

test.describe("Stack Visual Tests", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:8001/components/layout/stack");
    await page.waitForLoadState("networkidle");
  });

  test("stack basic variants visual regression", async ({ page }) => {
    const basicSection = page.locator(".card").first();
    await expect(basicSection).toHaveScreenshot("stack-basic-variants.png");
  });

  test("stack with images visual regression", async ({ page }) => {
    const imagesSection = page.locator(".card").nth(1);
    await expect(imagesSection).toHaveScreenshot("stack-with-images.png");
  });

  test("stack with cards visual regression", async ({ page }) => {
    const cardsSection = page.locator(".card").nth(2);
    await expect(cardsSection).toHaveScreenshot("stack-with-cards.png");
  });

  // Theme testing
  test("stacks in different themes", async ({ page }) => {
    const themes = ["light", "dark", "cupcake", "cyberpunk", "synthwave"];

    for (const theme of themes) {
      await page.evaluate((theme) => {
        document.documentElement.setAttribute("data-theme", theme);
      }, theme);

      await page.waitForTimeout(100);

      const stackSection = page.locator(".card").first();
      await expect(stackSection).toHaveScreenshot(`stack-theme-${theme}.png`);
    }
  });

  // Responsive testing
  test("stacks responsive design", async ({ page }) => {
    const viewports = [
      { width: 375, height: 667, name: "mobile" },
      { width: 768, height: 1024, name: "tablet" },
      { width: 1920, height: 1080, name: "desktop" },
    ];

    for (const viewport of viewports) {
      await page.setViewportSize(viewport);

      const stackSection = page.locator(".card").first();
      await expect(stackSection).toHaveScreenshot(`stack-${viewport.name}.png`);
    }
  });

  test("stack configurations", async ({ page }) => {
    await page.evaluate(() => {
      const container = document.createElement("div");
      container.className = "p-4 space-y-8";
      container.innerHTML = `
        <div class="stack">
          <div class="grid w-32 h-20 rounded bg-primary place-content-center">1</div>
          <div class="grid w-32 h-20 rounded bg-accent place-content-center">2</div>
          <div class="grid w-32 h-20 rounded bg-secondary place-content-center">3</div>
        </div>
        <div class="stack">
          <img src="https://picsum.photos/300/200?random=1" class="rounded" />
          <img src="https://picsum.photos/300/200?random=2" class="rounded" />
          <img src="https://picsum.photos/300/200?random=3" class="rounded" />
        </div>
        <div class="stack">
          <div class="card w-36 bg-primary text-primary-content">
            <div class="card-body">
              <h2 class="card-title">Card 1</h2>
            </div>
          </div>
          <div class="card w-36 bg-accent text-accent-content">
            <div class="card-body">
              <h2 class="card-title">Card 2</h2>
            </div>
          </div>
          <div class="card w-36 bg-secondary text-secondary-content">
            <div class="card-body">
              <h2 class="card-title">Card 3</h2>
            </div>
          </div>
        </div>
      `;
      document.body.appendChild(container);
    });

    const container = page.locator("div").last();
    await expect(container).toHaveScreenshot("stack-configurations.png");
  });
});
