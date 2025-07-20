import { expect, test } from "@playwright/test";

test.describe("Select E2E Tests", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:8001/components/input/select");
    await page.waitForLoadState("networkidle");
  });

  test("page loads and displays select examples", async ({ page }) => {
    await expect(page).toHaveTitle(/Select/);
    await expect(page.locator("h1")).toContainText("Select");
    await expect(page.locator("select").first()).toBeVisible();
  });

  test("select option selection works", async ({ page }) => {
    const select = page.locator("select").first();

    // Get available options
    const options = select.locator("option:not([disabled])");
    const optionCount = await options.count();

    if (optionCount > 0) {
      // Select first available option
      const firstOption = options.first();
      const optionValue = await firstOption.getAttribute("value");
      const optionText = await firstOption.textContent();

      await select.selectOption({ index: 1 }); // Skip disabled option at index 0

      // Verify selection
      const selectedValue = await select.inputValue();
      expect(selectedValue).toBeTruthy();
    }
  });

  test("select keyboard navigation", async ({ page }) => {
    const select = page.locator("select").first();

    // Focus select
    await select.focus();
    await expect(select).toBeFocused();

    // Open dropdown with Space or Enter
    await page.keyboard.press("Space");

    // Navigate with arrow keys
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("ArrowDown");

    // Select with Enter
    await page.keyboard.press("Enter");

    // Verify selection changed
    const selectedValue = await select.inputValue();
    expect(selectedValue).toBeTruthy();
  });

  test("select with form label association", async ({ page }) => {
    const labeledSelects = page.locator(".form-control select");
    const labeledCount = await labeledSelects.count();

    if (labeledCount > 0) {
      const labeledSelect = labeledSelects.first();
      const label = page.locator("label").first();

      // Click label should focus select
      await label.click();
      await expect(labeledSelect).toBeFocused();
    }
  });

  test("disabled select is not interactive", async ({ page }) => {
    const disabledSelect = page.locator("select[disabled]").first();

    if (await disabledSelect.count() > 0) {
      await expect(disabledSelect).toBeDisabled();

      // Try to select option - should not work
      const initialValue = await disabledSelect.inputValue();
      await disabledSelect.selectOption({ index: 1 }, { force: true });

      const newValue = await disabledSelect.inputValue();
      expect(newValue).toBe(initialValue);
    }
  });

  test("select option groups work", async ({ page }) => {
    // Look for select with optgroups
    const selectWithGroups = page.locator("select:has(optgroup)").first();

    if (await selectWithGroups.count() > 0) {
      const optgroups = selectWithGroups.locator("optgroup");
      const groupCount = await optgroups.count();

      expect(groupCount).toBeGreaterThan(0);

      // Check group labels
      for (let i = 0; i < groupCount; i++) {
        const group = optgroups.nth(i);
        const label = await group.getAttribute("label");
        expect(label?.trim()).toBeTruthy();

        // Check group has options
        const groupOptions = group.locator("option");
        const optionCount = await groupOptions.count();
        expect(optionCount).toBeGreaterThan(0);
      }
    }
  });

  test("select accessibility attributes", async ({ page }) => {
    const selects = page.locator("select");
    const selectCount = await selects.count();

    for (let i = 0; i < Math.min(selectCount, 3); i++) {
      const select = selects.nth(i);

      // Check for proper attributes
      const hasName = await select.getAttribute("name");
      const hasId = await select.getAttribute("id");

      // Should have either name or id for form association
      expect(hasName || hasId).toBeTruthy();

      // Check for accessibility attributes
      const ariaLabel = await select.getAttribute("aria-label");
      const ariaLabelledBy = await select.getAttribute("aria-labelledby");

      // Should have some form of labeling
      if (!ariaLabel && !ariaLabelledBy) {
        // Check if there's an associated label
        const labels = page.locator(`label[for="${hasId}"], label:has(select)`);
        const labelCount = await labels.count();
        if (labelCount === 0) {
          // At minimum, should have accessible name through options
          const options = select.locator("option");
          const optionCount = await options.count();
          expect(optionCount).toBeGreaterThan(0);
        }
      }
    }
  });

  test("select validation states", async ({ page }) => {
    // Test error state
    const errorSelect = page.locator(".select-error").first();
    if (await errorSelect.count() > 0) {
      await expect(errorSelect).toBeVisible();

      // Should have error styling
      const hasErrorClass = await errorSelect.evaluate((el) =>
        el.classList.contains("select-error")
      );
      expect(hasErrorClass).toBe(true);
    }

    // Test success state
    const successSelect = page.locator(".select-success").first();
    if (await successSelect.count() > 0) {
      await expect(successSelect).toBeVisible();

      // Should have success styling
      const hasSuccessClass = await successSelect.evaluate((el) =>
        el.classList.contains("select-success")
      );
      expect(hasSuccessClass).toBe(true);
    }
  });

  test("select multiple selection", async ({ page }) => {
    const multipleSelect = page.locator("select[multiple]").first();

    if (await multipleSelect.count() > 0) {
      await expect(multipleSelect).toBeVisible();

      // Can select multiple options
      const options = multipleSelect.locator("option");
      const optionCount = await options.count();

      if (optionCount > 2) {
        // Select multiple options
        await multipleSelect.selectOption([
          { index: 0 },
          { index: 1 },
        ]);

        // Verify multiple selection
        const selectedOptions = await multipleSelect.evaluate((el) =>
          Array.from(el.selectedOptions).map((opt) => opt.value)
        );
        expect(selectedOptions.length).toBeGreaterThan(1);
      }
    }
  });

  test("select size variants work", async ({ page }) => {
    const sizes = ["select-xs", "select-sm", "select-md", "select-lg"];

    for (const size of sizes) {
      const sizedSelect = page.locator(`.${size}`);
      const sizedCount = await sizedSelect.count();

      if (sizedCount > 0) {
        const firstSized = sizedSelect.first();
        await expect(firstSized).toBeVisible();

        // Check that size class is applied
        const hasClass = await firstSized.evaluate(
          (el, className) => el.classList.contains(className),
          size,
        );
        expect(hasClass).toBe(true);
      }
    }
  });

  test("select form submission", async ({ page }) => {
    // Look for select within a form
    const formSelect = page.locator("form select").first();

    if (await formSelect.count() > 0) {
      // Select an option
      const options = formSelect.locator("option:not([disabled])");
      const optionCount = await options.count();

      if (optionCount > 0) {
        await formSelect.selectOption({ index: 0 });

        // Find submit button
        const submitButton = page.locator('button[type="submit"], input[type="submit"]').first();

        if (await submitButton.count() > 0) {
          // Test form submission (in real app this would submit data)
          await submitButton.click();

          // Form should still be visible (since it's a demo)
          await expect(formSelect).toBeVisible();
        }
      }
    }
  });

  test("API documentation is present", async ({ page }) => {
    await expect(page.locator("table, .api-table")).toBeVisible();
    await expect(page.locator('text="options"')).toBeVisible();
    await expect(page.locator('text="placeholder"')).toBeVisible();
    await expect(page.locator('text="disabled"')).toBeVisible();
    await expect(page.locator('text="size"')).toBeVisible();
  });
});
