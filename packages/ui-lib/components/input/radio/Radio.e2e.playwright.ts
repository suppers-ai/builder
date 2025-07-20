import { expect, test } from "@playwright/test";

test.describe("Radio E2E Tests", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:8001/components/input/radio");
    await page.waitForLoadState("networkidle");
  });

  test("page loads and displays radio examples", async ({ page }) => {
    await expect(page).toHaveTitle(/Radio/);
    await expect(page.locator("h1")).toContainText("Radio");
    await expect(page.locator('input[type="radio"]').first()).toBeVisible();
  });

  test("radio basic functionality works", async ({ page }) => {
    const radios = page.locator('input[type="radio"]');
    const radioCount = await radios.count();

    expect(radioCount).toBeGreaterThan(0);

    // Test first radio
    const firstRadio = radios.first();
    await expect(firstRadio).toBeVisible();

    // Radio should be selectable
    await firstRadio.check();
    await expect(firstRadio).toBeChecked();
  });

  test("radio group mutual exclusion works", async ({ page }) => {
    // Look for radio buttons with the same name attribute
    const radioGroups = await page.evaluate(() => {
      const radios = Array.from(document.querySelectorAll('input[type="radio"]'));
      const groups = {};

      radios.forEach((radio) => {
        const name = radio.getAttribute("name");
        if (name) {
          if (!groups[name]) groups[name] = [];
          groups[name].push(radio);
        }
      });

      // Return groups with more than one radio
      return Object.entries(groups)
        .filter(([name, radios]) => radios.length > 1)
        .map(([name, radios]) => ({ name, count: radios.length }));
    });

    if (radioGroups.length > 0) {
      const groupName = radioGroups[0].name;
      const groupRadios = page.locator(`input[type="radio"][name="${groupName}"]`);
      const groupCount = await groupRadios.count();

      if (groupCount > 1) {
        // Select first radio
        await groupRadios.first().check();
        await expect(groupRadios.first()).toBeChecked();

        // Select second radio
        await groupRadios.nth(1).check();
        await expect(groupRadios.nth(1)).toBeChecked();

        // First radio should now be unchecked (mutual exclusion)
        await expect(groupRadios.first()).not.toBeChecked();
      }
    }
  });

  test("radio keyboard navigation works", async ({ page }) => {
    // Look for radio group
    const radios = page.locator('input[type="radio"]');
    const radioCount = await radios.count();

    if (radioCount > 1) {
      const firstRadio = radios.first();
      const secondRadio = radios.nth(1);

      // Focus first radio
      await firstRadio.focus();
      await expect(firstRadio).toBeFocused();

      // Select with Space
      await page.keyboard.press("Space");
      await expect(firstRadio).toBeChecked();

      // Navigate with arrow keys (if same group)
      const firstName = await firstRadio.getAttribute("name");
      const secondName = await secondRadio.getAttribute("name");

      if (firstName === secondName && firstName) {
        // Arrow down should move to next radio in group
        await page.keyboard.press("ArrowDown");
        await expect(secondRadio).toBeFocused();
        await expect(secondRadio).toBeChecked();
        await expect(firstRadio).not.toBeChecked();

        // Arrow up should move back
        await page.keyboard.press("ArrowUp");
        await expect(firstRadio).toBeFocused();
        await expect(firstRadio).toBeChecked();
        await expect(secondRadio).not.toBeChecked();
      }
    }
  });

  test("radio size variants work", async ({ page }) => {
    const sizeVariants = ["radio-xs", "radio-sm", "radio-lg"];

    for (const size of sizeVariants) {
      const sizedRadios = page.locator(`.${size}`);
      const sizedCount = await sizedRadios.count();

      if (sizedCount > 0) {
        const sizedRadio = sizedRadios.first();
        await expect(sizedRadio).toBeVisible();

        // Should have the size class
        const hasClass = await sizedRadio.evaluate(
          (el, className) => el.classList.contains(className),
          size,
        );
        expect(hasClass).toBe(true);

        // Should be functional
        await sizedRadio.check();
        await expect(sizedRadio).toBeChecked();
      }
    }
  });

  test("radio color variants work", async ({ page }) => {
    const colorVariants = [
      "radio-primary",
      "radio-secondary",
      "radio-accent",
      "radio-success",
      "radio-warning",
      "radio-error",
      "radio-info",
    ];

    for (const color of colorVariants) {
      const coloredRadios = page.locator(`.${color}`);
      const coloredCount = await coloredRadios.count();

      if (coloredCount > 0) {
        const coloredRadio = coloredRadios.first();
        await expect(coloredRadio).toBeVisible();

        // Should have the color class
        const hasClass = await coloredRadio.evaluate(
          (el, className) => el.classList.contains(className),
          color,
        );
        expect(hasClass).toBe(true);

        // Should be functional
        await coloredRadio.check();
        await expect(coloredRadio).toBeChecked();
      }
    }
  });

  test("disabled radio is not interactive", async ({ page }) => {
    const disabledRadios = page.locator('input[type="radio"][disabled]');
    const disabledCount = await disabledRadios.count();

    if (disabledCount > 0) {
      const disabledRadio = disabledRadios.first();
      await expect(disabledRadio).toBeVisible();
      await expect(disabledRadio).toBeDisabled();

      // Should not be selectable
      await disabledRadio.click({ force: true });

      // Check if it was already checked (disabled checked state)
      const wasInitiallyChecked = await disabledRadio.evaluate((el) => el.defaultChecked);

      if (!wasInitiallyChecked) {
        await expect(disabledRadio).not.toBeChecked();
      }
    }
  });

  test("radio label association works", async ({ page }) => {
    // Look for radios with associated labels
    const labeledRadios = page.locator('label:has(input[type="radio"])');
    const labeledCount = await labeledRadios.count();

    if (labeledCount > 0) {
      const labeledRadio = labeledRadios.first();
      const radio = labeledRadio.locator('input[type="radio"]');

      // Click label should select radio
      await labeledRadio.click();
      await expect(radio).toBeChecked();
    }
  });

  test("radio form submission works", async ({ page }) => {
    // Look for radios within forms
    const formRadios = page.locator('form input[type="radio"]');
    const formRadioCount = await formRadios.count();

    if (formRadioCount > 0) {
      const formRadio = formRadios.first();

      // Select the radio
      await formRadio.check();
      await expect(formRadio).toBeChecked();

      // Check if radio has name attribute for form submission
      const name = await formRadio.getAttribute("name");
      const value = await formRadio.getAttribute("value");

      expect(name).toBeTruthy();
      expect(value).toBeTruthy();
    }
  });

  test("radio accessibility attributes", async ({ page }) => {
    const radios = page.locator('input[type="radio"]');
    const radioCount = await radios.count();

    for (let i = 0; i < Math.min(radioCount, 3); i++) {
      const radio = radios.nth(i);

      // Should be visible
      await expect(radio).toBeVisible();

      // Should be a radio input
      const type = await radio.getAttribute("type");
      expect(type).toBe("radio");

      // Should have name attribute for grouping
      const name = await radio.getAttribute("name");
      const ariaLabel = await radio.getAttribute("aria-label");
      const ariaLabelledBy = await radio.getAttribute("aria-labelledby");

      // Should have some form of labeling or be in a label
      const isInLabel = await radio.evaluate((el) => !!el.closest("label"));

      if (!ariaLabel && !ariaLabelledBy && !isInLabel) {
        // At minimum should be focusable and have a name
        await radio.focus();
        await expect(radio).toBeFocused();
        expect(name).toBeTruthy();
      }
    }
  });

  test("radio responsive behavior", async ({ page }) => {
    const radio = page.locator('input[type="radio"]').first();

    // Desktop view
    await page.setViewportSize({ width: 1920, height: 1080 });
    await expect(radio).toBeVisible();

    const desktopSize = await radio.evaluate((el) => ({
      width: el.offsetWidth,
      height: el.offsetHeight,
    }));

    // Mobile view
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(radio).toBeVisible();

    const mobileSize = await radio.evaluate((el) => ({
      width: el.offsetWidth,
      height: el.offsetHeight,
    }));

    // Radio should remain interactive on mobile
    expect(mobileSize.width).toBeGreaterThan(0);
    expect(mobileSize.height).toBeGreaterThan(0);

    // Should still be clickable
    await radio.check();
    await expect(radio).toBeChecked();
  });

  test("radio hover and focus states", async ({ page }) => {
    const radio = page.locator('input[type="radio"]').first();

    // Test hover
    await radio.hover();
    await expect(radio).toBeVisible();

    // Test focus
    await radio.focus();
    await expect(radio).toBeFocused();

    // Should still be functional after hover/focus
    await radio.check();
    await expect(radio).toBeChecked();
  });

  test("radio group validation", async ({ page }) => {
    // Look for radio groups and test that only one can be selected
    const radioNames = await page.evaluate(() => {
      const radios = Array.from(document.querySelectorAll('input[type="radio"]'));
      const names = new Set();
      radios.forEach((radio) => {
        const name = radio.getAttribute("name");
        if (name) names.add(name);
      });
      return Array.from(names);
    });

    for (const groupName of radioNames.slice(0, 2)) {
      const groupRadios = page.locator(`input[type="radio"][name="${groupName}"]`);
      const groupCount = await groupRadios.count();

      if (groupCount > 1) {
        // Test that only one can be selected at a time
        await groupRadios.first().check();
        await groupRadios.nth(1).check();

        // Count checked radios in this group
        const checkedCount = await page.evaluate((name) => {
          return document.querySelectorAll(`input[type="radio"][name="${name}"]:checked`).length;
        }, groupName);

        expect(checkedCount).toBe(1);
      }
    }
  });

  test("radio button style variants", async ({ page }) => {
    // Test button-style radios if they exist
    const buttonRadios = page.locator('input[type="radio"].btn, .join input[type="radio"]');
    const buttonCount = await buttonRadios.count();

    if (buttonCount > 0) {
      const buttonRadio = buttonRadios.first();
      await expect(buttonRadio).toBeVisible();

      // Should be selectable
      await buttonRadio.check();
      await expect(buttonRadio).toBeChecked();

      // Should have button-like styling
      const className = await buttonRadio.getAttribute("class");
      expect(className).toContain("btn");
    }
  });

  test("radio tab-style variants", async ({ page }) => {
    // Test tab-style radios if they exist
    const tabRadios = page.locator('input[type="radio"].tab');
    const tabCount = await tabRadios.count();

    if (tabCount > 0) {
      const tabRadio = tabRadios.first();
      await expect(tabRadio).toBeVisible();

      // Should be selectable
      await tabRadio.check();
      await expect(tabRadio).toBeChecked();

      // Should have tab styling
      const className = await tabRadio.getAttribute("class");
      expect(className).toContain("tab");
    }
  });

  test("radio required validation", async ({ page }) => {
    // Look for required radio groups
    const requiredRadios = page.locator('input[type="radio"][required]');
    const requiredCount = await requiredRadios.count();

    if (requiredCount > 0) {
      const requiredRadio = requiredRadios.first();

      // Should be marked as required
      const isRequired = await requiredRadio.getAttribute("required");
      expect(isRequired).not.toBeNull();

      // Should still be functional
      await requiredRadio.check();
      await expect(requiredRadio).toBeChecked();
    }
  });

  test("API documentation is present", async ({ page }) => {
    await expect(page.locator("table, .api-table")).toBeVisible();
    await expect(page.locator('text="checked"')).toBeVisible();
    await expect(page.locator('text="disabled"')).toBeVisible();
    await expect(page.locator('text="name"')).toBeVisible();
    await expect(page.locator('text="value"')).toBeVisible();
  });
});
