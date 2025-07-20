import { expect, test } from "@playwright/test";

test.describe("NumberInput E2E Tests", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:8001/components/input/number-input");
    await page.waitForLoadState("networkidle");
  });

  test("page loads and displays number input examples", async ({ page }) => {
    await expect(page).toHaveTitle("DaisyUI Component Library - Fresh 2.0");
    await expect(page.locator("h1").first()).toContainText("Number Input");
    await expect(page.locator('input[type="number"]').first()).toBeVisible();
  });

  test("navigation works correctly", async ({ page }) => {
    await expect(page.locator(".breadcrumbs")).toBeVisible();
    await expect(page.locator(".breadcrumbs")).toContainText("Home");
    await expect(page.locator(".breadcrumbs")).toContainText("Components");
    await expect(page.locator(".breadcrumbs")).toContainText("Number Input");

    await page.click('.breadcrumbs a[href="/"]');
    await expect(page).toHaveURL("http://localhost:8001/");

    await page.goBack();
    await expect(page).toHaveURL(/number-input$/);
  });

  test("number input examples render correctly", async ({ page }) => {
    const numberInputs = page.locator('input[type="number"]');
    const inputCount = await numberInputs.count();
    expect(inputCount).toBeGreaterThanOrEqual(3);

    await expect(page.locator('.input-xs, input[type="number"].input-xs').first()).toBeVisible();
    await expect(page.locator('.input-lg, input[type="number"].input-lg').first()).toBeVisible();
    await expect(page.locator('.input-bordered, input[type="number"].input-bordered').first())
      .toBeVisible();
  });

  test("number input interaction works", async ({ page }) => {
    const numberInput = page.locator('input[type="number"]').first();

    await numberInput.focus();
    await expect(numberInput).toBeFocused();

    await numberInput.fill("42");
    const value = await numberInput.inputValue();
    expect(value).toBe("42");

    await numberInput.fill("-15.5");
    const negativeValue = await numberInput.inputValue();
    expect(negativeValue).toBe("-15.5");

    await numberInput.clear();
    const clearedValue = await numberInput.inputValue();
    expect(clearedValue).toBe("");
  });

  test("number input validation works", async ({ page }) => {
    const constrainedInputs = page.locator('input[type="number"][min], input[type="number"][max]');
    const hasConstrained = await constrainedInputs.count() > 0;

    if (hasConstrained) {
      const constrainedInput = constrainedInputs.first();

      const minValue = await constrainedInput.getAttribute("min");
      const maxValue = await constrainedInput.getAttribute("max");

      if (minValue) {
        await constrainedInput.fill("-999");
        const isValid = await constrainedInput.evaluate((input) => input.validity.valid);
        expect(isValid).toBe(false);
      }

      if (maxValue) {
        await constrainedInput.fill("999999");
        const isValid = await constrainedInput.evaluate((input) => input.validity.valid);
        expect(isValid).toBe(false);
      }
    }
  });

  test("number input step attribute works", async ({ page }) => {
    const stepInputs = page.locator('input[type="number"][step]');
    const hasStep = await stepInputs.count() > 0;

    if (hasStep) {
      const stepInput = stepInputs.first();
      const stepValue = await stepInput.getAttribute("step");
      expect(stepValue).toBeTruthy();

      // Test step validation
      if (stepValue === "10") {
        await stepInput.fill("15");
        const isValid = await stepInput.evaluate((input) => input.validity.valid);
        expect(isValid).toBe(false);
      }
    }
  });

  test("number input spinner controls work", async ({ page }) => {
    const numberInput = page.locator('input[type="number"]').first();

    await numberInput.fill("10");

    // Test arrow up (increase)
    await numberInput.focus();
    await page.keyboard.press("ArrowUp");

    const increasedValue = await numberInput.inputValue();
    expect(parseInt(increasedValue)).toBeGreaterThan(10);

    // Test arrow down (decrease)
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("ArrowDown");

    const decreasedValue = await numberInput.inputValue();
    expect(parseInt(decreasedValue)).toBeLessThan(parseInt(increasedValue));
  });

  test("number input only accepts numeric input", async ({ page }) => {
    const numberInput = page.locator('input[type="number"]').first();

    await numberInput.focus();
    await numberInput.fill("abc123def");

    // Should only keep the numeric part
    const value = await numberInput.inputValue();
    expect(value).toMatch(/^-?\d*\.?\d*$/);
  });

  test("API documentation is present", async ({ page }) => {
    await expect(page.locator("table, .api-table")).toBeVisible();
    await expect(page.locator('text="min"')).toBeVisible();
    await expect(page.locator('text="max"')).toBeVisible();
    await expect(page.locator('text="step"')).toBeVisible();
    await expect(page.locator('text="value"')).toBeVisible();
  });

  test("keyboard navigation works", async ({ page }) => {
    await page.keyboard.press("Tab");

    const focusedElement = page.locator(":focus");
    await expect(focusedElement).toBeVisible();

    const tagName = await focusedElement.evaluate((el) => el.tagName.toLowerCase());
    if (tagName === "input") {
      const inputType = await focusedElement.getAttribute("type");
      if (inputType === "number") {
        // Test numeric keypad
        await page.keyboard.type("123");

        const typedValue = await focusedElement.inputValue();
        expect(typedValue).toBe("123");
      }
    }
  });

  test("responsive behavior on mobile", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });

    await expect(page.locator("h1").first()).toBeVisible();
    await expect(page.locator('input[type="number"]').first()).toBeVisible();
    await expect(page.locator("main").first()).toBeVisible();
  });

  test("page performance is acceptable", async ({ page }) => {
    const navigationPromise = page.waitForLoadState("networkidle");
    const startTime = Date.now();

    await page.goto("http://localhost:8001/components/input/number-input");
    await navigationPromise;

    const loadTime = Date.now() - startTime;
    expect(loadTime).toBeLessThan(3000);
  });
});
