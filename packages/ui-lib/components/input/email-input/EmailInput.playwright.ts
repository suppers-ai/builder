import { expect, test } from "@playwright/test";

test.describe("EmailInput Visual Tests", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to email input component page
    await page.goto("http://localhost:8001/components/input/email-input");
    await page.waitForLoadState("networkidle");
  });

  test("email input basic visual regression", async ({ page }) => {
    // Test basic email input section
    const basicSection = page.locator("section").filter({ hasText: "Basic Email Input" });
    await expect(basicSection).toHaveScreenshot("email-input-basic.png");
  });

  test("email input sizes visual regression", async ({ page }) => {
    // Test sizes section
    const sizesSection = page.locator("section").filter({ hasText: "Sizes" });
    await expect(sizesSection).toHaveScreenshot("email-input-sizes.png");
  });

  test("email input colors visual regression", async ({ page }) => {
    // Test colors section
    const colorsSection = page.locator("section").filter({ hasText: "Colors" });
    await expect(colorsSection).toHaveScreenshot("email-input-colors.png");
  });

  test("email input variants visual regression", async ({ page }) => {
    // Test variants section
    const variantsSection = page.locator("section").filter({ hasText: "Variants" });
    await expect(variantsSection).toHaveScreenshot("email-input-variants.png");
  });

  test("email input states visual regression", async ({ page }) => {
    // Test states section
    const statesSection = page.locator("section").filter({ hasText: "States" });
    await expect(statesSection).toHaveScreenshot("email-input-states.png");
  });

  test("email input autocomplete visual regression", async ({ page }) => {
    // Test autocomplete section
    const autocompleteSection = page.locator("section").filter({ hasText: "AutoComplete" });
    await expect(autocompleteSection).toHaveScreenshot("email-input-autocomplete.png");
  });

  // Test specific email input interactions
  test("email input hover states", async ({ page }) => {
    const primaryEmailInput = page.locator(".input-primary").first();

    // Normal state
    await expect(primaryEmailInput).toHaveScreenshot("email-input-primary-normal.png");

    // Hover state
    await primaryEmailInput.hover();
    await expect(primaryEmailInput).toHaveScreenshot("email-input-primary-hover.png");
  });

  test("email input focus states", async ({ page }) => {
    const primaryEmailInput = page.locator(".input-primary").first();

    // Focus state
    await primaryEmailInput.focus();
    await expect(primaryEmailInput).toHaveScreenshot("email-input-primary-focus.png");
  });

  // Theme testing
  test("email input in different themes", async ({ page }) => {
    const themes = ["light", "dark", "cupcake", "cyberpunk", "synthwave"];

    for (const theme of themes) {
      // Change theme
      await page.evaluate((theme) => {
        document.documentElement.setAttribute("data-theme", theme);
      }, theme);

      // Wait for theme to apply
      await page.waitForTimeout(100);

      // Take screenshot of email input examples
      const emailInputSection = page.locator("section").filter({ hasText: "Basic Email Input" });
      await expect(emailInputSection).toHaveScreenshot(`email-input-theme-${theme}.png`);
    }
  });

  // Responsive testing
  test("email input responsive design", async ({ page }) => {
    const viewports = [
      { width: 375, height: 667, name: "mobile" },
      { width: 768, height: 1024, name: "tablet" },
      { width: 1920, height: 1080, name: "desktop" },
    ];

    for (const viewport of viewports) {
      await page.setViewportSize(viewport);

      const emailInputSection = page.locator("section").filter({ hasText: "Sizes" });
      await expect(emailInputSection).toHaveScreenshot(`email-input-${viewport.name}.png`);
    }
  });

  // Edge cases
  test("email input with various email formats", async ({ page }) => {
    // Test different email formats and edge cases
    await page.evaluate(() => {
      const container = document.createElement("div");
      container.className = "p-4 space-y-4";
      container.innerHTML = `
        <input type="email" class="input input-primary w-full" value="simple@example.com" />
        <input type="email" class="input input-secondary w-full" value="user.name@domain.co.uk" />
        <input type="email" class="input input-accent w-full" value="very.long.email.address@subdomain.example.com" />
        <input type="email" class="input input-success w-full" value="user+tag@example.com" />
        <input type="email" class="input input-warning w-full" value="user@example-domain.com" />
        <input type="email" class="input input-error w-full" value="invalid-email" />
      `;
      document.body.appendChild(container);
    });

    const container = page.locator("div").last();
    await expect(container).toHaveScreenshot("email-input-email-formats.png");
  });

  test("email input validation states", async ({ page }) => {
    // Test validation visual states
    await page.evaluate(() => {
      const container = document.createElement("div");
      container.className = "p-4 space-y-4";
      container.innerHTML = `
        <input type="email" class="input input-success w-full" value="valid@email.com" />
        <input type="email" class="input input-error w-full" value="invalid-email" />
        <input type="email" class="input input-warning w-full" value="user@" />
        <input type="email" class="input input-info w-full" value="user@domain" />
      `;
      document.body.appendChild(container);
    });

    const container = page.locator("div").last();
    await expect(container).toHaveScreenshot("email-input-validation-states.png");
  });

  test("email input with long content", async ({ page }) => {
    // Test with very long email addresses
    await page.evaluate(() => {
      const container = document.createElement("div");
      container.className = "p-4 space-y-4";
      container.innerHTML = `
        <input type="email" class="input input-primary w-full" value="very.very.very.long.email.address.that.might.overflow@extremely.long.domain.name.example.com" />
        <input type="email" class="input input-secondary w-full" value="short@example.com" />
        <input type="email" class="input input-accent w-full" value="user.with.many.dots.and.plus.signs+tag+another.tag@subdomain.example.domain.co.uk" />
      `;
      document.body.appendChild(container);
    });

    const container = page.locator("div").last();
    await expect(container).toHaveScreenshot("email-input-long-content.png");
  });

  test("email input accessibility contrast", async ({ page }) => {
    // Test high contrast mode or accessibility features
    await page.emulateMedia({ reducedMotion: "reduce" });

    const emailInputSection = page.locator("section").filter({ hasText: "Basic Email Input" });
    await expect(emailInputSection).toHaveScreenshot("email-input-reduced-motion.png");
  });

  // Test email input with form context
  test("email input in form context", async ({ page }) => {
    // Test visual behavior within form layouts
    await page.evaluate(() => {
      const container = document.createElement("div");
      container.className = "p-4 space-y-4";
      container.innerHTML = `
        <form class="space-y-4">
          <div class="form-control">
            <label class="label">
              <span class="label-text">Email Address</span>
            </label>
            <input type="email" class="input input-bordered w-full" placeholder="Enter your email" />
          </div>
          <div class="form-control">
            <label class="label">
              <span class="label-text">Work Email</span>
            </label>
            <input type="email" class="input input-primary w-full" placeholder="work@company.com" />
          </div>
          <div class="form-control">
            <label class="label">
              <span class="label-text">Personal Email</span>
            </label>
            <input type="email" class="input input-secondary w-full" placeholder="personal@email.com" />
          </div>
        </form>
      `;
      document.body.appendChild(container);
    });

    const container = page.locator("div").last();
    await expect(container).toHaveScreenshot("email-input-form-context.png");
  });

  test("email input placeholder behavior", async ({ page }) => {
    // Test placeholder text behavior
    await page.evaluate(() => {
      const container = document.createElement("div");
      container.className = "p-4 space-y-4";
      container.innerHTML = `
        <input type="email" class="input input-bordered w-full" placeholder="your@email.com" />
        <input type="email" class="input input-bordered w-full" placeholder="Enter your email address" />
        <input type="email" class="input input-bordered w-full" placeholder="user@domain.com" />
        <input type="email" class="input input-bordered w-full" placeholder="Very long placeholder text for email input field" />
      `;
      document.body.appendChild(container);
    });

    const container = page.locator("div").last();
    await expect(container).toHaveScreenshot("email-input-placeholder-behavior.png");
  });

  // Performance test - ensure consistent rendering
  test("email input rendering consistency", async ({ page }) => {
    // Test multiple renders for consistency
    for (let i = 0; i < 3; i++) {
      await page.reload();
      await page.waitForLoadState("networkidle");

      const emailInputSection = page.locator("section").filter({ hasText: "Basic Email Input" });
      await expect(emailInputSection).toHaveScreenshot(`email-input-render-${i}.png`);
    }
  });

  // Test email input with different required states
  test("email input required indicator", async ({ page }) => {
    // Test required field visual indicators
    await page.evaluate(() => {
      const container = document.createElement("div");
      container.className = "p-4 space-y-4";
      container.innerHTML = `
        <div class="form-control">
          <label class="label">
            <span class="label-text">Required Email <span class="text-red-500">*</span></span>
          </label>
          <input type="email" class="input input-bordered w-full" required placeholder="Required email" />
        </div>
        <div class="form-control">
          <label class="label">
            <span class="label-text">Optional Email</span>
          </label>
          <input type="email" class="input input-bordered w-full" placeholder="Optional email" />
        </div>
      `;
      document.body.appendChild(container);
    });

    const container = page.locator("div").last();
    await expect(container).toHaveScreenshot("email-input-required-indicator.png");
  });
});
