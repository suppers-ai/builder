import { expect, test } from "@playwright/test";

test.describe("Modal Visual Tests", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to modal component page
    await page.goto("http://localhost:8001/components/action/modal");
    await page.waitForLoadState("networkidle");
  });

  test("modal variants visual regression", async ({ page }) => {
    // Test basic modal section - get the first card with modals
    const basicSection = page.locator(".card").first();
    await expect(basicSection).toHaveScreenshot("modal-basic-variants.png");
  });

  test("modal sizes visual regression", async ({ page }) => {
    // Test modal sizes section
    const sizesSection = page.locator(".card").nth(1);
    await expect(sizesSection).toHaveScreenshot("modal-sizes.png");
  });

  test("modal with actions visual regression", async ({ page }) => {
    // Test modal with action buttons
    const actionsSection = page.locator(".card").nth(2);
    await expect(actionsSection).toHaveScreenshot("modal-actions.png");
  });

  test("modal states visual regression", async ({ page }) => {
    // Test different modal states and configurations
    const statesSection = page.locator(".card").nth(3);
    await expect(statesSection).toHaveScreenshot("modal-states.png");
  });

  // Theme testing
  test("modals in different themes", async ({ page }) => {
    const themes = ["light", "dark", "cupcake", "cyberpunk", "synthwave"];

    for (const theme of themes) {
      // Change theme
      await page.evaluate((theme) => {
        document.documentElement.setAttribute("data-theme", theme);
      }, theme);

      // Wait for theme to apply
      await page.waitForTimeout(100);

      // Take screenshot of modal examples
      const modalSection = page.locator(".card").first();
      await expect(modalSection).toHaveScreenshot(`modals-theme-${theme}.png`);
    }
  });

  // Responsive testing
  test("modals responsive design", async ({ page }) => {
    const viewports = [
      { width: 375, height: 667, name: "mobile" },
      { width: 768, height: 1024, name: "tablet" },
      { width: 1920, height: 1080, name: "desktop" },
    ];

    for (const viewport of viewports) {
      await page.setViewportSize(viewport);

      const modalSection = page.locator(".card").first();
      await expect(modalSection).toHaveScreenshot(`modals-${viewport.name}.png`);
    }
  });

  // Modal backdrop testing
  test("modal backdrop visual regression", async ({ page }) => {
    // Create a test modal with backdrop for visual testing
    await page.evaluate(() => {
      const container = document.createElement("div");
      container.className = "p-4";
      container.innerHTML = `
        <div class="modal modal-open">
          <div class="modal-box">
            <h3 class="font-bold text-lg">Test Modal</h3>
            <p class="py-4">This modal shows backdrop behavior</p>
            <div class="modal-action">
              <button class="btn">Close</button>
            </div>
          </div>
          <div class="modal-backdrop"></div>
        </div>
      `;
      document.body.appendChild(container);
    });

    await page.waitForTimeout(500);

    const modalContainer = page.locator(".modal-open").last();
    await expect(modalContainer).toHaveScreenshot("modal-backdrop.png");
  });

  // Modal overlay and positioning
  test("modal positioning visual regression", async ({ page }) => {
    // Test different modal positioning
    await page.evaluate(() => {
      const container = document.createElement("div");
      container.className = "p-4 space-y-4";
      container.innerHTML = `
        <div class="modal modal-open">
          <div class="modal-box modal-top">
            <h3 class="font-bold text-lg">Top Modal</h3>
            <p>Modal positioned at top</p>
          </div>
        </div>
        <div class="modal modal-open">
          <div class="modal-box modal-middle">
            <h3 class="font-bold text-lg">Middle Modal</h3>
            <p>Modal positioned at middle</p>
          </div>
        </div>
        <div class="modal modal-open">
          <div class="modal-box modal-bottom">
            <h3 class="font-bold text-lg">Bottom Modal</h3>
            <p>Modal positioned at bottom</p>
          </div>
        </div>
      `;
      document.body.appendChild(container);
    });

    const container = page.locator("body > div").last();
    await expect(container).toHaveScreenshot("modal-positions.png");
  });

  // Accessibility testing
  test("modal accessibility visual regression", async ({ page }) => {
    // Test high contrast mode
    await page.emulateMedia({ reducedMotion: "reduce" });

    const modalSection = page.locator(".card").first();
    await expect(modalSection).toHaveScreenshot("modals-reduced-motion.png");
  });

  // Modal content overflow testing
  test("modal with long content", async ({ page }) => {
    await page.evaluate(() => {
      const container = document.createElement("div");
      container.className = "p-4";
      container.innerHTML = `
        <div class="modal modal-open">
          <div class="modal-box">
            <h3 class="font-bold text-lg">Long Content Modal</h3>
            <div class="py-4">
              <p>This is a modal with very long content that should test scrolling behavior.</p>
              ${
        Array(20).fill(
          '<p class="mb-2">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>',
        ).join("")
      }
            </div>
            <div class="modal-action">
              <button class="btn">Close</button>
              <button class="btn btn-primary">Save</button>
            </div>
          </div>
          <div class="modal-backdrop"></div>
        </div>
      `;
      document.body.appendChild(container);
    });

    const modalContainer = page.locator(".modal-open").last();
    await expect(modalContainer).toHaveScreenshot("modal-long-content.png");
  });
});
