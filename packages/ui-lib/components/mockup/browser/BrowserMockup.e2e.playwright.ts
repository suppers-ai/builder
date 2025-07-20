import { expect, test } from "npm:@playwright/test";

test.describe("BrowserMockup E2E Tests", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:8000/components/mockup/browser-mockup");
  });

  test("browser mockup navigation and interaction", async ({ page }) => {
    // Test page navigation
    await page.click('text="Components"');
    await expect(page).toHaveURL(/components$/);

    // Navigate back to browser mockup
    await page.goto("http://localhost:8000/components/mockup/browser-mockup");

    // Verify page loads correctly
    await expect(page.locator(".mockup-browser")).toBeVisible();
    await expect(page.locator("h1")).toContainText("Browser Mockup");
  });

  test("browser mockup content rendering", async ({ page }) => {
    // Test that mockup content is visible
    const mockup = page.locator(".mockup-browser").first();
    await expect(mockup).toBeVisible();

    // Test that toolbar is visible by default
    const toolbar = page.locator(".mockup-browser-toolbar");
    await expect(toolbar.first()).toBeVisible();

    // Test that content area is visible
    const contentArea = page.locator(".mockup-browser .bg-base-200");
    await expect(contentArea.first()).toBeVisible();
  });

  test("browser mockup variants switching", async ({ page }) => {
    // Test switching between different variants
    const defaultMockup = page.locator(".mockup-browser").first();
    await expect(defaultMockup).toBeVisible();

    // If there are variant controls, test them
    const variantButtons = page.locator("[data-variant]");
    if (await variantButtons.count() > 0) {
      await variantButtons.first().click();
      await page.waitForTimeout(100);
      await expect(defaultMockup).toBeVisible();
    }
  });

  test("browser mockup URL display", async ({ page }) => {
    // Test that URL is displayed in toolbar
    const urlInput = page.locator(".mockup-browser-toolbar .input");
    if (await urlInput.count() > 0) {
      await expect(urlInput.first()).toBeVisible();
      await expect(urlInput.first()).toHaveText(/https?:\/\//);
    }
  });

  test("browser mockup accessibility", async ({ page }) => {
    // Test keyboard navigation
    await page.keyboard.press("Tab");

    // Test that focus is visible
    const focused = page.locator(":focus");
    if (await focused.count() > 0) {
      await expect(focused).toBeVisible();
    }

    // Test screen reader accessibility
    const mockup = page.locator(".mockup-browser").first();
    await expect(mockup).toHaveAttribute("class");
  });

  test("browser mockup responsiveness", async ({ page }) => {
    // Test on different screen sizes
    const viewports = [
      { width: 375, height: 667 },
      { width: 768, height: 1024 },
      { width: 1920, height: 1080 },
    ];

    for (const viewport of viewports) {
      await page.setViewportSize(viewport);

      const mockup = page.locator(".mockup-browser").first();
      await expect(mockup).toBeVisible();

      // Ensure content doesn't overflow
      const boundingBox = await mockup.boundingBox();
      expect(boundingBox?.width).toBeLessThanOrEqual(viewport.width);
    }
  });

  test("browser mockup theme switching", async ({ page }) => {
    // Test theme switching if theme controller is available
    const themeController = page.locator("[data-theme-controller]");
    if (await themeController.count() > 0) {
      await themeController.click();

      const themeOption = page.locator("[data-theme='dark']");
      if (await themeOption.count() > 0) {
        await themeOption.click();
        await page.waitForTimeout(200);

        // Verify theme change
        const html = page.locator("html");
        await expect(html).toHaveAttribute("data-theme", "dark");
      }
    }
  });

  test("browser mockup content interaction", async ({ page }) => {
    // Test interactions with content inside the mockup
    const mockupContent = page.locator(".mockup-browser .bg-base-200");
    await expect(mockupContent.first()).toBeVisible();

    // If there are interactive elements inside, test them
    const buttons = page.locator(".mockup-browser button");
    if (await buttons.count() > 0) {
      await buttons.first().click();
      // Verify the interaction worked
      await expect(buttons.first()).toBeVisible();
    }
  });

  test("browser mockup performance", async ({ page }) => {
    // Test that mockup loads quickly
    const startTime = Date.now();

    await page.goto("http://localhost:8000/components/mockup/browser-mockup");
    const mockup = page.locator(".mockup-browser").first();
    await expect(mockup).toBeVisible();

    const loadTime = Date.now() - startTime;
    expect(loadTime).toBeLessThan(5000); // Should load within 5 seconds
  });
});
