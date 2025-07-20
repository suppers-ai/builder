import { expect, test } from "@playwright/test";

test.describe("Input E2E Tests", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:8001/components/input/input");
    await page.waitForLoadState("networkidle");
  });

  test("page loads and displays input examples", async ({ page }) => {
    await expect(page).toHaveTitle("DaisyUI Component Library - Fresh 2.0");
    await expect(page.locator("h1").first()).toContainText("Input");
    await expect(page.locator('input[type="text"]').first()).toBeVisible();
  });

  test("navigation works correctly", async ({ page }) => {
    await expect(page.locator(".breadcrumbs")).toBeVisible();
    await expect(page.locator(".breadcrumbs")).toContainText("Home");
    await expect(page.locator(".breadcrumbs")).toContainText("Components");
    await expect(page.locator(".breadcrumbs")).toContainText("Input");

    await page.click('.breadcrumbs a[href="/"]');
    await expect(page).toHaveURL("http://localhost:8001/");

    await page.goBack();
    await expect(page).toHaveURL(/\/input$/);
  });

  test("input examples render correctly", async ({ page }) => {
    const textInputs = page.locator('input[type="text"], input:not([type])');
    const inputCount = await textInputs.count();
    expect(inputCount).toBeGreaterThanOrEqual(3);

    await expect(page.locator(".input-xs, input.input-xs").first()).toBeVisible();
    await expect(page.locator(".input-lg, input.input-lg").first()).toBeVisible();
    await expect(page.locator(".input-bordered, input.input-bordered").first()).toBeVisible();
  });

  test("input interaction works", async ({ page }) => {
    const textInput = page.locator('input[type="text"]').first();

    await textInput.focus();
    await expect(textInput).toBeFocused();

    await textInput.fill("Hello World");
    const value = await textInput.inputValue();
    expect(value).toBe("Hello World");

    await textInput.clear();
    const clearedValue = await textInput.inputValue();
    expect(clearedValue).toBe("");
  });

  test("input placeholder works", async ({ page }) => {
    const placeholderInputs = page.locator("input[placeholder]");
    const hasPlaceholder = await placeholderInputs.count() > 0;

    if (hasPlaceholder) {
      const placeholderInput = placeholderInputs.first();
      const placeholderText = await placeholderInput.getAttribute("placeholder");
      expect(placeholderText).toBeTruthy();
    }
  });

  test("input validation states work", async ({ page }) => {
    const requiredInputs = page.locator("input[required]");
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

  test("disabled inputs cannot be interacted with", async ({ page }) => {
    const disabledInputs = page.locator("input[disabled]");
    const hasDisabled = await disabledInputs.count() > 0;

    if (hasDisabled) {
      const disabledInput = disabledInputs.first();

      // Try to focus disabled input
      await disabledInput.click();
      const isFocused = await disabledInput.evaluate((input) => document.activeElement === input);
      expect(isFocused).toBe(false);
    }
  });

  test("API documentation is present", async ({ page }) => {
    await expect(page.locator("table, .api-table")).toBeVisible();
    await expect(page.locator('text="placeholder"')).toBeVisible();
    await expect(page.locator('text="value"')).toBeVisible();
    await expect(page.locator('text="disabled"')).toBeVisible();
    await expect(page.locator('text="required"')).toBeVisible();
  });

  test("keyboard navigation works", async ({ page }) => {
    await page.keyboard.press("Tab");

    const focusedElement = page.locator(":focus");
    await expect(focusedElement).toBeVisible();

    const tagName = await focusedElement.evaluate((el) => el.tagName.toLowerCase());
    if (tagName === "input") {
      // Type some text
      await page.keyboard.type("Test text");

      // Select all text
      await page.keyboard.press("Control+a");

      // Verify text is selected
      const selectedText = await focusedElement.evaluate((input) => {
        return input.value.substring(input.selectionStart, input.selectionEnd);
      });
      expect(selectedText).toBe("Test text");
    }
  });

  test("responsive behavior on mobile", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });

    await expect(page.locator("h1").first()).toBeVisible();
    await expect(page.locator('input[type="text"]').first()).toBeVisible();
    await expect(page.locator("main").first()).toBeVisible();
  });

  test("copy paste functionality works", async ({ page }) => {
    const textInput = page.locator('input[type="text"]').first();

    await textInput.focus();
    await textInput.fill("Copy this text");

    // Select all text
    await page.keyboard.press("Control+a");

    // Copy text
    await page.keyboard.press("Control+c");

    // Clear input
    await textInput.clear();

    // Paste text
    await page.keyboard.press("Control+v");

    const pastedValue = await textInput.inputValue();
    expect(pastedValue).toBe("Copy this text");
  });

  test("page performance is acceptable", async ({ page }) => {
    const navigationPromise = page.waitForLoadState("networkidle");
    const startTime = Date.now();

    await page.goto("http://localhost:8001/components/input/input");
    await navigationPromise;

    const loadTime = Date.now() - startTime;
    expect(loadTime).toBeLessThan(3000);
  });
});
