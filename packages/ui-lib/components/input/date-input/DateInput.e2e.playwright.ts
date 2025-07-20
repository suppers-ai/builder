import { expect, test } from "@playwright/test";

test.describe("DateInput E2E Tests", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:8001/components/input/date-input");
    await page.waitForLoadState("networkidle");
  });

  test("page loads and displays date input examples", async ({ page }) => {
    // Check that the page title is correct
    await expect(page).toHaveTitle("DaisyUI Component Library - Fresh 2.0");

    // Check that the main heading is present
    await expect(page.locator("h1").first()).toContainText("Date Input");

    // Check that examples are visible
    await expect(page.locator('input[type="date"]').first()).toBeVisible();
  });

  test("navigation works correctly", async ({ page }) => {
    // Check breadcrumbs
    await expect(page.locator(".breadcrumbs")).toBeVisible();
    await expect(page.locator(".breadcrumbs")).toContainText("Home");
    await expect(page.locator(".breadcrumbs")).toContainText("Components");
    await expect(page.locator(".breadcrumbs")).toContainText("Date Input");

    // Test navigation to home via breadcrumb
    await page.click('.breadcrumbs a[href="/"]');
    await expect(page).toHaveURL("http://localhost:8001/");

    // Navigate back to date input
    await page.goBack();
    await expect(page).toHaveURL(/date-input$/);
  });

  test("date input examples render correctly", async ({ page }) => {
    // Test date inputs are rendered
    const dateInputs = page.locator('input[type="date"]');
    const inputCount = await dateInputs.count();
    expect(inputCount).toBeGreaterThanOrEqual(3);

    // Test different input sizes exist
    await expect(page.locator('.input-xs, input[type="date"].input-xs').first()).toBeVisible();
    await expect(page.locator('.input-lg, input[type="date"].input-lg').first()).toBeVisible();

    // Test input states
    await expect(page.locator('.input-bordered, input[type="date"].input-bordered').first())
      .toBeVisible();
  });

  test("date input interaction works", async ({ page }) => {
    // Find first date input
    const dateInput = page.locator('input[type="date"]').first();

    // Test focus
    await dateInput.focus();
    await expect(dateInput).toBeFocused();

    // Test typing a date
    await dateInput.fill("2024-06-15");
    const value = await dateInput.inputValue();
    expect(value).toBe("2024-06-15");

    // Test clearing the input
    await dateInput.fill("");
    const clearedValue = await dateInput.inputValue();
    expect(clearedValue).toBe("");
  });

  test("date input validation works", async ({ page }) => {
    // Look for inputs with min/max constraints
    const constrainedInputs = page.locator('input[type="date"][min], input[type="date"][max]');
    const hasConstrained = await constrainedInputs.count() > 0;

    if (hasConstrained) {
      const constrainedInput = constrainedInputs.first();

      // Get min and max values
      const minValue = await constrainedInput.getAttribute("min");
      const maxValue = await constrainedInput.getAttribute("max");

      if (minValue) {
        // Test with date before min
        await constrainedInput.fill("1900-01-01");
        const isValid = await constrainedInput.evaluate((input) => input.validity.valid);
        expect(isValid).toBe(false);
      }

      if (maxValue) {
        // Test with date after max
        await constrainedInput.fill("2100-12-31");
        const isValid = await constrainedInput.evaluate((input) => input.validity.valid);
        expect(isValid).toBe(false);
      }
    }
  });

  test("API documentation is present", async ({ page }) => {
    // Check API props table exists
    await expect(page.locator("table, .api-table")).toBeVisible();

    // Check key props are documented
    await expect(page.locator('text="value"')).toBeVisible();
    await expect(page.locator('text="min"')).toBeVisible();
    await expect(page.locator('text="max"')).toBeVisible();
    await expect(page.locator('text="required"')).toBeVisible();
  });

  test("keyboard navigation works", async ({ page }) => {
    // Focus first date input
    await page.keyboard.press("Tab");

    // Check if an input is focused
    const focusedElement = page.locator(":focus");
    await expect(focusedElement).toBeVisible();

    const tagName = await focusedElement.evaluate((el) => el.tagName.toLowerCase());
    if (tagName === "input") {
      const inputType = await focusedElement.getAttribute("type");
      if (inputType === "date") {
        // Test arrow keys for date navigation
        await page.keyboard.press("ArrowUp");
        await page.keyboard.press("ArrowDown");

        // Verify input is still focused
        await expect(focusedElement).toBeFocused();
      }
    }
  });

  test("responsive behavior on mobile", async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    // Check that page is still usable
    await expect(page.locator("h1").first()).toBeVisible();
    await expect(page.locator('input[type="date"]').first()).toBeVisible();

    // Verify responsive layout works
    await expect(page.locator("main").first()).toBeVisible();
  });

  test("page performance is acceptable", async ({ page }) => {
    // Test Core Web Vitals
    const navigationPromise = page.waitForLoadState("networkidle");
    const startTime = Date.now();

    await page.goto("http://localhost:8001/components/input/date-input");
    await navigationPromise;

    const loadTime = Date.now() - startTime;

    // Page should load within 3 seconds
    expect(loadTime).toBeLessThan(3000);
  });
});
