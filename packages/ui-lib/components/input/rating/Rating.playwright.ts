import { expect, test } from "@playwright/test";

test.describe("Rating Visual Tests", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:8001/components/input/rating");
    await page.waitForLoadState("networkidle");
  });

  test("rating basic variants visual regression", async ({ page }) => {
    const basicSection = page.locator(".card").first();
    await expect(basicSection).toHaveScreenshot("rating-basic-variants.png");
  });

  test("rating sizes visual regression", async ({ page }) => {
    const sizesSection = page.locator(".card").nth(1);
    await expect(sizesSection).toHaveScreenshot("rating-sizes.png");
  });

  test("rating styles visual regression", async ({ page }) => {
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(500);

    const stylesSection = page.locator(".card").nth(2);
    await expect(stylesSection).toHaveScreenshot("rating-styles.png");
  });

  test("rating states visual regression", async ({ page }) => {
    const statesSection = page.locator(".card").nth(3);
    await expect(statesSection).toHaveScreenshot("rating-states.png");
  });

  test("rating hover states", async ({ page }) => {
    const ratingStars = page.locator('.rating input[type="radio"]');
    const starCount = await ratingStars.count();

    if (starCount > 0) {
      const thirdStar = ratingStars.nth(2);

      // Normal state
      const ratingContainer = page.locator(".rating").first();
      await expect(ratingContainer).toHaveScreenshot("rating-normal.png");

      // Hover state
      await thirdStar.hover();
      await expect(ratingContainer).toHaveScreenshot("rating-hover.png");
    }
  });

  test("rating focus states", async ({ page }) => {
    const ratingStars = page.locator('.rating input[type="radio"]');
    const starCount = await ratingStars.count();

    if (starCount > 0) {
      const firstStar = ratingStars.first();

      // Focus state
      await firstStar.focus();
      const ratingContainer = page.locator(".rating").first();
      await expect(ratingContainer).toHaveScreenshot("rating-focus.png");
    }
  });

  // Theme testing
  test("ratings in different themes", async ({ page }) => {
    const themes = ["light", "dark", "cupcake", "cyberpunk", "synthwave"];

    for (const theme of themes) {
      await page.evaluate((theme) => {
        document.documentElement.setAttribute("data-theme", theme);
      }, theme);

      await page.waitForTimeout(100);

      const ratingSection = page.locator(".card").first();
      await expect(ratingSection).toHaveScreenshot(`rating-theme-${theme}.png`);
    }
  });

  // Responsive testing
  test("ratings responsive design", async ({ page }) => {
    const viewports = [
      { width: 375, height: 667, name: "mobile" },
      { width: 768, height: 1024, name: "tablet" },
      { width: 1920, height: 1080, name: "desktop" },
    ];

    for (const viewport of viewports) {
      await page.setViewportSize(viewport);

      const ratingSection = page.locator(".card").first();
      await expect(ratingSection).toHaveScreenshot(`rating-${viewport.name}.png`);
    }
  });

  test("rating accessibility features", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });

    const ratingSection = page.locator(".card").first();
    await expect(ratingSection).toHaveScreenshot("rating-reduced-motion.png");
  });

  test("rating with different configurations", async ({ page }) => {
    await page.evaluate(() => {
      const container = document.createElement("div");
      container.className = "p-4 space-y-4";
      container.innerHTML = `
        <div class="rating">
          <input type="radio" name="rating-1" class="mask mask-star" />
          <input type="radio" name="rating-1" class="mask mask-star" checked />
          <input type="radio" name="rating-1" class="mask mask-star" />
          <input type="radio" name="rating-1" class="mask mask-star" />
          <input type="radio" name="rating-1" class="mask mask-star" />
        </div>
        <div class="rating rating-lg">
          <input type="radio" name="rating-2" class="mask mask-star-2 bg-orange-400" />
          <input type="radio" name="rating-2" class="mask mask-star-2 bg-orange-400" />
          <input type="radio" name="rating-2" class="mask mask-star-2 bg-orange-400" checked />
          <input type="radio" name="rating-2" class="mask mask-star-2 bg-orange-400" />
          <input type="radio" name="rating-2" class="mask mask-star-2 bg-orange-400" />
        </div>
        <div class="rating rating-sm">
          <input type="radio" name="rating-3" class="mask mask-heart bg-red-400" />
          <input type="radio" name="rating-3" class="mask mask-heart bg-red-400" checked />
          <input type="radio" name="rating-3" class="mask mask-heart bg-red-400" />
          <input type="radio" name="rating-3" class="mask mask-heart bg-red-400" />
          <input type="radio" name="rating-3" class="mask mask-heart bg-red-400" />
        </div>
      `;
      document.body.appendChild(container);
    });

    const container = page.locator("div").last();
    await expect(container).toHaveScreenshot("rating-different-configs.png");
  });

  test("rating with half stars", async ({ page }) => {
    await page.evaluate(() => {
      const container = document.createElement("div");
      container.className = "p-4 space-y-4";
      container.innerHTML = `
        <div class="rating rating-half">
          <input type="radio" name="rating-half" class="rating-hidden" />
          <input type="radio" name="rating-half" class="mask mask-star-2 mask-half-1 bg-green-500" />
          <input type="radio" name="rating-half" class="mask mask-star-2 mask-half-2 bg-green-500" />
          <input type="radio" name="rating-half" class="mask mask-star-2 mask-half-1 bg-green-500" checked />
          <input type="radio" name="rating-half" class="mask mask-star-2 mask-half-2 bg-green-500" />
          <input type="radio" name="rating-half" class="mask mask-star-2 mask-half-1 bg-green-500" />
          <input type="radio" name="rating-half" class="mask mask-star-2 mask-half-2 bg-green-500" />
          <input type="radio" name="rating-half" class="mask mask-star-2 mask-half-1 bg-green-500" />
          <input type="radio" name="rating-half" class="mask mask-star-2 mask-half-2 bg-green-500" />
          <input type="radio" name="rating-half" class="mask mask-star-2 mask-half-1 bg-green-500" />
          <input type="radio" name="rating-half" class="mask mask-star-2 mask-half-2 bg-green-500" />
        </div>
      `;
      document.body.appendChild(container);
    });

    const container = page.locator("div").last();
    await expect(container).toHaveScreenshot("rating-half-stars.png");
  });
});
