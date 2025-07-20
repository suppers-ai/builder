import { expect, test } from "@playwright/test";

test.describe("Checkbox E2E Tests", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:8001/components/input/checkbox");
    await page.waitForLoadState("networkidle");
  });

  test("page loads and displays checkbox examples", async ({ page }) => {
    await expect(page).toHaveTitle(/Checkbox/);
    await expect(page.locator("h1")).toContainText("Checkbox");
    await expect(page.locator(".checkbox").first()).toBeVisible();
  });

  test("checkbox basic functionality works", async ({ page }) => {
    const checkboxes = page.locator(".checkbox");
    const checkboxCount = await checkboxes.count();

    expect(checkboxCount).toBeGreaterThan(0);

    // Test first checkbox
    const firstCheckbox = checkboxes.first();
    await expect(firstCheckbox).toBeVisible();

    // Get initial state
    const initialChecked = await firstCheckbox.isChecked();

    // Click to toggle
    await firstCheckbox.click();

    // State should change
    const newChecked = await firstCheckbox.isChecked();
    expect(newChecked).toBe(!initialChecked);

    // Click again to toggle back
    await firstCheckbox.click();

    const finalChecked = await firstCheckbox.isChecked();
    expect(finalChecked).toBe(initialChecked);
  });

  test("checkbox keyboard navigation works", async ({ page }) => {
    const checkbox = page.locator(".checkbox").first();

    // Focus checkbox
    await checkbox.focus();
    await expect(checkbox).toBeFocused();

    // Get initial state
    const initialChecked = await checkbox.isChecked();

    // Toggle with Space
    await page.keyboard.press("Space");

    // State should change
    const newChecked = await checkbox.isChecked();
    expect(newChecked).toBe(!initialChecked);

    // Toggle back with Space
    await page.keyboard.press("Space");

    const finalChecked = await checkbox.isChecked();
    expect(finalChecked).toBe(initialChecked);
  });

  test("checkbox size variants work", async ({ page }) => {
    const sizeVariants = ["checkbox-xs", "checkbox-sm", "checkbox-lg"];

    for (const size of sizeVariants) {
      const sizedCheckboxes = page.locator(`.${size}`);
      const sizedCount = await sizedCheckboxes.count();

      if (sizedCount > 0) {
        const sizedCheckbox = sizedCheckboxes.first();
        await expect(sizedCheckbox).toBeVisible();

        // Should have the size class
        const hasClass = await sizedCheckbox.evaluate(
          (el, className) => el.classList.contains(className),
          size,
        );
        expect(hasClass).toBe(true);

        // Should be functional
        const initialState = await sizedCheckbox.isChecked();
        await sizedCheckbox.click();
        const newState = await sizedCheckbox.isChecked();
        expect(newState).toBe(!initialState);
      }
    }
  });

  test("checkbox color variants work", async ({ page }) => {
    const colorVariants = [
      "checkbox-primary",
      "checkbox-secondary",
      "checkbox-accent",
      "checkbox-success",
      "checkbox-warning",
      "checkbox-error",
      "checkbox-info",
    ];

    for (const color of colorVariants) {
      const coloredCheckboxes = page.locator(`.${color}`);
      const coloredCount = await coloredCheckboxes.count();

      if (coloredCount > 0) {
        const coloredCheckbox = coloredCheckboxes.first();
        await expect(coloredCheckbox).toBeVisible();

        // Should have the color class
        const hasClass = await coloredCheckbox.evaluate(
          (el, className) => el.classList.contains(className),
          color,
        );
        expect(hasClass).toBe(true);

        // Should be functional
        const initialState = await coloredCheckbox.isChecked();
        await coloredCheckbox.click();
        const newState = await coloredCheckbox.isChecked();
        expect(newState).toBe(!initialState);
      }
    }
  });

  test("disabled checkbox is not interactive", async ({ page }) => {
    const disabledCheckboxes = page.locator(".checkbox[disabled]");
    const disabledCount = await disabledCheckboxes.count();

    if (disabledCount > 0) {
      const disabledCheckbox = disabledCheckboxes.first();
      await expect(disabledCheckbox).toBeVisible();
      await expect(disabledCheckbox).toBeDisabled();

      // Get initial state
      const initialState = await disabledCheckbox.isChecked();

      // Try to click (should not work)
      await disabledCheckbox.click({ force: true });

      // State should not change
      const newState = await disabledCheckbox.isChecked();
      expect(newState).toBe(initialState);
    }
  });

  test("checkbox label association works", async ({ page }) => {
    // Look for checkboxes with associated labels
    const labeledCheckboxes = page.locator("label:has(.checkbox)");
    const labeledCount = await labeledCheckboxes.count();

    if (labeledCount > 0) {
      const labeledCheckbox = labeledCheckboxes.first();
      const checkbox = labeledCheckbox.locator(".checkbox");

      // Get initial state
      const initialState = await checkbox.isChecked();

      // Click label (should toggle checkbox)
      await labeledCheckbox.click();

      // State should change
      const newState = await checkbox.isChecked();
      expect(newState).toBe(!initialState);
    }
  });

  test("checkbox form submission works", async ({ page }) => {
    // Look for checkboxes within forms
    const formCheckboxes = page.locator("form .checkbox");
    const formCheckboxCount = await formCheckboxes.count();

    if (formCheckboxCount > 0) {
      const formCheckbox = formCheckboxes.first();

      // Check the checkbox
      await formCheckbox.check();
      await expect(formCheckbox).toBeChecked();

      // Check if checkbox has name attribute for form submission
      const name = await formCheckbox.getAttribute("name");
      const id = await formCheckbox.getAttribute("id");

      // Should have either name or id for form association
      expect(name || id).toBeTruthy();
    }
  });

  test("checkbox indeterminate state works", async ({ page }) => {
    // Create and test indeterminate checkbox
    const indeterminateCheckbox = await page.evaluateHandle(() => {
      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.className = "checkbox";
      checkbox.indeterminate = true;
      document.body.appendChild(checkbox);
      return checkbox;
    });

    // Check indeterminate state
    const isIndeterminate = await indeterminateCheckbox.evaluate((el) => el.indeterminate);
    expect(isIndeterminate).toBe(true);

    // Click should clear indeterminate and set checked
    await indeterminateCheckbox.asElement()?.click();

    const afterClickIndeterminate = await indeterminateCheckbox.evaluate((el) => el.indeterminate);
    const afterClickChecked = await indeterminateCheckbox.evaluate((el) => el.checked);

    expect(afterClickIndeterminate).toBe(false);
    expect(afterClickChecked).toBe(true);
  });

  test("checkbox accessibility attributes", async ({ page }) => {
    const checkboxes = page.locator(".checkbox");
    const checkboxCount = await checkboxes.count();

    for (let i = 0; i < Math.min(checkboxCount, 3); i++) {
      const checkbox = checkboxes.nth(i);

      // Should be visible
      await expect(checkbox).toBeVisible();

      // Should be a checkbox input
      const type = await checkbox.getAttribute("type");
      expect(type).toBe("checkbox");

      // Check for accessibility attributes
      const ariaLabel = await checkbox.getAttribute("aria-label");
      const ariaLabelledBy = await checkbox.getAttribute("aria-labelledby");
      const ariaDescribedBy = await checkbox.getAttribute("aria-describedby");

      // Should have some form of labeling (or be in a label)
      const isInLabel = await checkbox.evaluate((el) => !!el.closest("label"));

      if (!ariaLabel && !ariaLabelledBy && !isInLabel) {
        // At minimum should be focusable
        await checkbox.focus();
        await expect(checkbox).toBeFocused();
      }
    }
  });

  test("checkbox responsive behavior", async ({ page }) => {
    const checkbox = page.locator(".checkbox").first();

    // Desktop view
    await page.setViewportSize({ width: 1920, height: 1080 });
    await expect(checkbox).toBeVisible();

    const desktopSize = await checkbox.evaluate((el) => ({
      width: el.offsetWidth,
      height: el.offsetHeight,
    }));

    // Mobile view
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(checkbox).toBeVisible();

    const mobileSize = await checkbox.evaluate((el) => ({
      width: el.offsetWidth,
      height: el.offsetHeight,
    }));

    // Checkbox should remain interactive on mobile
    expect(mobileSize.width).toBeGreaterThan(0);
    expect(mobileSize.height).toBeGreaterThan(0);

    // Should still be clickable
    const initialState = await checkbox.isChecked();
    await checkbox.click();
    const newState = await checkbox.isChecked();
    expect(newState).toBe(!initialState);
  });

  test("checkbox hover and focus states", async ({ page }) => {
    const checkbox = page.locator(".checkbox").first();

    // Test hover
    await checkbox.hover();
    await expect(checkbox).toBeVisible();

    // Test focus
    await checkbox.focus();
    await expect(checkbox).toBeFocused();

    // Should still be functional after hover/focus
    const initialState = await checkbox.isChecked();
    await checkbox.click();
    const newState = await checkbox.isChecked();
    expect(newState).toBe(!initialState);
  });

  test("checkbox group selection", async ({ page }) => {
    // Look for multiple checkboxes (checkbox group)
    const checkboxes = page.locator(".checkbox");
    const checkboxCount = await checkboxes.count();

    if (checkboxCount > 1) {
      // Test selecting multiple checkboxes
      const firstCheckbox = checkboxes.first();
      const secondCheckbox = checkboxes.nth(1);

      // Both should be independently selectable
      await firstCheckbox.check();
      await secondCheckbox.check();

      await expect(firstCheckbox).toBeChecked();
      await expect(secondCheckbox).toBeChecked();

      // Unchecking one should not affect the other
      await firstCheckbox.uncheck();

      await expect(firstCheckbox).not.toBeChecked();
      await expect(secondCheckbox).toBeChecked();
    }
  });

  test("checkbox validation states", async ({ page }) => {
    // Look for checkboxes with validation classes
    const errorCheckboxes = page.locator(".checkbox-error");
    const successCheckboxes = page.locator(".checkbox-success");

    // Test error state
    if (await errorCheckboxes.count() > 0) {
      const errorCheckbox = errorCheckboxes.first();
      await expect(errorCheckbox).toBeVisible();

      // Should still be functional
      const initialState = await errorCheckbox.isChecked();
      await errorCheckbox.click();
      const newState = await errorCheckbox.isChecked();
      expect(newState).toBe(!initialState);
    }

    // Test success state
    if (await successCheckboxes.count() > 0) {
      const successCheckbox = successCheckboxes.first();
      await expect(successCheckbox).toBeVisible();

      // Should still be functional
      const initialState = await successCheckbox.isChecked();
      await successCheckbox.click();
      const newState = await successCheckbox.isChecked();
      expect(newState).toBe(!initialState);
    }
  });

  test("API documentation is present", async ({ page }) => {
    await expect(page.locator("table, .api-table")).toBeVisible();
    await expect(page.locator('text="checked"')).toBeVisible();
    await expect(page.locator('text="disabled"')).toBeVisible();
    await expect(page.locator('text="size"')).toBeVisible();
    await expect(page.locator('text="color"')).toBeVisible();
  });
});
