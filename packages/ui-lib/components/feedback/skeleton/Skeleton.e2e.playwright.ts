import { expect, test } from "npm:@playwright/test";

test.describe("Skeleton E2E Tests", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:8000/components/feedback/skeleton");
  });

  test("skeleton display navigation and visibility", async ({ page }) => {
    await page.click('text="Components"');
    await expect(page).toHaveURL(/components$/);

    await page.goto("http://localhost:8000/components/feedback/skeleton");
    await expect(page.locator(".skeleton")).toBeVisible();
    await expect(page.locator("h1")).toContainText("Skeleton");
  });

  test("skeleton display animations are active", async ({ page }) => {
    const skeleton = page.locator(".skeleton").first();
    await expect(skeleton).toBeVisible();

    const hasAnimation = await skeleton.evaluate((el) => {
      const style = window.getComputedStyle(el);
      return style.animationName !== "none" || style.backgroundImage !== "none";
    });

    expect(hasAnimation).toBeTruthy();
  });

  test("skeleton display shapes and sizes", async ({ page }) => {
    const skeletons = page.locator(".skeleton");
    const count = await skeletons.count();

    for (let i = 0; i < Math.min(5, count); i++) {
      await expect(skeletons.nth(i)).toBeVisible();
    }
  });

  test("skeleton display accessibility", async ({ page }) => {
    const skeleton = page.locator(".skeleton").first();
    await expect(skeleton).toBeVisible();

    const hasAriaAttributes = await skeleton.evaluate((el) => {
      return el.hasAttribute("aria-label") ||
        el.hasAttribute("aria-hidden") ||
        el.hasAttribute("role");
    });

    expect(hasAriaAttributes).toBeTruthy();
  });

  test("skeleton display responsive behavior", async ({ page }) => {
    const viewports = [
      { width: 375, height: 667 },
      { width: 768, height: 1024 },
      { width: 1920, height: 1080 },
    ];

    for (const viewport of viewports) {
      await page.setViewportSize(viewport);
      const skeleton = page.locator(".skeleton").first();
      await expect(skeleton).toBeVisible();
    }
  });
});
