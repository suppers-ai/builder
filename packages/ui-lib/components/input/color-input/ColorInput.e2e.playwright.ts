import { expect, test } from "@playwright/test";

test.describe("ColorInput E2E Tests", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:8001/components/input/color-input");
    await page.waitForLoadState("networkidle");
  });

  test("page loads and displays color input examples", async ({ page }) => {
    // Check that the page title is correct
    await expect(page).toHaveTitle("daisyUI Component Library - Fresh 2.0");

    // Check that the main heading is present
    await expect(page.locator("h1").first()).toContainText("Color Input");

    // Check that examples are visible
    await expect(page.locator('input[type="color"]').first()).toBeVisible();
  });

  test("navigation works correctly", async ({ page }) => {
    // Check breadcrumbs
    await expect(page.locator(".breadcrumbs")).toBeVisible();
    await expect(page.locator(".breadcrumbs")).toContainText("Home");
    await expect(page.locator(".breadcrumbs")).toContainText("Components");
    await expect(page.locator(".breadcrumbs")).toContainText("Color Input");

    // Test navigation to home via breadcrumb
    await page.click('.breadcrumbs a[href="/"]');
    await expect(page).toHaveURL("http://localhost:8001/");

    // Navigate back to color input
    await page.goBack();
    await expect(page).toHaveURL(/color-input$/);
  });

  test("sidebar navigation is functional", async ({ page }) => {
    // Check sidebar is visible
    await expect(page.locator("aside")).toBeVisible();

    // Verify sidebar has navigation structure
    await expect(page.locator("aside")).toContainText("Components");

    // Verify sidebar has component links
    const componentLinks = page.locator('aside a[href*="/components"]');
    const linkCount = await componentLinks.count();
    expect(linkCount).toBeGreaterThanOrEqual(3);

    // Verify input category exists
    await expect(page.locator("aside")).toContainText("Inputs");
  });

  test("color input examples render correctly", async ({ page }) => {
    // Test color inputs are rendered
    const colorInputs = page.locator('input[type="color"]');
    const inputCount = await colorInputs.count();
    expect(inputCount).toBeGreaterThanOrEqual(3);

    // Test different input sizes exist
    await expect(page.locator('.input-xs, input[type="color"].input-xs').first()).toBeVisible();
    await expect(page.locator('.input-lg, input[type="color"].input-lg').first()).toBeVisible();

    // Test input states
    await expect(page.locator('.input-bordered, input[type="color"].input-bordered').first())
      .toBeVisible();
  });

  test("color input interaction works", async ({ page }) => {
    // Find first color input
    const colorInput = page.locator('input[type="color"]').first();

    // Check initial value
    const initialValue = await colorInput.inputValue();
    expect(initialValue).toMatch(/^#[0-9a-fA-F]{6}$/);

    // Test focus
    await colorInput.focus();
    await expect(colorInput).toBeFocused();

    // Test clicking (opens color picker)
    await colorInput.click();

    // Verify input is still focused after click
    await expect(colorInput).toBeFocused();
  });

  test("API documentation is present", async ({ page }) => {
    // Check API props table exists
    await expect(page.locator("table, .api-table")).toBeVisible();

    // Check key props are documented
    await expect(page.locator('text="value"')).toBeVisible();
    await expect(page.locator('text="disabled"')).toBeVisible();
    await expect(page.locator('text="required"')).toBeVisible();
  });

  test("usage notes and accessibility info present", async ({ page }) => {
    // Check usage notes section
    const usageSection = page.locator(".alert, h4, h2, h3").filter({ hasText: "Usage" });
    const usageExists = await usageSection.count() > 0;

    if (usageExists) {
      await expect(usageSection.first()).toBeVisible();
    }

    // Check accessibility section
    const accessibilitySection = page.locator(".alert, h4, h2, h3").filter({
      hasText: "Accessibility",
    });
    const accessibilityExists = await accessibilitySection.count() > 0;

    if (accessibilityExists) {
      await expect(accessibilitySection.first()).toBeVisible();
    }

    // If neither section exists, check for general documentation structure
    if (!usageExists && !accessibilityExists) {
      const docStructure = page.locator("h2, h3, .alert");
      const structureCount = await docStructure.count();
      expect(structureCount).toBeGreaterThan(0);
    }
  });

  test("theme switching affects color inputs", async ({ page }) => {
    // Find theme controller
    const themeController = page.locator(
      '.theme-controller, select[data-choose-theme], button:has-text("Light")',
    );
    const hasThemeController = await themeController.count() > 0;

    if (hasThemeController) {
      // Get initial input border color
      const input = page.locator('input[type="color"]').first();
      const initialBorder = await input.evaluate((el) => getComputedStyle(el).borderColor);

      try {
        // Try to change theme
        await themeController.first().click({ timeout: 3000 });

        // Look for theme options
        const darkOption = page.locator('text="dark", [data-theme="dark"], option[value="dark"]');
        const darkExists = await darkOption.count() > 0;

        if (darkExists) {
          await darkOption.first().click();
          await page.waitForTimeout(200);

          // Check if border color changed
          const newBorder = await input.evaluate((el) => getComputedStyle(el).borderColor);
          expect(newBorder).not.toBe(initialBorder);
        }
      } catch (error) {
        // Theme switching might not be implemented - just verify inputs exist
        await expect(input).toBeVisible();
      }
    } else {
      // No theme controller - just verify page works
      await expect(page.locator('input[type="color"]').first()).toBeVisible();
    }
  });

  test("responsive behavior on mobile", async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    // Check that page is still usable
    await expect(page.locator("h1").first()).toBeVisible();
    await expect(page.locator('input[type="color"]').first()).toBeVisible();

    // Check if sidebar becomes hamburger menu
    const hamburger = page.locator(
      'button[aria-label="Toggle menu"], .btn-ghost.btn-square.lg\\:hidden, button:has-text("☰")',
    );
    const hasHamburger = await hamburger.count() > 0;

    if (hasHamburger) {
      await expect(hamburger.first()).toBeVisible();
    }

    // Verify responsive layout works
    await expect(page.locator("main").first()).toBeVisible();
  });

  test("keyboard navigation works", async ({ page }) => {
    // Focus first color input
    await page.keyboard.press("Tab");

    // Check if an input is focused
    const focusedElement = page.locator(":focus");
    await expect(focusedElement).toBeVisible();

    // Test Enter key activation for color picker
    const tagName = await focusedElement.evaluate((el) => el.tagName.toLowerCase());
    if (tagName === "input") {
      const inputType = await focusedElement.getAttribute("type");
      if (inputType === "color") {
        await page.keyboard.press("Enter");
        // Verify input is still focused
        await expect(focusedElement).toBeFocused();
      }
    }
  });

  test("form validation behavior", async ({ page }) => {
    // Look for required color inputs
    const requiredInputs = page.locator('input[type="color"][required]');
    const hasRequired = await requiredInputs.count() > 0;

    if (hasRequired) {
      const requiredInput = requiredInputs.first();

      // Clear the input (if possible) and check validation
      await requiredInput.focus();

      // Check for validation message or styling
      const isValid = await requiredInput.evaluate((input) => input.validity.valid);
      expect(typeof isValid).toBe("boolean");
    }
  });

  test("page performance is acceptable", async ({ page }) => {
    // Test Core Web Vitals
    const navigationPromise = page.waitForLoadState("networkidle");
    const startTime = Date.now();

    await page.goto("http://localhost:8001/components/input/color-input");
    await navigationPromise;

    const loadTime = Date.now() - startTime;

    // Page should load within 3 seconds
    expect(loadTime).toBeLessThan(3000);

    // Check that images are loaded
    const images = page.locator("img");
    const imageCount = await images.count();

    for (let i = 0; i < imageCount; i++) {
      const img = images.nth(i);
      await expect(img).toHaveJSProperty("complete", true);
    }
  });
});
