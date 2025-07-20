import { expect, test } from "@playwright/test";

test.describe("PasswordInput Visual Tests", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:8001/components/input/password-input");
    await page.waitForLoadState("networkidle");
  });

  test("password input basic variants visual regression", async ({ page }) => {
    const basicSection = page.locator(".card").first();
    await expect(basicSection).toHaveScreenshot("password-input-basic-variants.png");
  });

  test("password input sizes visual regression", async ({ page }) => {
    const sizesSection = page.locator(".card").nth(1);
    await expect(sizesSection).toHaveScreenshot("password-input-sizes.png");
  });

  test("password input states visual regression", async ({ page }) => {
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(500);

    const statesSection = page.locator(".card").nth(2);
    await expect(statesSection).toHaveScreenshot("password-input-states.png");
  });

  test("password input focus states", async ({ page }) => {
    const passwordInput = page.locator('input[type="password"]').first();

    // Normal state
    await expect(passwordInput).toHaveScreenshot("password-input-normal.png");

    // Focus state
    await passwordInput.focus();
    await expect(passwordInput).toHaveScreenshot("password-input-focus.png");
  });

  test("password input hover states", async ({ page }) => {
    const passwordInput = page.locator('input[type="password"]').first();

    // Hover state
    await passwordInput.hover();
    await expect(passwordInput).toHaveScreenshot("password-input-hover.png");
  });

  test("password input with visibility toggle", async ({ page }) => {
    // Test password visibility toggle if present
    const toggleButtons = page.locator(
      'button:has-text("Show"), button:has-text("Hide"), .password-toggle',
    );
    const hasToggle = await toggleButtons.count() > 0;

    if (hasToggle) {
      const toggleSection = page.locator(
        '.card:has(button:has-text("Show"), button:has-text("Hide"))',
      );
      await expect(toggleSection).toHaveScreenshot("password-input-with-toggle.png");

      // Click toggle and capture state
      await toggleButtons.first().click();
      await expect(toggleSection).toHaveScreenshot("password-input-toggle-active.png");
    }
  });

  // Theme testing
  test("password inputs in different themes", async ({ page }) => {
    const themes = ["light", "dark", "cupcake", "cyberpunk", "synthwave"];

    for (const theme of themes) {
      await page.evaluate((theme) => {
        document.documentElement.setAttribute("data-theme", theme);
      }, theme);

      await page.waitForTimeout(100);

      const inputSection = page.locator(".card").first();
      await expect(inputSection).toHaveScreenshot(`password-input-theme-${theme}.png`);
    }
  });

  // Responsive testing
  test("password inputs responsive design", async ({ page }) => {
    const viewports = [
      { width: 375, height: 667, name: "mobile" },
      { width: 768, height: 1024, name: "tablet" },
      { width: 1920, height: 1080, name: "desktop" },
    ];

    for (const viewport of viewports) {
      await page.setViewportSize(viewport);

      const inputSection = page.locator(".card").first();
      await expect(inputSection).toHaveScreenshot(`password-input-${viewport.name}.png`);
    }
  });

  test("password input with different configurations", async ({ page }) => {
    await page.evaluate(() => {
      const container = document.createElement("div");
      container.className = "p-4 space-y-4";
      container.innerHTML = `
        <input type="password" placeholder="Enter password" class="input input-bordered" />
        <input type="password" value="password123" class="input input-bordered" />
        <input type="password" placeholder="Confirm password" class="input input-bordered input-primary" />
        <input type="password" placeholder="Error state" class="input input-bordered input-error" />
        <input type="password" placeholder="Success state" class="input input-bordered input-success" />
        <input type="password" placeholder="Disabled" class="input input-bordered" disabled />
      `;
      document.body.appendChild(container);
    });

    const container = page.locator("div").last();
    await expect(container).toHaveScreenshot("password-input-different-configs.png");
  });

  test("password input security masking", async ({ page }) => {
    // Test that password characters are properly masked
    await page.evaluate(() => {
      const container = document.createElement("div");
      container.className = "p-4 space-y-4";
      container.innerHTML = `
        <input type="password" value="secretpassword" class="input input-bordered" />
        <input type="password" value="another_password_123" class="input input-bordered" />
        <input type="password" value="!@#$%^&*()" class="input input-bordered" />
      `;
      document.body.appendChild(container);
    });

    const container = page.locator("div").last();
    await expect(container).toHaveScreenshot("password-input-masked-values.png");
  });
});
