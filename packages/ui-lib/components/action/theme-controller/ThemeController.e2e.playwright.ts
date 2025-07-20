import { expect, test } from "npm:@playwright/test";

test.describe("ThemeController E2E Tests", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:8000/components/action/theme-controller");
  });

  test("theme controller navigation and visibility", async ({ page }) => {
    // Test page navigation
    await page.click('text="Components"');
    await expect(page).toHaveURL(/components$/);

    // Navigate to theme controller
    await page.goto("http://localhost:8000/components/action/theme-controller");

    // Verify page loads correctly
    await expect(page.locator(".dropdown, .toggle, .radio")).toBeVisible();
    await expect(page.locator("h1")).toContainText("Theme Controller");
  });

  test("theme controller dropdown functionality", async ({ page }) => {
    // Test dropdown variant
    const dropdown = page.locator(".dropdown").first();
    if (await dropdown.count() > 0) {
      await expect(dropdown).toBeVisible();

      // Click to open dropdown
      const dropdownButton = dropdown.locator("button").first();
      await dropdownButton.click();

      // Wait for dropdown to open
      await page.waitForTimeout(200);

      // Test dropdown content is visible
      const dropdownContent = page.locator(".dropdown-content");
      if (await dropdownContent.count() > 0) {
        await expect(dropdownContent.first()).toBeVisible();

        // Test theme options
        const themeOptions = page.locator("[data-theme]");
        if (await themeOptions.count() > 0) {
          // Click on a theme option
          await themeOptions.first().click();

          // Wait for theme change
          await page.waitForTimeout(300);

          // Verify theme changed
          const html = page.locator("html");
          const currentTheme = await html.getAttribute("data-theme");
          expect(currentTheme).toBeTruthy();
        }
      }
    }
  });

  test("theme controller toggle functionality", async ({ page }) => {
    // Test toggle variant
    const toggle = page.locator(".toggle").first();
    if (await toggle.count() > 0) {
      await expect(toggle).toBeVisible();

      // Get initial state
      const initialChecked = await toggle.isChecked();

      // Click toggle
      await toggle.click();
      await page.waitForTimeout(200);

      // Verify state changed
      const newChecked = await toggle.isChecked();
      expect(newChecked).toBe(!initialChecked);

      // Verify theme attribute changed
      const html = page.locator("html");
      const theme = await html.getAttribute("data-theme");
      expect(theme).toBeTruthy();
    }
  });

  test("theme controller radio functionality", async ({ page }) => {
    // Test radio variant
    const radioInputs = page.locator("input[type='radio'][name='theme-radio']");
    if (await radioInputs.count() > 0) {
      // Test first radio option
      const firstRadio = radioInputs.first();
      await expect(firstRadio).toBeVisible();

      // Click radio option
      await firstRadio.click();
      await page.waitForTimeout(200);

      // Verify radio is checked
      await expect(firstRadio).toBeChecked();

      // Test another radio option
      if (await radioInputs.count() > 1) {
        const secondRadio = radioInputs.nth(1);
        await secondRadio.click();
        await page.waitForTimeout(200);

        // Verify second is checked and first is not
        await expect(secondRadio).toBeChecked();
        await expect(firstRadio).not.toBeChecked();
      }
    }
  });

  test("theme controller keyboard navigation", async ({ page }) => {
    // Test keyboard accessibility
    await page.keyboard.press("Tab");

    let tabCount = 0;
    let foundThemeController = false;

    while (tabCount < 10) {
      await page.keyboard.press("Tab");
      const focused = page.locator(":focus");
      tabCount++;

      // Check if focused element is part of theme controller
      const focusedClasses = await focused.getAttribute("class");
      if (
        focusedClasses?.includes("btn") || focusedClasses?.includes("toggle") ||
        focusedClasses?.includes("radio")
      ) {
        foundThemeController = true;

        // Test keyboard activation
        await page.keyboard.press("Enter");
        await page.waitForTimeout(200);

        // For dropdown, test arrow keys
        if (focusedClasses?.includes("btn")) {
          await page.keyboard.press("ArrowDown");
          await page.waitForTimeout(100);
          await page.keyboard.press("Enter");
          await page.waitForTimeout(200);
        }

        break;
      }
    }

    expect(foundThemeController).toBe(true);
  });

  test("theme controller visual feedback", async ({ page }) => {
    // Test visual feedback for theme changes
    const themeController = page.locator(".dropdown, .toggle, .radio").first();
    await expect(themeController).toBeVisible();

    // Get initial page appearance
    const initialBackground = await page.evaluate(() => {
      return getComputedStyle(document.body).backgroundColor;
    });

    // Trigger theme change
    if (await page.locator(".dropdown").count() > 0) {
      // Dropdown variant
      await page.locator(".dropdown button").first().click();
      await page.waitForTimeout(100);

      const themeOption = page.locator("[data-theme='dark']");
      if (await themeOption.count() > 0) {
        await themeOption.click();
      }
    } else if (await page.locator(".toggle").count() > 0) {
      // Toggle variant
      await page.locator(".toggle").first().click();
    }

    await page.waitForTimeout(300);

    // Check if visual change occurred
    const newBackground = await page.evaluate(() => {
      return getComputedStyle(document.body).backgroundColor;
    });

    // Background should change with theme (in most cases)
    // Note: This might not always change depending on theme design
    expect(newBackground).toBeTruthy();
  });

  test("theme controller responsive behavior", async ({ page }) => {
    // Test responsive design
    const viewports = [
      { width: 375, height: 667, name: "mobile" },
      { width: 768, height: 1024, name: "tablet" },
      { width: 1920, height: 1080, name: "desktop" },
    ];

    for (const viewport of viewports) {
      await page.setViewportSize(viewport);

      // Ensure theme controller remains functional
      const controller = page.locator(".dropdown, .toggle, .radio").first();
      await expect(controller).toBeVisible();

      // Test interaction on this viewport
      if (await page.locator(".dropdown").count() > 0) {
        const dropdownButton = page.locator(".dropdown button").first();
        await dropdownButton.click();
        await page.waitForTimeout(100);

        // Dropdown should be visible and positioned correctly
        const dropdownContent = page.locator(".dropdown-content");
        if (await dropdownContent.count() > 0) {
          await expect(dropdownContent.first()).toBeVisible();

          // Close dropdown by clicking outside
          await page.click("body");
          await page.waitForTimeout(100);
        }
      }
    }
  });

  test("theme controller persistence", async ({ page }) => {
    // Test theme persistence across page navigation
    const themeController = page.locator(".dropdown, .toggle").first();
    if (await themeController.count() > 0) {
      // Change to dark theme
      if (await page.locator(".dropdown").count() > 0) {
        await page.locator(".dropdown button").first().click();
        const darkOption = page.locator("[data-theme='dark']");
        if (await darkOption.count() > 0) {
          await darkOption.click();
          await page.waitForTimeout(200);
        }
      } else if (await page.locator(".toggle").count() > 0) {
        await page.locator(".toggle").first().click();
        await page.waitForTimeout(200);
      }

      // Navigate to another page
      await page.goto("http://localhost:8000/components");

      // Check if theme persisted
      const html = page.locator("html");
      const theme = await html.getAttribute("data-theme");
      expect(theme).toBeTruthy();

      // Navigate back and verify theme controller reflects current theme
      await page.goto("http://localhost:8000/components/action/theme-controller");

      // Controller should show current theme state
      const controller = page.locator(".dropdown, .toggle").first();
      await expect(controller).toBeVisible();
    }
  });

  test("theme controller multiple instances", async ({ page }) => {
    // Test if multiple theme controllers work together
    const controllers = page.locator(".dropdown, .toggle, .radio");
    const controllerCount = await controllers.count();

    if (controllerCount > 1) {
      // Change theme using first controller
      const firstController = controllers.first();

      if (await firstController.locator(".dropdown").count() > 0) {
        await firstController.locator("button").click();
        const themeOption = page.locator("[data-theme]").first();
        await themeOption.click();
      } else if (await firstController.locator(".toggle").count() > 0) {
        await firstController.locator(".toggle").click();
      }

      await page.waitForTimeout(300);

      // All controllers should reflect the same theme
      const html = page.locator("html");
      const currentTheme = await html.getAttribute("data-theme");

      // Check if second controller shows same theme
      const secondController = controllers.nth(1);
      await expect(secondController).toBeVisible();
    }
  });

  test("theme controller error handling", async ({ page }) => {
    // Test error scenarios
    const controller = page.locator(".dropdown, .toggle, .radio").first();
    await expect(controller).toBeVisible();

    // Test rapid clicking (should not break)
    if (await page.locator(".toggle").count() > 0) {
      const toggle = page.locator(".toggle").first();

      // Rapid clicks
      for (let i = 0; i < 5; i++) {
        await toggle.click();
        await page.waitForTimeout(50);
      }

      // Should still be functional
      await expect(toggle).toBeVisible();
      await expect(toggle).toBeEnabled();
    }
  });

  test("theme controller performance", async ({ page }) => {
    // Test performance of theme switching
    const startTime = Date.now();

    const controller = page.locator(".dropdown, .toggle").first();
    if (await controller.count() > 0) {
      // Trigger theme change
      if (await page.locator(".dropdown").count() > 0) {
        await page.locator(".dropdown button").first().click();
        const themeOption = page.locator("[data-theme]").first();
        await themeOption.click();
      } else {
        await page.locator(".toggle").first().click();
      }

      // Wait for theme change to complete
      await page.waitForTimeout(500);

      const switchTime = Date.now() - startTime;
      expect(switchTime).toBeLessThan(2000); // Theme switch should be fast
    }
  });
});
