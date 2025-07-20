import { expect, test } from "@playwright/test";

test.describe("Range E2E Tests", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:8001/components/input/range");
    await page.waitForLoadState("networkidle");
  });

  test("page loads and displays range examples", async ({ page }) => {
    await expect(page).toHaveTitle(/Range/);
    await expect(page.locator("h1")).toContainText("Range");
    await expect(page.locator(".range").first()).toBeVisible();
  });

  test("range value can be changed", async ({ page }) => {
    const range = page.locator(".range").first();

    // Get initial value
    const initialValue = await range.inputValue();

    // Set new value
    await range.fill("75");

    // Verify value changed
    const newValue = await range.inputValue();
    expect(newValue).toBe("75");
  });

  test("range keyboard interaction", async ({ page }) => {
    const range = page.locator(".range").first();

    // Focus range
    await range.focus();
    await expect(range).toBeFocused();

    // Get initial value
    const initialValue = parseFloat(await range.inputValue());

    // Use arrow keys to change value
    await page.keyboard.press("ArrowRight");

    const newValue = parseFloat(await range.inputValue());
    expect(newValue).toBeGreaterThan(initialValue);
  });

  test("range respects min/max constraints", async ({ page }) => {
    // Create a range with specific min/max for testing
    await page.evaluate(() => {
      const range = document.createElement("input");
      range.type = "range";
      range.className = "range range-primary";
      range.min = "10";
      range.max = "90";
      range.value = "50";
      range.id = "test-range";
      document.body.appendChild(range);
    });

    const testRange = page.locator("#test-range");

    // Try to set value below min
    await testRange.fill("5");
    const minValue = await testRange.inputValue();
    expect(parseFloat(minValue)).toBeGreaterThanOrEqual(10);

    // Try to set value above max
    await testRange.fill("95");
    const maxValue = await testRange.inputValue();
    expect(parseFloat(maxValue)).toBeLessThanOrEqual(90);
  });

  test("disabled range is not interactive", async ({ page }) => {
    const disabledRange = page.locator(".range[disabled]").first();

    if (await disabledRange.count() > 0) {
      await expect(disabledRange).toBeDisabled();

      // Try to change value - should not work
      const initialValue = await disabledRange.inputValue();
      await disabledRange.fill("80");

      const newValue = await disabledRange.inputValue();
      expect(newValue).toBe(initialValue);
    }
  });

  test("range step attribute works", async ({ page }) => {
    // Create a range with specific step for testing
    await page.evaluate(() => {
      const range = document.createElement("input");
      range.type = "range";
      range.className = "range range-secondary";
      range.min = "0";
      range.max = "100";
      range.step = "10";
      range.value = "50";
      range.id = "step-range";
      document.body.appendChild(range);
    });

    const stepRange = page.locator("#step-range");

    // Use keyboard to step
    await stepRange.focus();
    await page.keyboard.press("ArrowRight");

    const value = parseFloat(await stepRange.inputValue());
    expect(value % 10).toBe(0); // Should be divisible by step
  });

  test("range accessibility attributes", async ({ page }) => {
    const ranges = page.locator(".range");
    const rangeCount = await ranges.count();

    for (let i = 0; i < Math.min(rangeCount, 3); i++) {
      const range = ranges.nth(i);

      // Check attributes
      const min = await range.getAttribute("min");
      const max = await range.getAttribute("max");
      const value = await range.getAttribute("value");

      expect(min).toBeTruthy();
      expect(max).toBeTruthy();
      expect(value).toBeTruthy();

      // Check aria attributes if present
      const ariaValueNow = await range.getAttribute("aria-valuenow");
      const ariaValueMin = await range.getAttribute("aria-valuemin");
      const ariaValueMax = await range.getAttribute("aria-valuemax");

      if (ariaValueNow) {
        expect(parseFloat(ariaValueNow)).toBeGreaterThanOrEqual(
          parseFloat(ariaValueMin || min || "0"),
        );
        expect(parseFloat(ariaValueNow)).toBeLessThanOrEqual(
          parseFloat(ariaValueMax || max || "100"),
        );
      }
    }
  });

  test("API documentation is present", async ({ page }) => {
    await expect(page.locator("table, .api-table")).toBeVisible();
    await expect(page.locator('text="min"')).toBeVisible();
    await expect(page.locator('text="max"')).toBeVisible();
    await expect(page.locator('text="value"')).toBeVisible();
    await expect(page.locator('text="step"')).toBeVisible();
  });
});
