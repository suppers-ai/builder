import { expect, test } from "@playwright/test";

test.describe("Badge Visual Tests", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to badge component page
    await page.goto("http://localhost:8001/components/display/badge");
    await page.waitForLoadState("networkidle");
  });

  test("badge variants visual regression", async ({ page }) => {
    // Test basic badge section - get the first card with badges
    const basicSection = page.locator(".card").first();
    await expect(basicSection).toHaveScreenshot("badge-basic-variants.png");
  });

  test("badge colors visual regression", async ({ page }) => {
    // Test badge colors section
    const colorsSection = page.locator(".card").nth(1);
    await expect(colorsSection).toHaveScreenshot("badge-colors.png");
  });

  test("badge sizes visual regression", async ({ page }) => {
    // Test badge sizes section
    const sizesSection = page.locator(".card").nth(2);
    await expect(sizesSection).toHaveScreenshot("badge-sizes.png");
  });

  test("badge indicators visual regression", async ({ page }) => {
    // Test badge indicators/positioned badges
    const indicatorsSection = page.locator(".card").nth(3);
    await expect(indicatorsSection).toHaveScreenshot("badge-indicators.png");
  });

  // Theme testing
  test("badges in different themes", async ({ page }) => {
    const themes = ["light", "dark", "cupcake", "cyberpunk", "synthwave"];

    for (const theme of themes) {
      // Change theme
      await page.evaluate((theme) => {
        document.documentElement.setAttribute("data-theme", theme);
      }, theme);

      // Wait for theme to apply
      await page.waitForTimeout(100);

      // Take screenshot of badge examples
      const badgeSection = page.locator(".card").first();
      await expect(badgeSection).toHaveScreenshot(`badges-theme-${theme}.png`);
    }
  });

  // Responsive testing
  test("badges responsive design", async ({ page }) => {
    const viewports = [
      { width: 375, height: 667, name: "mobile" },
      { width: 768, height: 1024, name: "tablet" },
      { width: 1920, height: 1080, name: "desktop" },
    ];

    for (const viewport of viewports) {
      await page.setViewportSize(viewport);

      const badgeSection = page.locator(".card").first();
      await expect(badgeSection).toHaveScreenshot(`badges-${viewport.name}.png`);
    }
  });

  // Badge color variations
  test("badge color variations visual regression", async ({ page }) => {
    await page.evaluate(() => {
      const container = document.createElement("div");
      container.className = "p-8 space-y-4";
      container.innerHTML = `
        <div class="flex flex-wrap gap-2">
          <div class="badge">Default</div>
          <div class="badge badge-primary">Primary</div>
          <div class="badge badge-secondary">Secondary</div>
          <div class="badge badge-accent">Accent</div>
          <div class="badge badge-neutral">Neutral</div>
        </div>
        <div class="flex flex-wrap gap-2">
          <div class="badge badge-info">Info</div>
          <div class="badge badge-success">Success</div>
          <div class="badge badge-warning">Warning</div>
          <div class="badge badge-error">Error</div>
        </div>
      `;
      document.body.appendChild(container);
    });

    const container = page.locator("body > div").last();
    await expect(container).toHaveScreenshot("badge-color-variations.png");
  });

  // Badge size variations
  test("badge size variations visual regression", async ({ page }) => {
    await page.evaluate(() => {
      const container = document.createElement("div");
      container.className = "p-8 space-y-4";
      container.innerHTML = `
        <div class="flex items-center gap-4">
          <div class="badge badge-xs badge-primary">XS</div>
          <span>Extra Small</span>
        </div>
        <div class="flex items-center gap-4">
          <div class="badge badge-sm badge-primary">SM</div>
          <span>Small</span>
        </div>
        <div class="flex items-center gap-4">
          <div class="badge badge-md badge-primary">MD</div>
          <span>Medium</span>
        </div>
        <div class="flex items-center gap-4">
          <div class="badge badge-lg badge-primary">LG</div>
          <span>Large</span>
        </div>
      `;
      document.body.appendChild(container);
    });

    const container = page.locator("body > div").last();
    await expect(container).toHaveScreenshot("badge-size-variations.png");
  });

  // Badge variants (outline, ghost)
  test("badge variant styles visual regression", async ({ page }) => {
    await page.evaluate(() => {
      const container = document.createElement("div");
      container.className = "p-8 space-y-6";
      container.innerHTML = `
        <div>
          <h3 class="mb-4 font-bold">Solid Badges</h3>
          <div class="flex flex-wrap gap-2">
            <div class="badge badge-primary">Primary</div>
            <div class="badge badge-secondary">Secondary</div>
            <div class="badge badge-accent">Accent</div>
            <div class="badge badge-neutral">Neutral</div>
          </div>
        </div>
        <div>
          <h3 class="mb-4 font-bold">Outline Badges</h3>
          <div class="flex flex-wrap gap-2">
            <div class="badge badge-outline badge-primary">Primary</div>
            <div class="badge badge-outline badge-secondary">Secondary</div>
            <div class="badge badge-outline badge-accent">Accent</div>
            <div class="badge badge-outline badge-neutral">Neutral</div>
          </div>
        </div>
        <div>
          <h3 class="mb-4 font-bold">Ghost Badges</h3>
          <div class="flex flex-wrap gap-2">
            <div class="badge badge-ghost badge-primary">Primary</div>
            <div class="badge badge-ghost badge-secondary">Secondary</div>
            <div class="badge badge-ghost badge-accent">Accent</div>
            <div class="badge badge-ghost badge-neutral">Neutral</div>
          </div>
        </div>
      `;
      document.body.appendChild(container);
    });

    const container = page.locator("body > div").last();
    await expect(container).toHaveScreenshot("badge-variant-styles.png");
  });

  // Badge indicators/positioned badges
  test("badge indicators visual regression", async ({ page }) => {
    await page.evaluate(() => {
      const container = document.createElement("div");
      container.className = "p-8 space-y-8 grid grid-cols-2 gap-8";
      container.innerHTML = `
        <div class="text-center">
          <h3 class="mb-4 font-bold">Top Right</h3>
          <div class="indicator">
            <span class="indicator-item badge badge-secondary">99+</span>
            <div class="grid w-32 h-32 bg-base-300 place-items-center">content</div>
          </div>
        </div>
        <div class="text-center">
          <h3 class="mb-4 font-bold">Top Left</h3>
          <div class="indicator">
            <span class="indicator-item badge badge-primary indicator-top indicator-start">new</span>
            <div class="grid w-32 h-32 bg-base-300 place-items-center">content</div>
          </div>
        </div>
        <div class="text-center">
          <h3 class="mb-4 font-bold">Bottom Right</h3>
          <div class="indicator">
            <span class="indicator-item badge badge-accent indicator-bottom indicator-end">!</span>
            <div class="grid w-32 h-32 bg-base-300 place-items-center">content</div>
          </div>
        </div>
        <div class="text-center">
          <h3 class="mb-4 font-bold">Bottom Left</h3>
          <div class="indicator">
            <span class="indicator-item badge badge-warning indicator-bottom indicator-start">★</span>
            <div class="grid w-32 h-32 bg-base-300 place-items-center">content</div>
          </div>
        </div>
      `;
      document.body.appendChild(container);
    });

    const container = page.locator("body > div").last();
    await expect(container).toHaveScreenshot("badge-indicators.png");
  });

  // Badge with buttons
  test("badge with buttons visual regression", async ({ page }) => {
    await page.evaluate(() => {
      const container = document.createElement("div");
      container.className = "p-8 space-y-6";
      container.innerHTML = `
        <div class="text-center">
          <h3 class="mb-4 font-bold">Badge on Button</h3>
          <div class="indicator">
            <span class="indicator-item badge badge-error">5</span>
            <button class="btn">Notifications</button>
          </div>
        </div>
        <div class="text-center">
          <h3 class="mb-4 font-bold">Badge on Avatar</h3>
          <div class="indicator">
            <span class="indicator-item badge badge-success">online</span>
            <div class="avatar">
              <div class="w-16 h-16 rounded-full bg-neutral text-neutral-content">
                <span>JD</span>
              </div>
            </div>
          </div>
        </div>
        <div class="text-center">
          <h3 class="mb-4 font-bold">Badge on Card</h3>
          <div class="indicator">
            <span class="indicator-item badge badge-primary">NEW</span>
            <div class="card w-64 bg-base-100 shadow-md">
              <div class="card-body">
                <h2 class="card-title">Card Title</h2>
                <p>Card content goes here</p>
              </div>
            </div>
          </div>
        </div>
      `;
      document.body.appendChild(container);
    });

    const container = page.locator("body > div").last();
    await expect(container).toHaveScreenshot("badge-with-components.png");
  });

  // Badge content types
  test("badge content types visual regression", async ({ page }) => {
    await page.evaluate(() => {
      const container = document.createElement("div");
      container.className = "p-8 space-y-6";
      container.innerHTML = `
        <div>
          <h3 class="mb-4 font-bold">Text Badges</h3>
          <div class="flex flex-wrap gap-2">
            <div class="badge badge-primary">Text</div>
            <div class="badge badge-secondary">Label</div>
            <div class="badge badge-accent">Category</div>
            <div class="badge badge-neutral">Status</div>
          </div>
        </div>
        <div>
          <h3 class="mb-4 font-bold">Number Badges</h3>
          <div class="flex flex-wrap gap-2">
            <div class="badge badge-info">1</div>
            <div class="badge badge-success">42</div>
            <div class="badge badge-warning">99+</div>
            <div class="badge badge-error">∞</div>
          </div>
        </div>
        <div>
          <h3 class="mb-4 font-bold">Symbol Badges</h3>
          <div class="flex flex-wrap gap-2">
            <div class="badge badge-primary">★</div>
            <div class="badge badge-secondary">♥</div>
            <div class="badge badge-accent">✓</div>
            <div class="badge badge-neutral">!</div>
          </div>
        </div>
        <div>
          <h3 class="mb-4 font-bold">Empty Badges</h3>
          <div class="flex flex-wrap gap-2">
            <div class="badge badge-primary w-3 h-3"></div>
            <div class="badge badge-secondary w-3 h-3"></div>
            <div class="badge badge-accent w-3 h-3"></div>
            <div class="badge badge-neutral w-3 h-3"></div>
          </div>
        </div>
      `;
      document.body.appendChild(container);
    });

    const container = page.locator("body > div").last();
    await expect(container).toHaveScreenshot("badge-content-types.png");
  });

  // Badge in lists and navigation
  test("badge in context visual regression", async ({ page }) => {
    await page.evaluate(() => {
      const container = document.createElement("div");
      container.className = "p-8 space-y-6";
      container.innerHTML = `
        <div>
          <h3 class="mb-4 font-bold">Navigation with Badges</h3>
          <div class="navbar bg-base-100">
            <div class="navbar-start">
              <div class="dropdown">
                <div tabindex="0" role="button" class="btn btn-ghost btn-circle">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h7"></path>
                  </svg>
                </div>
              </div>
            </div>
            <div class="navbar-center">
              <a class="btn btn-ghost normal-case text-xl">App Name</a>
            </div>
            <div class="navbar-end">
              <div class="indicator">
                <span class="indicator-item badge badge-primary">3</span>
                <button class="btn btn-ghost btn-circle">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-5 5V17zm-5-5h5l5-5H10v5z"></path>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
        <div>
          <h3 class="mb-4 font-bold">List with Badges</h3>
          <ul class="menu bg-base-100 w-56 p-2 rounded-box">
            <li><a>Item 1 <div class="badge badge-primary">new</div></a></li>
            <li><a>Item 2 <div class="badge badge-secondary">hot</div></a></li>
            <li><a>Item 3 <div class="badge badge-accent">5</div></a></li>
            <li><a>Item 4 <div class="badge badge-ghost">beta</div></a></li>
          </ul>
        </div>
      `;
      document.body.appendChild(container);
    });

    const container = page.locator("body > div").last();
    await expect(container).toHaveScreenshot("badge-in-context.png");
  });

  // Accessibility testing
  test("badge accessibility visual regression", async ({ page }) => {
    // Test high contrast mode
    await page.emulateMedia({ reducedMotion: "reduce" });

    const badgeSection = page.locator(".card").first();
    await expect(badgeSection).toHaveScreenshot("badges-reduced-motion.png");
  });

  // Badge states and interactions
  test("badge states visual regression", async ({ page }) => {
    await page.evaluate(() => {
      const container = document.createElement("div");
      container.className = "p-8 space-y-6";
      container.innerHTML = `
        <div>
          <h3 class="mb-4 font-bold">Interactive Badges</h3>
          <div class="flex flex-wrap gap-2">
            <div class="badge badge-primary cursor-pointer hover:badge-primary-focus">Clickable</div>
            <div class="badge badge-secondary cursor-pointer hover:badge-secondary-focus">Hoverable</div>
            <div class="badge badge-accent cursor-pointer hover:badge-accent-focus">Active</div>
          </div>
        </div>
        <div>
          <h3 class="mb-4 font-bold">Status Badges</h3>
          <div class="flex flex-wrap gap-2">
            <div class="badge badge-success">Online</div>
            <div class="badge badge-warning">Away</div>
            <div class="badge badge-error">Offline</div>
            <div class="badge badge-info">Busy</div>
          </div>
        </div>
        <div>
          <h3 class="mb-4 font-bold">Category Badges</h3>
          <div class="flex flex-wrap gap-2">
            <div class="badge badge-outline">Design</div>
            <div class="badge badge-outline">Development</div>
            <div class="badge badge-outline">Marketing</div>
            <div class="badge badge-outline">Sales</div>
          </div>
        </div>
      `;
      document.body.appendChild(container);
    });

    const container = page.locator("body > div").last();
    await expect(container).toHaveScreenshot("badge-states.png");
  });
});
