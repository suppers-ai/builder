import { expect, test } from "@playwright/test";

test.describe("Alert Visual Tests", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to alert component page
    await page.goto("http://localhost:8001/components/feedback/alert");
    await page.waitForLoadState("networkidle");
  });

  test("alert variants visual regression", async ({ page }) => {
    // Test basic alert section - get the first card with alerts
    const basicSection = page.locator(".card").first();
    await expect(basicSection).toHaveScreenshot("alert-basic-variants.png");
  });

  test("alert colors visual regression", async ({ page }) => {
    // Test alert colors section
    const colorsSection = page.locator(".card").nth(1);
    await expect(colorsSection).toHaveScreenshot("alert-colors.png");
  });

  test("alert with actions visual regression", async ({ page }) => {
    // Test alert with actions section
    const actionsSection = page.locator(".card").nth(2);
    await expect(actionsSection).toHaveScreenshot("alert-actions.png");
  });

  test("alert dismissible visual regression", async ({ page }) => {
    // Test dismissible alerts section
    const dismissibleSection = page.locator(".card").nth(3);
    await expect(dismissibleSection).toHaveScreenshot("alert-dismissible.png");
  });

  // Theme testing
  test("alerts in different themes", async ({ page }) => {
    const themes = ["light", "dark", "cupcake", "cyberpunk", "synthwave"];

    for (const theme of themes) {
      // Change theme
      await page.evaluate((theme) => {
        document.documentElement.setAttribute("data-theme", theme);
      }, theme);

      // Wait for theme to apply
      await page.waitForTimeout(100);

      // Take screenshot of alert examples
      const alertSection = page.locator(".card").first();
      await expect(alertSection).toHaveScreenshot(`alerts-theme-${theme}.png`);
    }
  });

  // Responsive testing
  test("alerts responsive design", async ({ page }) => {
    const viewports = [
      { width: 375, height: 667, name: "mobile" },
      { width: 768, height: 1024, name: "tablet" },
      { width: 1920, height: 1080, name: "desktop" },
    ];

    for (const viewport of viewports) {
      await page.setViewportSize(viewport);

      const alertSection = page.locator(".card").first();
      await expect(alertSection).toHaveScreenshot(`alerts-${viewport.name}.png`);
    }
  });

  // Alert color variations
  test("alert color variations visual regression", async ({ page }) => {
    await page.evaluate(() => {
      const container = document.createElement("div");
      container.className = "p-8 space-y-4";
      container.innerHTML = `
        <div class="alert alert-info">
          <span>ℹ️</span>
          <span>Info alert - General information</span>
        </div>
        <div class="alert alert-success">
          <span>✅</span>
          <span>Success alert - Operation completed successfully</span>
        </div>
        <div class="alert alert-warning">
          <span>⚠️</span>
          <span>Warning alert - Please review this action</span>
        </div>
        <div class="alert alert-error">
          <span>❌</span>
          <span>Error alert - Something went wrong</span>
        </div>
      `;
      document.body.appendChild(container);
    });

    const container = page.locator("body > div").last();
    await expect(container).toHaveScreenshot("alert-color-variations.png");
  });

  // Alert with actions
  test("alert actions visual regression", async ({ page }) => {
    await page.evaluate(() => {
      const container = document.createElement("div");
      container.className = "p-8 space-y-6";
      container.innerHTML = `
        <div class="alert alert-info">
          <span>ℹ️</span>
          <span>New software update available!</span>
          <div>
            <button class="btn btn-sm">Details</button>
            <button class="btn btn-sm btn-primary">Update</button>
          </div>
        </div>
        <div class="alert alert-warning">
          <span>⚠️</span>
          <span>Your subscription expires soon</span>
          <div>
            <button class="btn btn-sm btn-ghost">Remind Later</button>
            <button class="btn btn-sm btn-warning">Renew</button>
          </div>
        </div>
        <div class="alert alert-success">
          <span>✅</span>
          <span>Payment processed successfully</span>
          <div>
            <button class="btn btn-sm btn-outline">View Receipt</button>
            <button class="btn btn-sm btn-success">Continue</button>
          </div>
        </div>
      `;
      document.body.appendChild(container);
    });

    const container = page.locator("body > div").last();
    await expect(container).toHaveScreenshot("alert-with-actions.png");
  });

  // Dismissible alerts
  test("dismissible alerts visual regression", async ({ page }) => {
    await page.evaluate(() => {
      const container = document.createElement("div");
      container.className = "p-8 space-y-4";
      container.innerHTML = `
        <div class="alert alert-info">
          <span>ℹ️</span>
          <span>This is a dismissible info alert</span>
          <button class="btn btn-sm btn-circle btn-ghost">✕</button>
        </div>
        <div class="alert alert-success">
          <span>✅</span>
          <span>Operation completed - you can dismiss this</span>
          <button class="btn btn-sm btn-circle btn-ghost">✕</button>
        </div>
        <div class="alert alert-warning">
          <span>⚠️</span>
          <span>Warning message with dismiss option</span>
          <button class="btn btn-sm btn-circle btn-ghost">✕</button>
        </div>
        <div class="alert alert-error">
          <span>❌</span>
          <span>Error alert that can be dismissed</span>
          <button class="btn btn-sm btn-circle btn-ghost">✕</button>
        </div>
      `;
      document.body.appendChild(container);
    });

    const container = page.locator("body > div").last();
    await expect(container).toHaveScreenshot("dismissible-alerts.png");
  });

  // Alert content variations
  test("alert content variations visual regression", async ({ page }) => {
    await page.evaluate(() => {
      const container = document.createElement("div");
      container.className = "p-8 space-y-6";
      container.innerHTML = `
        <div class="alert alert-info">
          <span>ℹ️</span>
          <span>Simple text alert</span>
        </div>
        <div class="alert alert-success">
          <span>✅</span>
          <div>
            <h3 class="font-bold">Success!</h3>
            <div class="text-xs">Your account has been created successfully.</div>
          </div>
        </div>
        <div class="alert alert-warning">
          <span>⚠️</span>
          <div>
            <h3 class="font-bold">Storage Almost Full</h3>
            <div class="text-xs">You have used 95% of your storage quota.</div>
          </div>
          <div>
            <button class="btn btn-sm btn-ghost">Manage Storage</button>
            <button class="btn btn-sm btn-warning">Upgrade Plan</button>
          </div>
        </div>
        <div class="alert alert-error">
          <span>❌</span>
          <div>
            <h3 class="font-bold">Connection Failed</h3>
            <div class="text-xs">Could not connect to the server. Please check your internet connection.</div>
          </div>
          <div>
            <button class="btn btn-sm btn-ghost">Retry</button>
            <button class="btn btn-sm btn-error">Report Issue</button>
          </div>
          <button class="btn btn-sm btn-circle btn-ghost">✕</button>
        </div>
      `;
      document.body.appendChild(container);
    });

    const container = page.locator("body > div").last();
    await expect(container).toHaveScreenshot("alert-content-variations.png");
  });

  // Alert icons and customization
  test("alert icons visual regression", async ({ page }) => {
    await page.evaluate(() => {
      const container = document.createElement("div");
      container.className = "p-8 space-y-4";
      container.innerHTML = `
        <div class="alert alert-info">
          <span>💡</span>
          <span>Custom lightbulb icon for tips</span>
        </div>
        <div class="alert alert-success">
          <span>🎉</span>
          <span>Celebration icon for achievements</span>
        </div>
        <div class="alert alert-warning">
          <span>🔔</span>
          <span>Bell icon for notifications</span>
        </div>
        <div class="alert alert-error">
          <span>🚨</span>
          <span>Siren icon for critical errors</span>
        </div>
        <div class="alert alert-info">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="stroke-current shrink-0 w-6 h-6">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <span>SVG icon for info alerts</span>
        </div>
      `;
      document.body.appendChild(container);
    });

    const container = page.locator("body > div").last();
    await expect(container).toHaveScreenshot("alert-custom-icons.png");
  });

  // Alert layouts and positioning
  test("alert layouts visual regression", async ({ page }) => {
    await page.evaluate(() => {
      const container = document.createElement("div");
      container.className = "p-8 space-y-6";
      container.innerHTML = `
        <div class="space-y-4">
          <h3 class="font-bold">Full Width Alerts</h3>
          <div class="alert alert-info">
            <span>ℹ️</span>
            <span>Full width alert taking complete container space</span>
          </div>
        </div>
        <div class="space-y-4">
          <h3 class="font-bold">Fixed Width Alerts</h3>
          <div class="alert alert-success max-w-md">
            <span>✅</span>
            <span>Fixed width alert with max-width constraint</span>
          </div>
        </div>
        <div class="space-y-4">
          <h3 class="font-bold">Centered Alert</h3>
          <div class="flex justify-center">
            <div class="alert alert-warning max-w-sm">
              <span>⚠️</span>
              <span>Centered alert</span>
            </div>
          </div>
        </div>
        <div class="space-y-4">
          <h3 class="font-bold">Inline Alerts</h3>
          <div class="flex gap-4">
            <div class="alert alert-info flex-1">
              <span>ℹ️</span>
              <span>Inline alert 1</span>
            </div>
            <div class="alert alert-success flex-1">
              <span>✅</span>
              <span>Inline alert 2</span>
            </div>
          </div>
        </div>
      `;
      document.body.appendChild(container);
    });

    const container = page.locator("body > div").last();
    await expect(container).toHaveScreenshot("alert-layouts.png");
  });

  // Alert states and interactions
  test("alert states visual regression", async ({ page }) => {
    await page.evaluate(() => {
      const container = document.createElement("div");
      container.className = "p-8 space-y-4";
      container.innerHTML = `
        <div class="alert alert-info">
          <span>ℹ️</span>
          <span>Normal state alert</span>
        </div>
        <div class="alert alert-info opacity-50">
          <span>ℹ️</span>
          <span>Disabled/faded state alert</span>
        </div>
        <div class="alert alert-info shadow-lg">
          <span>ℹ️</span>
          <span>Enhanced shadow alert</span>
        </div>
        <div class="alert alert-info border-2 border-info">
          <span>ℹ️</span>
          <span>Alert with custom border</span>
        </div>
      `;
      document.body.appendChild(container);
    });

    const container = page.locator("body > div").last();
    await expect(container).toHaveScreenshot("alert-states.png");
  });

  // Accessibility testing
  test("alert accessibility visual regression", async ({ page }) => {
    // Test high contrast mode
    await page.emulateMedia({ reducedMotion: "reduce" });

    const alertSection = page.locator(".card").first();
    await expect(alertSection).toHaveScreenshot("alerts-reduced-motion.png");
  });

  // Alert in context (forms, cards, etc.)
  test("alert in context visual regression", async ({ page }) => {
    await page.evaluate(() => {
      const container = document.createElement("div");
      container.className = "p-8 space-y-6";
      container.innerHTML = `
        <div class="card bg-base-100 shadow-xl">
          <div class="card-body">
            <h2 class="card-title">Form with Validation</h2>
            <div class="form-control">
              <label class="label">
                <span class="label-text">Email</span>
              </label>
              <input type="text" placeholder="email@example.com" class="input input-bordered" />
            </div>
            <div class="alert alert-error mt-2">
              <span>❌</span>
              <span>Please enter a valid email address</span>
            </div>
            <div class="card-actions justify-end mt-4">
              <button class="btn btn-primary">Submit</button>
            </div>
          </div>
        </div>
        <div class="navbar bg-base-100">
          <div class="flex-1">
            <a class="btn btn-ghost normal-case text-xl">App Name</a>
          </div>
          <div class="flex-none">
            <div class="alert alert-warning alert-sm">
              <span>⚠️</span>
              <span class="text-xs">Maintenance in 1 hour</span>
            </div>
          </div>
        </div>
      `;
      document.body.appendChild(container);
    });

    const container = page.locator("body > div").last();
    await expect(container).toHaveScreenshot("alert-in-context.png");
  });
});
