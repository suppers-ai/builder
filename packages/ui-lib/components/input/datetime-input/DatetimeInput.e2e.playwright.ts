import { expect, test } from "@playwright/test";

test.describe("DatetimeInput E2E Tests", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:8001/components/input/datetime-input");
    await page.waitForLoadState("networkidle");
  });

  test("page loads and displays datetime input examples", async ({ page }) => {
    await expect(page).toHaveTitle("daisyUI Component Library - Fresh 2.0");
    await expect(page.locator("h1").first()).toContainText("Datetime Input");
    await expect(page.locator('input[type="datetime-local"]').first()).toBeVisible();
  });

  test("navigation works correctly", async ({ page }) => {
    await expect(page.locator(".breadcrumbs")).toBeVisible();
    await expect(page.locator(".breadcrumbs")).toContainText("Home");
    await expect(page.locator(".breadcrumbs")).toContainText("Components");
    await expect(page.locator(".breadcrumbs")).toContainText("Datetime Input");

    await page.click('.breadcrumbs a[href="/"]');
    await expect(page).toHaveURL("http://localhost:8001/");

    await page.goBack();
    await expect(page).toHaveURL(/datetime-input$/);
  });

  test("datetime input examples render correctly", async ({ page }) => {
    const datetimeInputs = page.locator('input[type="datetime-local"]');
    const inputCount = await datetimeInputs.count();
    expect(inputCount).toBeGreaterThanOrEqual(3);

    await expect(page.locator('.input-xs, input[type="datetime-local"].input-xs').first())
      .toBeVisible();
    await expect(page.locator('.input-lg, input[type="datetime-local"].input-lg').first())
      .toBeVisible();
    await expect(
      page.locator('.input-bordered, input[type="datetime-local"].input-bordered').first(),
    ).toBeVisible();
  });

  test("datetime input interaction works", async ({ page }) => {
    const datetimeInput = page.locator('input[type="datetime-local"]').first();

    await datetimeInput.focus();
    await expect(datetimeInput).toBeFocused();

    await datetimeInput.fill("2024-06-15T14:30");
    const value = await datetimeInput.inputValue();
    expect(value).toBe("2024-06-15T14:30");

    await datetimeInput.fill("");
    const clearedValue = await datetimeInput.inputValue();
    expect(clearedValue).toBe("");
  });

  test("datetime input validation works", async ({ page }) => {
    const constrainedInputs = page.locator(
      'input[type="datetime-local"][min], input[type="datetime-local"][max]',
    );
    const hasConstrained = await constrainedInputs.count() > 0;

    if (hasConstrained) {
      const constrainedInput = constrainedInputs.first();

      const minValue = await constrainedInput.getAttribute("min");
      const maxValue = await constrainedInput.getAttribute("max");

      if (minValue) {
        await constrainedInput.fill("1900-01-01T00:00");
        const isValid = await constrainedInput.evaluate((input) => input.validity.valid);
        expect(isValid).toBe(false);
      }

      if (maxValue) {
        await constrainedInput.fill("2100-12-31T23:59");
        const isValid = await constrainedInput.evaluate((input) => input.validity.valid);
        expect(isValid).toBe(false);
      }
    }
  });

  test("API documentation is present", async ({ page }) => {
    await expect(page.locator("table, .api-table")).toBeVisible();
    await expect(page.locator('text="value"')).toBeVisible();
    await expect(page.locator('text="min"')).toBeVisible();
    await expect(page.locator('text="max"')).toBeVisible();
    await expect(page.locator('text="required"')).toBeVisible();
  });

  test("keyboard navigation works", async ({ page }) => {
    await page.keyboard.press("Tab");

    const focusedElement = page.locator(":focus");
    await expect(focusedElement).toBeVisible();

    const tagName = await focusedElement.evaluate((el) => el.tagName.toLowerCase());
    if (tagName === "input") {
      const inputType = await focusedElement.getAttribute("type");
      if (inputType === "datetime-local") {
        await page.keyboard.press("ArrowUp");
        await page.keyboard.press("ArrowDown");
        await expect(focusedElement).toBeFocused();
      }
    }
  });

  test("responsive behavior on mobile", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });

    await expect(page.locator("h1").first()).toBeVisible();
    await expect(page.locator('input[type="datetime-local"]').first()).toBeVisible();
    await expect(page.locator("main").first()).toBeVisible();
  });

  test("page performance is acceptable", async ({ page }) => {
    const navigationPromise = page.waitForLoadState("networkidle");
    const startTime = Date.now();

    await page.goto("http://localhost:8001/components/input/datetime-input");
    await navigationPromise;

    const loadTime = Date.now() - startTime;
    expect(loadTime).toBeLessThan(3000);
  });
});
