import { expect, test } from "@playwright/test";

test.describe("TimeInput Visual Tests", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to time input component page
    await page.goto("http://localhost:8001/components/input/time-input");
    await page.waitForLoadState("networkidle");
  });

  test("time input basic visual regression", async ({ page }) => {
    // Test basic time input section
    const basicSection = page.locator("section").filter({ hasText: "Basic Time Input" });
    await expect(basicSection).toHaveScreenshot("time-input-basic.png");
  });

  test("time input sizes visual regression", async ({ page }) => {
    // Test sizes section
    const sizesSection = page.locator("section").filter({ hasText: "Sizes" });
    await expect(sizesSection).toHaveScreenshot("time-input-sizes.png");
  });

  test("time input colors visual regression", async ({ page }) => {
    // Test colors section
    const colorsSection = page.locator("section").filter({ hasText: "Colors" });
    await expect(colorsSection).toHaveScreenshot("time-input-colors.png");
  });

  test("time input variants visual regression", async ({ page }) => {
    // Test variants section
    const variantsSection = page.locator("section").filter({ hasText: "Variants" });
    await expect(variantsSection).toHaveScreenshot("time-input-variants.png");
  });

  test("time input states visual regression", async ({ page }) => {
    // Test states section
    const statesSection = page.locator("section").filter({ hasText: "States" });
    await expect(statesSection).toHaveScreenshot("time-input-states.png");
  });

  test("time input constraints visual regression", async ({ page }) => {
    // Test constraints section
    const constraintsSection = page.locator("section").filter({ hasText: "Constraints" });
    await expect(constraintsSection).toHaveScreenshot("time-input-constraints.png");
  });

  // Test specific time input interactions
  test("time input hover states", async ({ page }) => {
    const primaryTimeInput = page.locator(".input-primary").first();

    // Normal state
    await expect(primaryTimeInput).toHaveScreenshot("time-input-primary-normal.png");

    // Hover state
    await primaryTimeInput.hover();
    await expect(primaryTimeInput).toHaveScreenshot("time-input-primary-hover.png");
  });

  test("time input focus states", async ({ page }) => {
    const primaryTimeInput = page.locator(".input-primary").first();

    // Focus state
    await primaryTimeInput.focus();
    await expect(primaryTimeInput).toHaveScreenshot("time-input-primary-focus.png");
  });

  // Theme testing
  test("time input in different themes", async ({ page }) => {
    const themes = ["light", "dark", "cupcake", "cyberpunk", "synthwave"];

    for (const theme of themes) {
      // Change theme
      await page.evaluate((theme) => {
        document.documentElement.setAttribute("data-theme", theme);
      }, theme);

      // Wait for theme to apply
      await page.waitForTimeout(100);

      // Take screenshot of time input examples
      const timeInputSection = page.locator("section").filter({ hasText: "Basic Time Input" });
      await expect(timeInputSection).toHaveScreenshot(`time-input-theme-${theme}.png`);
    }
  });

  // Responsive testing
  test("time input responsive design", async ({ page }) => {
    const viewports = [
      { width: 375, height: 667, name: "mobile" },
      { width: 768, height: 1024, name: "tablet" },
      { width: 1920, height: 1080, name: "desktop" },
    ];

    for (const viewport of viewports) {
      await page.setViewportSize(viewport);

      const timeInputSection = page.locator("section").filter({ hasText: "Sizes" });
      await expect(timeInputSection).toHaveScreenshot(`time-input-${viewport.name}.png`);
    }
  });

  // Edge cases
  test("time input with various time formats", async ({ page }) => {
    // Test different time formats and edge cases
    await page.evaluate(() => {
      const container = document.createElement("div");
      container.className = "p-4 space-y-4";
      container.innerHTML = `
        <input type="time" class="input input-primary w-full" value="00:00" />
        <input type="time" class="input input-secondary w-full" value="12:00" />
        <input type="time" class="input input-accent w-full" value="23:59" />
        <input type="time" class="input input-success w-full" value="06:30" />
        <input type="time" class="input input-warning w-full" value="18:45" />
        <input type="time" class="input input-error w-full" value="09:15" />
      `;
      document.body.appendChild(container);
    });

    const container = page.locator("div").last();
    await expect(container).toHaveScreenshot("time-input-time-formats.png");
  });

  test("time input validation states", async ({ page }) => {
    // Test validation visual states
    await page.evaluate(() => {
      const container = document.createElement("div");
      container.className = "p-4 space-y-4";
      container.innerHTML = `
        <input type="time" class="input input-success w-full" value="09:00" />
        <input type="time" class="input input-error w-full" value="25:00" />
        <input type="time" class="input input-warning w-full" value="24:00" />
        <input type="time" class="input input-info w-full" value="12:30" />
      `;
      document.body.appendChild(container);
    });

    const container = page.locator("div").last();
    await expect(container).toHaveScreenshot("time-input-validation-states.png");
  });

  test("time input step increments", async ({ page }) => {
    // Test step increment visual behavior
    await page.evaluate(() => {
      const container = document.createElement("div");
      container.className = "p-4 space-y-4";
      container.innerHTML = `
        <input type="time" class="input input-bordered w-full" step="1" value="14:30:45" />
        <input type="time" class="input input-bordered w-full" step="60" value="14:30" />
        <input type="time" class="input input-bordered w-full" step="900" value="14:30" />
        <input type="time" class="input input-bordered w-full" step="3600" value="14:00" />
      `;
      document.body.appendChild(container);
    });

    const container = page.locator("div").last();
    await expect(container).toHaveScreenshot("time-input-step-increments.png");
  });

  test("time input accessibility contrast", async ({ page }) => {
    // Test high contrast mode or accessibility features
    await page.emulateMedia({ reducedMotion: "reduce" });

    const timeInputSection = page.locator("section").filter({ hasText: "Basic Time Input" });
    await expect(timeInputSection).toHaveScreenshot("time-input-reduced-motion.png");
  });

  // Test time input with constraints
  test("time input constraint behavior", async ({ page }) => {
    // Test visual behavior with time constraints
    await page.evaluate(() => {
      const container = document.createElement("div");
      container.className = "p-4 space-y-4";
      container.innerHTML = `
        <label class="block">
          <span class="text-sm font-medium">Business Hours (9 AM - 5 PM)</span>
          <input type="time" class="input input-primary w-full" min="09:00" max="17:00" value="12:00" />
        </label>
        <label class="block">
          <span class="text-sm font-medium">Evening Hours (6 PM - 11 PM)</span>
          <input type="time" class="input input-secondary w-full" min="18:00" max="23:00" value="20:00" />
        </label>
        <label class="block">
          <span class="text-sm font-medium">Morning Hours (6 AM - 12 PM)</span>
          <input type="time" class="input input-accent w-full" min="06:00" max="12:00" value="08:00" />
        </label>
      `;
      document.body.appendChild(container);
    });

    const container = page.locator("div").last();
    await expect(container).toHaveScreenshot("time-input-constraints.png");
  });

  // Performance test - ensure consistent rendering
  test("time input rendering consistency", async ({ page }) => {
    // Test multiple renders for consistency
    for (let i = 0; i < 3; i++) {
      await page.reload();
      await page.waitForLoadState("networkidle");

      const timeInputSection = page.locator("section").filter({ hasText: "Basic Time Input" });
      await expect(timeInputSection).toHaveScreenshot(`time-input-render-${i}.png`);
    }
  });

  // Test time input picker interaction (browser-specific)
  test("time input picker visual", async ({ page }) => {
    const timeInput = page.locator('input[type="time"]').first();

    // Click to potentially open time picker (depends on browser)
    await timeInput.click();
    await page.waitForTimeout(500);

    // Take screenshot of the input area
    await expect(timeInput).toHaveScreenshot("time-input-picker-interaction.png");
  });
});
