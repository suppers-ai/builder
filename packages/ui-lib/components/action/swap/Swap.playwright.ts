import { expect, test } from "@playwright/test";

test.describe("Swap Visual Tests", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to swap component page
    await page.goto("http://localhost:8001/components/action/swap");
    await page.waitForLoadState("networkidle");
  });

  test("swap variants visual regression", async ({ page }) => {
    // Test basic swap section - get the first card with swaps
    const basicSection = page.locator(".card").first();
    await expect(basicSection).toHaveScreenshot("swap-basic-variants.png");
  });

  test("swap animations visual regression", async ({ page }) => {
    // Test swap animations section
    const animationsSection = page.locator(".card").nth(1);
    await expect(animationsSection).toHaveScreenshot("swap-animations.png");
  });

  test("swap content types visual regression", async ({ page }) => {
    // Test swap with different content types
    const contentSection = page.locator(".card").nth(2);
    await expect(contentSection).toHaveScreenshot("swap-content-types.png");
  });

  test("swap states visual regression", async ({ page }) => {
    // Test different swap states and configurations
    const statesSection = page.locator(".card").nth(3);
    await expect(statesSection).toHaveScreenshot("swap-states.png");
  });

  // Theme testing
  test("swaps in different themes", async ({ page }) => {
    const themes = ["light", "dark", "cupcake", "cyberpunk", "synthwave"];

    for (const theme of themes) {
      // Change theme
      await page.evaluate((theme) => {
        document.documentElement.setAttribute("data-theme", theme);
      }, theme);

      // Wait for theme to apply
      await page.waitForTimeout(100);

      // Take screenshot of swap examples
      const swapSection = page.locator(".card").first();
      await expect(swapSection).toHaveScreenshot(`swaps-theme-${theme}.png`);
    }
  });

  // Responsive testing
  test("swaps responsive design", async ({ page }) => {
    const viewports = [
      { width: 375, height: 667, name: "mobile" },
      { width: 768, height: 1024, name: "tablet" },
      { width: 1920, height: 1080, name: "desktop" },
    ];

    for (const viewport of viewports) {
      await page.setViewportSize(viewport);

      const swapSection = page.locator(".card").first();
      await expect(swapSection).toHaveScreenshot(`swaps-${viewport.name}.png`);
    }
  });

  // Swap state testing
  test("swap active and inactive states", async ({ page }) => {
    // Create test swaps in both states for visual testing
    await page.evaluate(() => {
      const container = document.createElement("div");
      container.className = "p-4 space-y-4";
      container.innerHTML = `
        <div class="flex gap-4 items-center">
          <label class="swap">
            <input type="checkbox" />
            <div class="swap-on">ON</div>
            <div class="swap-off">OFF</div>
          </label>
          <span>Inactive</span>
        </div>
        <div class="flex gap-4 items-center">
          <label class="swap swap-active">
            <input type="checkbox" checked />
            <div class="swap-on">ON</div>
            <div class="swap-off">OFF</div>
          </label>
          <span>Active</span>
        </div>
      `;
      document.body.appendChild(container);
    });

    await page.waitForTimeout(500);

    const swapContainer = page.locator("body > div").last();
    await expect(swapContainer).toHaveScreenshot("swap-states.png");
  });

  // Swap animation testing
  test("swap animations visual regression", async ({ page }) => {
    // Test different swap animations
    await page.evaluate(() => {
      const container = document.createElement("div");
      container.className = "p-8 space-y-6 grid grid-cols-2 gap-8";
      container.innerHTML = `
        <div class="text-center">
          <h3 class="mb-4 font-bold">Rotate Animation</h3>
          <label class="swap swap-rotate">
            <input type="checkbox" />
            <div class="swap-on">🌞</div>
            <div class="swap-off">🌙</div>
          </label>
        </div>
        <div class="text-center">
          <h3 class="mb-4 font-bold">Flip Animation</h3>
          <label class="swap swap-flip">
            <input type="checkbox" />
            <div class="swap-on">😊</div>
            <div class="swap-off">😴</div>
          </label>
        </div>
        <div class="text-center">
          <h3 class="mb-4 font-bold">Active Rotate</h3>
          <label class="swap swap-rotate swap-active">
            <input type="checkbox" checked />
            <div class="swap-on">🔊</div>
            <div class="swap-off">🔇</div>
          </label>
        </div>
        <div class="text-center">
          <h3 class="mb-4 font-bold">Active Flip</h3>
          <label class="swap swap-flip swap-active">
            <input type="checkbox" checked />
            <div class="swap-on">👍</div>
            <div class="swap-off">👎</div>
          </label>
        </div>
      `;
      document.body.appendChild(container);
    });

    const container = page.locator("body > div").last();
    await expect(container).toHaveScreenshot("swap-animations.png");
  });

  // Swap content types testing
  test("swap with different content types", async ({ page }) => {
    await page.evaluate(() => {
      const container = document.createElement("div");
      container.className = "p-4 space-y-6";
      container.innerHTML = `
        <div class="text-center">
          <h3 class="mb-4 font-bold">Text Swap</h3>
          <label class="swap">
            <input type="checkbox" />
            <div class="swap-on">Show</div>
            <div class="swap-off">Hide</div>
          </label>
        </div>
        <div class="text-center">
          <h3 class="mb-4 font-bold">Icon Swap</h3>
          <label class="swap swap-rotate">
            <input type="checkbox" />
            <div class="swap-on">✓</div>
            <div class="swap-off">✗</div>
          </label>
        </div>
        <div class="text-center">
          <h3 class="mb-4 font-bold">Button Swap</h3>
          <label class="swap">
            <input type="checkbox" />
            <div class="swap-on">
              <button class="btn btn-primary">Stop</button>
            </div>
            <div class="swap-off">
              <button class="btn btn-secondary">Start</button>
            </div>
          </label>
        </div>
        <div class="text-center">
          <h3 class="mb-4 font-bold">Complex Swap</h3>
          <label class="swap swap-flip">
            <input type="checkbox" />
            <div class="swap-on">
              <div class="flex items-center gap-2 p-2 bg-success text-success-content rounded">
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                </svg>
                <span>Connected</span>
              </div>
            </div>
            <div class="swap-off">
              <div class="flex items-center gap-2 p-2 bg-error text-error-content rounded">
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"/>
                </svg>
                <span>Disconnected</span>
              </div>
            </div>
          </label>
        </div>
      `;
      document.body.appendChild(container);
    });

    const container = page.locator("body > div").last();
    await expect(container).toHaveScreenshot("swap-content-types.png");
  });

  // Accessibility testing
  test("swap accessibility visual regression", async ({ page }) => {
    // Test high contrast mode
    await page.emulateMedia({ reducedMotion: "reduce" });

    const swapSection = page.locator(".card").first();
    await expect(swapSection).toHaveScreenshot("swaps-reduced-motion.png");
  });

  // Hover states testing
  test("swap hover states", async ({ page }) => {
    await page.evaluate(() => {
      const container = document.createElement("div");
      container.className = "p-4 space-y-4";
      container.innerHTML = `
        <div class="text-center">
          <h3 class="mb-4 font-bold">Hover to See Effect</h3>
          <label class="swap swap-rotate cursor-pointer hover:scale-110 transition-transform">
            <input type="checkbox" />
            <div class="swap-on text-2xl">🌞</div>
            <div class="swap-off text-2xl">🌙</div>
          </label>
        </div>
      `;
      document.body.appendChild(container);
    });

    const swapElement = page.locator(".swap").last();

    // Take screenshot in normal state
    await expect(swapElement).toHaveScreenshot("swap-normal-state.png");

    // Hover and take screenshot
    await swapElement.hover();
    await page.waitForTimeout(200);
    await expect(swapElement).toHaveScreenshot("swap-hover-state.png");
  });

  // Size variations testing
  test("swap size variations", async ({ page }) => {
    await page.evaluate(() => {
      const container = document.createElement("div");
      container.className = "p-4 space-y-6 text-center";
      container.innerHTML = `
        <div>
          <h3 class="mb-4 font-bold">Small Swap</h3>
          <label class="swap text-sm">
            <input type="checkbox" />
            <div class="swap-on">ON</div>
            <div class="swap-off">OFF</div>
          </label>
        </div>
        <div>
          <h3 class="mb-4 font-bold">Normal Swap</h3>
          <label class="swap">
            <input type="checkbox" />
            <div class="swap-on">ON</div>
            <div class="swap-off">OFF</div>
          </label>
        </div>
        <div>
          <h3 class="mb-4 font-bold">Large Swap</h3>
          <label class="swap text-lg">
            <input type="checkbox" />
            <div class="swap-on">ON</div>
            <div class="swap-off">OFF</div>
          </label>
        </div>
        <div>
          <h3 class="mb-4 font-bold">Extra Large Swap</h3>
          <label class="swap text-2xl">
            <input type="checkbox" />
            <div class="swap-on">ON</div>
            <div class="swap-off">OFF</div>
          </label>
        </div>
      `;
      document.body.appendChild(container);
    });

    const container = page.locator("body > div").last();
    await expect(container).toHaveScreenshot("swap-size-variations.png");
  });
});
