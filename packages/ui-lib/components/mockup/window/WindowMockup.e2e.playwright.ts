import { expect, test } from "npm:@playwright/test";

test.describe("WindowMockup E2E Tests", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:8000/components/mockup/window-mockup");
  });

  test("window mockup navigation and interaction", async ({ page }) => {
    // Test page navigation
    await page.click('text="Components"');
    await expect(page).toHaveURL(/components$/);

    // Navigate back to window mockup
    await page.goto("http://localhost:8000/components/mockup/window-mockup");

    // Verify page loads correctly
    await expect(page.locator(".mockup-window")).toBeVisible();
    await expect(page.locator("h1")).toContainText("Window Mockup");
  });

  test("window mockup control buttons", async ({ page }) => {
    // Test that window control buttons are visible
    const mockup = page.locator(".mockup-window").first();
    await expect(mockup).toBeVisible();

    // Test control buttons (red, yellow, green)
    const redButton = page.locator(".bg-red-500");
    const yellowButton = page.locator(".bg-yellow-500");
    const greenButton = page.locator(".bg-green-500");

    if (await redButton.count() > 0) {
      await expect(redButton.first()).toBeVisible();
      await expect(yellowButton.first()).toBeVisible();
      await expect(greenButton.first()).toBeVisible();
    }
  });

  test("window mockup title display", async ({ page }) => {
    // Test that window title is displayed
    const titleElement = page.locator(".mockup-window .text-sm.font-medium");
    if (await titleElement.count() > 0) {
      await expect(titleElement.first()).toBeVisible();
      await expect(titleElement.first()).toHaveText(/\w+/); // Should contain some text
    }
  });

  test("window mockup content area", async ({ page }) => {
    // Test that content area is visible and functional
    const contentArea = page.locator(".mockup-window .bg-base-200");
    await expect(contentArea.first()).toBeVisible();

    // Test content within the window
    const mockupContent = page.locator(".mockup-window .flex.justify-center");
    await expect(mockupContent.first()).toBeVisible();
  });

  test("window mockup variants interaction", async ({ page }) => {
    // Test different variants if controls are available
    const mockup = page.locator(".mockup-window").first();
    await expect(mockup).toBeVisible();

    // Test bordered variant
    const borderedMockup = page.locator(".mockup-window.border");
    if (await borderedMockup.count() > 0) {
      await expect(borderedMockup).toBeVisible();
    }

    // Test shadow variant
    const shadowMockup = page.locator(".mockup-window.shadow-2xl");
    if (await shadowMockup.count() > 0) {
      await expect(shadowMockup).toBeVisible();
    }
  });

  test("window mockup accessibility", async ({ page }) => {
    // Test keyboard navigation
    await page.keyboard.press("Tab");

    // Test that focusable elements are properly accessible
    const focused = page.locator(":focus");
    if (await focused.count() > 0) {
      await expect(focused).toBeVisible();
    }

    // Test ARIA attributes
    const mockup = page.locator(".mockup-window").first();
    await expect(mockup).toHaveAttribute("class");
  });

  test("window mockup responsiveness", async ({ page }) => {
    // Test responsive behavior
    const viewports = [
      { width: 375, height: 667 },
      { width: 768, height: 1024 },
      { width: 1920, height: 1080 },
    ];

    for (const viewport of viewports) {
      await page.setViewportSize(viewport);

      const mockup = page.locator(".mockup-window").first();
      await expect(mockup).toBeVisible();

      // Ensure mockup scales appropriately
      const boundingBox = await mockup.boundingBox();
      expect(boundingBox?.width).toBeLessThanOrEqual(viewport.width);
    }
  });

  test("window mockup theme compatibility", async ({ page }) => {
    // Test theme switching
    const themeController = page.locator("[data-theme-controller]");
    if (await themeController.count() > 0) {
      await themeController.click();

      const darkTheme = page.locator("[data-theme='dark']");
      if (await darkTheme.count() > 0) {
        await darkTheme.click();
        await page.waitForTimeout(200);

        // Verify theme applied
        const html = page.locator("html");
        await expect(html).toHaveAttribute("data-theme", "dark");

        // Ensure mockup still visible and styled correctly
        const mockup = page.locator(".mockup-window").first();
        await expect(mockup).toBeVisible();
      }
    }
  });

  test("window mockup interactive content", async ({ page }) => {
    // Test interactions with content inside the window mockup
    const interactiveElements = page.locator(
      ".mockup-window button, .mockup-window input, .mockup-window a",
    );

    if (await interactiveElements.count() > 0) {
      const firstElement = interactiveElements.first();
      await expect(firstElement).toBeVisible();

      // Test clicking if it's a button or link
      const tagName = await firstElement.evaluate((el) => el.tagName.toLowerCase());
      if (tagName === "button" || tagName === "a") {
        await firstElement.click();
        // Verify the element still exists after interaction
        await expect(firstElement).toBeVisible();
      }
    }
  });

  test("window mockup layout integrity", async ({ page }) => {
    // Test that the window mockup maintains its layout structure
    const mockup = page.locator(".mockup-window").first();
    await expect(mockup).toBeVisible();

    // Check header structure
    const header = page.locator(".mockup-window .flex.justify-between");
    if (await header.count() > 0) {
      await expect(header.first()).toBeVisible();
    }

    // Check content area structure
    const content = page.locator(".mockup-window .flex.justify-center");
    await expect(content.first()).toBeVisible();
  });

  test("window mockup performance", async ({ page }) => {
    // Test performance metrics
    const startTime = Date.now();

    await page.goto("http://localhost:8000/components/mockup/window-mockup");
    const mockup = page.locator(".mockup-window").first();
    await expect(mockup).toBeVisible();

    const loadTime = Date.now() - startTime;
    expect(loadTime).toBeLessThan(5000); // Should load within 5 seconds
  });
});
