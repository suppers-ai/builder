import { expect, test } from "npm:@playwright/test";

test.describe("Skeleton Visual Tests", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:8000/components/feedback/skeleton");
  });

  test("skeleton display variants", async ({ page }) => {
    const section = page.locator(".examples-section").first();
    await expect(section).toHaveScreenshot("skeleton-variants.png");
  });

  test("skeleton display shapes", async ({ page }) => {
    // Test different skeleton shapes
    const skeletonShapes = page.locator(".skeleton");
    if (await skeletonShapes.count() > 0) {
      await expect(skeletonShapes.first().locator("..")).toHaveScreenshot("skeleton-shapes.png");
    }
  });

  test("skeleton display card layout", async ({ page }) => {
    const cardSkeleton = page.locator(".skeleton").filter({ hasText: "" }); // Empty skeleton for card
    if (await cardSkeleton.count() > 0) {
      await expect(cardSkeleton.first().locator("..")).toHaveScreenshot("skeleton-card.png");
    }
  });

  test("skeleton display themes", async ({ page }) => {
    const themes = ["light", "dark", "cupcake", "cyberpunk", "synthwave"];

    for (const theme of themes) {
      await page.evaluate((theme) => {
        document.documentElement.setAttribute("data-theme", theme);
      }, theme);

      await page.waitForTimeout(100);
      const skeleton = page.locator(".skeleton").first();
      await expect(skeleton).toHaveScreenshot(`skeleton-theme-${theme}.png`);
    }
  });

  test("skeleton display responsive design", async ({ page }) => {
    const viewports = [
      { width: 375, height: 667, name: "mobile" },
      { width: 768, height: 1024, name: "tablet" },
      { width: 1920, height: 1080, name: "desktop" },
    ];

    for (const viewport of viewports) {
      await page.setViewportSize(viewport);
      const skeleton = page.locator(".skeleton").first();
      await expect(skeleton).toHaveScreenshot(`skeleton-${viewport.name}.png`);
    }
  });

  test("skeleton display text lines", async ({ page }) => {
    const textSkeleton = page.locator(".skeleton.h-4, .skeleton.h-3, .skeleton.h-2");
    if (await textSkeleton.count() > 0) {
      await expect(textSkeleton.first().locator("..")).toHaveScreenshot("skeleton-text-lines.png");
    }
  });

  test("skeleton display avatar", async ({ page }) => {
    const avatarSkeleton = page.locator(".skeleton.w-16.h-16, .skeleton.w-12.h-12");
    if (await avatarSkeleton.count() > 0) {
      await expect(avatarSkeleton.first()).toHaveScreenshot("skeleton-avatar.png");
    }
  });

  test("skeleton display image placeholder", async ({ page }) => {
    const imageSkeleton = page.locator(".skeleton.w-full.h-32, .skeleton.w-full.h-48");
    if (await imageSkeleton.count() > 0) {
      await expect(imageSkeleton.first()).toHaveScreenshot("skeleton-image.png");
    }
  });

  test("skeleton display animation", async ({ page }) => {
    // Test skeleton pulse animation
    const skeleton = page.locator(".skeleton").first();
    await expect(skeleton).toBeVisible();

    // Capture during animation
    await page.waitForTimeout(500);
    await expect(skeleton).toHaveScreenshot("skeleton-pulse-1.png");

    await page.waitForTimeout(500);
    await expect(skeleton).toHaveScreenshot("skeleton-pulse-2.png");
  });

  test("skeleton display grid layout", async ({ page }) => {
    // Test skeleton in grid/list layout
    const skeletonList = page.locator(".skeleton").all();
    if (await page.locator(".skeleton").count() > 3) {
      const container = page.locator(".skeleton").first().locator("../..").first();
      await expect(container).toHaveScreenshot("skeleton-grid.png");
    }
  });
});
