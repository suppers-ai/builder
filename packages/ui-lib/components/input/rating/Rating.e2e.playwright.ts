import { expect, test } from "@playwright/test";

test.describe("Rating E2E Tests", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:8001/components/input/rating");
    await page.waitForLoadState("networkidle");
  });

  test("page loads and displays rating examples", async ({ page }) => {
    await expect(page).toHaveTitle("DaisyUI Component Library - Fresh 2.0");
    await expect(page.locator("h1").first()).toContainText("Rating");
    await expect(page.locator(".rating").first()).toBeVisible();
  });

  test("navigation works correctly", async ({ page }) => {
    await expect(page.locator(".breadcrumbs")).toBeVisible();
    await expect(page.locator(".breadcrumbs")).toContainText("Home");
    await expect(page.locator(".breadcrumbs")).toContainText("Components");
    await expect(page.locator(".breadcrumbs")).toContainText("Rating");

    await page.click('.breadcrumbs a[href="/"]');
    await expect(page).toHaveURL("http://localhost:8001/");

    await page.goBack();
    await expect(page).toHaveURL(/rating$/);
  });

  test("rating examples render correctly", async ({ page }) => {
    const ratings = page.locator(".rating");
    const ratingCount = await ratings.count();
    expect(ratingCount).toBeGreaterThanOrEqual(3);

    // Check for different rating sizes
    await expect(page.locator(".rating-xs, .rating.rating-xs").first()).toBeVisible();
    await expect(page.locator(".rating-lg, .rating.rating-lg").first()).toBeVisible();

    // Check for rating inputs
    const ratingInputs = page.locator('.rating input[type="radio"]');
    const inputCount = await ratingInputs.count();
    expect(inputCount).toBeGreaterThanOrEqual(5);
  });

  test("rating star interaction works", async ({ page }) => {
    const ratingInputs = page.locator('.rating input[type="radio"]');
    const inputCount = await ratingInputs.count();

    if (inputCount > 0) {
      const thirdStar = ratingInputs.nth(2);

      // Click on third star
      await thirdStar.click();

      // Check if it's selected
      const isChecked = await thirdStar.isChecked();
      expect(isChecked).toBe(true);

      // Click on fifth star
      if (inputCount > 4) {
        const fifthStar = ratingInputs.nth(4);
        await fifthStar.click();

        const fifthIsChecked = await fifthStar.isChecked();
        expect(fifthIsChecked).toBe(true);

        // Third star should no longer be checked
        const thirdIsChecked = await thirdStar.isChecked();
        expect(thirdIsChecked).toBe(false);
      }
    }
  });

  test("rating keyboard navigation works", async ({ page }) => {
    const ratingInputs = page.locator('.rating input[type="radio"]');
    const inputCount = await ratingInputs.count();

    if (inputCount > 0) {
      // Focus first rating input
      await ratingInputs.first().focus();
      await expect(ratingInputs.first()).toBeFocused();

      // Use arrow keys to navigate
      await page.keyboard.press("ArrowRight");

      // Check if focus moved to next star
      const secondStar = ratingInputs.nth(1);
      await expect(secondStar).toBeFocused();

      // Use space to select
      await page.keyboard.press("Space");

      const isChecked = await secondStar.isChecked();
      expect(isChecked).toBe(true);
    }
  });

  test("rating different styles work", async ({ page }) => {
    // Check for different rating styles (star, heart, etc.)
    const starRatings = page.locator(".rating input.mask-star");
    const heartRatings = page.locator(".rating input.mask-heart");

    const hasStars = await starRatings.count() > 0;
    const hasHearts = await heartRatings.count() > 0;

    if (hasStars) {
      await expect(starRatings.first()).toBeVisible();
    }

    if (hasHearts) {
      await expect(heartRatings.first()).toBeVisible();
    }
  });

  test("rating colors work correctly", async ({ page }) => {
    const coloredRatings = page.locator('.rating input[class*="bg-"]');
    const hasColored = await coloredRatings.count() > 0;

    if (hasColored) {
      // Click on a colored rating to test interaction
      await coloredRatings.first().click();
      const isChecked = await coloredRatings.first().isChecked();
      expect(isChecked).toBe(true);
    }
  });

  test("rating half stars work", async ({ page }) => {
    const halfStarRatings = page.locator(".rating-half");
    const hasHalfStars = await halfStarRatings.count() > 0;

    if (hasHalfStars) {
      const halfStarInputs = halfStarRatings.first().locator('input[type="radio"]');
      const halfInputCount = await halfStarInputs.count();

      if (halfInputCount > 0) {
        // Click on a half star
        await halfStarInputs.nth(1).click();
        const isChecked = await halfStarInputs.nth(1).isChecked();
        expect(isChecked).toBe(true);
      }
    }
  });

  test("rating form integration works", async ({ page }) => {
    const ratingInputs = page.locator('.rating input[type="radio"]');
    const inputCount = await ratingInputs.count();

    if (inputCount > 0) {
      const ratingInput = ratingInputs.first();

      // Check if input has name attribute for form submission
      const nameAttr = await ratingInput.getAttribute("name");
      expect(nameAttr).toBeTruthy();

      // Click to select
      await ratingInput.click();

      // Check value attribute
      const valueAttr = await ratingInput.getAttribute("value");
      expect(valueAttr).toBeTruthy();
    }
  });

  test("rating accessibility features work", async ({ page }) => {
    const ratingInputs = page.locator('.rating input[type="radio"]');
    const inputCount = await ratingInputs.count();

    if (inputCount > 0) {
      const ratingInput = ratingInputs.first();

      // Check for accessibility attributes
      await ratingInput.focus();

      // Rating should be focusable
      await expect(ratingInput).toBeFocused();

      // Should respond to Enter key
      await page.keyboard.press("Enter");

      const isChecked = await ratingInput.isChecked();
      expect(isChecked).toBe(true);
    }
  });

  test("API documentation is present", async ({ page }) => {
    await expect(page.locator("table, .api-table")).toBeVisible();
    await expect(page.locator('text="size"')).toBeVisible();
    await expect(page.locator('text="color"')).toBeVisible();
    await expect(page.locator('text="value"')).toBeVisible();
  });

  test("responsive behavior on mobile", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });

    await expect(page.locator("h1").first()).toBeVisible();
    await expect(page.locator(".rating").first()).toBeVisible();
    await expect(page.locator("main").first()).toBeVisible();

    // Test touch interaction on mobile
    const ratingInputs = page.locator('.rating input[type="radio"]');
    const inputCount = await ratingInputs.count();

    if (inputCount > 0) {
      // Tap on a rating star
      await ratingInputs.nth(2).tap();
      const isChecked = await ratingInputs.nth(2).isChecked();
      expect(isChecked).toBe(true);
    }
  });

  test("page performance is acceptable", async ({ page }) => {
    const navigationPromise = page.waitForLoadState("networkidle");
    const startTime = Date.now();

    await page.goto("http://localhost:8001/components/input/rating");
    await navigationPromise;

    const loadTime = Date.now() - startTime;
    expect(loadTime).toBeLessThan(3000);
  });
});
