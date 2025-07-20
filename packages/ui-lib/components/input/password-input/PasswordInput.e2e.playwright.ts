import { expect, test } from "@playwright/test";

test.describe("PasswordInput E2E Tests", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:8001/components/input/password-input");
    await page.waitForLoadState("networkidle");
  });

  test("page loads and displays password input examples", async ({ page }) => {
    await expect(page).toHaveTitle("DaisyUI Component Library - Fresh 2.0");
    await expect(page.locator("h1").first()).toContainText("Password Input");
    await expect(page.locator('input[type="password"]').first()).toBeVisible();
  });

  test("navigation works correctly", async ({ page }) => {
    await expect(page.locator(".breadcrumbs")).toBeVisible();
    await expect(page.locator(".breadcrumbs")).toContainText("Home");
    await expect(page.locator(".breadcrumbs")).toContainText("Components");
    await expect(page.locator(".breadcrumbs")).toContainText("Password Input");

    await page.click('.breadcrumbs a[href="/"]');
    await expect(page).toHaveURL("http://localhost:8001/");

    await page.goBack();
    await expect(page).toHaveURL(/password-input$/);
  });

  test("password input examples render correctly", async ({ page }) => {
    const passwordInputs = page.locator('input[type="password"]');
    const inputCount = await passwordInputs.count();
    expect(inputCount).toBeGreaterThanOrEqual(3);

    await expect(page.locator('.input-xs, input[type="password"].input-xs').first()).toBeVisible();
    await expect(page.locator('.input-lg, input[type="password"].input-lg').first()).toBeVisible();
    await expect(page.locator('.input-bordered, input[type="password"].input-bordered').first())
      .toBeVisible();
  });

  test("password input interaction works", async ({ page }) => {
    const passwordInput = page.locator('input[type="password"]').first();

    await passwordInput.focus();
    await expect(passwordInput).toBeFocused();

    await passwordInput.fill("secretpassword");
    const value = await passwordInput.inputValue();
    expect(value).toBe("secretpassword");

    await passwordInput.clear();
    const clearedValue = await passwordInput.inputValue();
    expect(clearedValue).toBe("");
  });

  test("password input masks characters", async ({ page }) => {
    const passwordInput = page.locator('input[type="password"]').first();

    await passwordInput.fill("secretpassword");

    // Check that the input type is still password (characters should be masked)
    const inputType = await passwordInput.getAttribute("type");
    expect(inputType).toBe("password");

    // Check that the value is stored correctly (even though displayed as dots)
    const actualValue = await passwordInput.inputValue();
    expect(actualValue).toBe("secretpassword");
  });

  test("password visibility toggle works", async ({ page }) => {
    const toggleButtons = page.locator(
      'button:has-text("Show"), button:has-text("Hide"), .password-toggle',
    );
    const hasToggle = await toggleButtons.count() > 0;

    if (hasToggle) {
      const passwordInput = page.locator('input[type="password"]').first();
      const toggleButton = toggleButtons.first();

      await passwordInput.fill("testpassword");

      // Initially should be password type
      let inputType = await passwordInput.getAttribute("type");
      expect(inputType).toBe("password");

      // Click toggle to show password
      await toggleButton.click();

      // Should now be text type (visible)
      inputType = await passwordInput.getAttribute("type");
      expect(inputType).toBe("text");

      // Click again to hide
      await toggleButton.click();

      // Should be password type again
      inputType = await passwordInput.getAttribute("type");
      expect(inputType).toBe("password");
    }
  });

  test("password input validation works", async ({ page }) => {
    const requiredInputs = page.locator('input[type="password"][required]');
    const hasRequired = await requiredInputs.count() > 0;

    if (hasRequired) {
      const requiredInput = requiredInputs.first();

      // Clear the input and check validation
      await requiredInput.focus();
      await requiredInput.clear();

      // Trigger validation by focusing out
      await page.keyboard.press("Tab");

      const isValid = await requiredInput.evaluate((input) => input.validity.valid);
      expect(isValid).toBe(false);
    }
  });

  test("password input pattern validation works", async ({ page }) => {
    const patternInputs = page.locator('input[type="password"][pattern]');
    const hasPattern = await patternInputs.count() > 0;

    if (hasPattern) {
      const patternInput = patternInputs.first();
      const pattern = await patternInput.getAttribute("pattern");

      // Test with invalid pattern
      await patternInput.fill("weak");

      const isValid = await patternInput.evaluate((input) => input.validity.valid);
      expect(isValid).toBe(false);
    }
  });

  test("password input autocomplete behavior", async ({ page }) => {
    const autocompleteInputs = page.locator('input[type="password"][autocomplete]');
    const hasAutocomplete = await autocompleteInputs.count() > 0;

    if (hasAutocomplete) {
      const autocompleteInput = autocompleteInputs.first();
      const autocompleteValue = await autocompleteInput.getAttribute("autocomplete");

      // Common password autocomplete values
      expect(["current-password", "new-password", "off"]).toContain(autocompleteValue);
    }
  });

  test("API documentation is present", async ({ page }) => {
    await expect(page.locator("table, .api-table")).toBeVisible();
    await expect(page.locator('text="placeholder"')).toBeVisible();
    await expect(page.locator('text="required"')).toBeVisible();
    await expect(page.locator('text="minlength"')).toBeVisible();
    await expect(page.locator('text="pattern"')).toBeVisible();
  });

  test("keyboard navigation works", async ({ page }) => {
    await page.keyboard.press("Tab");

    const focusedElement = page.locator(":focus");
    await expect(focusedElement).toBeVisible();

    const tagName = await focusedElement.evaluate((el) => el.tagName.toLowerCase());
    if (tagName === "input") {
      const inputType = await focusedElement.getAttribute("type");
      if (inputType === "password") {
        // Type password
        await page.keyboard.type("secretpassword");

        // Select all text
        await page.keyboard.press("Control+a");

        // Verify text is selected (even though masked)
        const value = await focusedElement.inputValue();
        expect(value).toBe("secretpassword");
      }
    }
  });

  test("copy paste functionality works", async ({ page }) => {
    const passwordInput = page.locator('input[type="password"]').first();

    await passwordInput.focus();
    await passwordInput.fill("copypassword");

    // Select all text
    await page.keyboard.press("Control+a");

    // Copy text
    await page.keyboard.press("Control+c");

    // Clear input
    await passwordInput.clear();

    // Paste text
    await page.keyboard.press("Control+v");

    const pastedValue = await passwordInput.inputValue();
    expect(pastedValue).toBe("copypassword");
  });

  test("responsive behavior on mobile", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });

    await expect(page.locator("h1").first()).toBeVisible();
    await expect(page.locator('input[type="password"]').first()).toBeVisible();
    await expect(page.locator("main").first()).toBeVisible();
  });

  test("page performance is acceptable", async ({ page }) => {
    const navigationPromise = page.waitForLoadState("networkidle");
    const startTime = Date.now();

    await page.goto("http://localhost:8001/components/input/password-input");
    await navigationPromise;

    const loadTime = Date.now() - startTime;
    expect(loadTime).toBeLessThan(3000);
  });
});
