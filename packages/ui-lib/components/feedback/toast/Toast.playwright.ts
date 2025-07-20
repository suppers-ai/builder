import { expect, test } from "npm:@playwright/test";

test.describe("Toast Visual Tests", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:8000/components/feedback/toast");
  });

  test("toast display variants", async ({ page }) => {
    const section = page.locator(".examples-section").first();
    await expect(section).toHaveScreenshot("toast-variants.png");
  });

  test("toast display types", async ({ page }) => {
    // Test different toast types (success, error, warning, info)
    const toastTypes = page.locator(".toast");
    if (await toastTypes.count() > 0) {
      await expect(toastTypes.first().locator("..")).toHaveScreenshot("toast-types.png");
    }
  });

  test("toast display positions", async ({ page }) => {
    // Test different toast positions
    const positions = [
      ".toast-top",
      ".toast-bottom",
      ".toast-start",
      ".toast-end",
      ".toast-center",
    ];

    for (const position of positions) {
      const toast = page.locator(position);
      if (await toast.count() > 0) {
        await expect(toast.first()).toHaveScreenshot(
          `toast-position-${position.replace(".toast-", "")}.png`,
        );
      }
    }
  });

  test("toast display themes", async ({ page }) => {
    const themes = ["light", "dark", "cupcake", "cyberpunk", "synthwave"];

    for (const theme of themes) {
      await page.evaluate((theme) => {
        document.documentElement.setAttribute("data-theme", theme);
      }, theme);

      await page.waitForTimeout(100);
      const toast = page.locator(".toast").first();
      if (await toast.count() > 0) {
        await expect(toast).toHaveScreenshot(`toast-theme-${theme}.png`);
      }
    }
  });

  test("toast display responsive design", async ({ page }) => {
    const viewports = [
      { width: 375, height: 667, name: "mobile" },
      { width: 768, height: 1024, name: "tablet" },
      { width: 1920, height: 1080, name: "desktop" },
    ];

    for (const viewport of viewports) {
      await page.setViewportSize(viewport);
      const toast = page.locator(".toast").first();
      if (await toast.count() > 0) {
        await expect(toast).toHaveScreenshot(`toast-${viewport.name}.png`);
      }
    }
  });

  test("toast display with actions", async ({ page }) => {
    const toastWithActions = page.locator(".toast").filter({ hasText: "Undo" });
    if (await toastWithActions.count() > 0) {
      await expect(toastWithActions.first()).toHaveScreenshot("toast-with-actions.png");
    }
  });

  test("toast display with icons", async ({ page }) => {
    const toastWithIcons = page.locator(".toast svg");
    if (await toastWithIcons.count() > 0) {
      await expect(toastWithIcons.first().locator("..")).toHaveScreenshot("toast-with-icons.png");
    }
  });

  test("toast display stacking", async ({ page }) => {
    // Test multiple toasts stacked
    const toasts = page.locator(".toast");
    if (await toasts.count() > 1) {
      const toastContainer = page.locator(".toast").first().locator("..");
      await expect(toastContainer).toHaveScreenshot("toast-stacking.png");
    }
  });

  test("toast display animation states", async ({ page }) => {
    // Test toast appear/disappear animations if available
    const toast = page.locator(".toast").first();
    if (await toast.count() > 0) {
      await expect(toast).toBeVisible();
      await expect(toast).toHaveScreenshot("toast-visible.png");

      // Test close button if available
      const closeButton = toast.locator("button, .btn-close");
      if (await closeButton.count() > 0) {
        await closeButton.hover();
        await expect(toast).toHaveScreenshot("toast-close-hover.png");
      }
    }
  });
});
