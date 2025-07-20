import { expect, test } from "@playwright/test";

test.describe("Dropdown Visual Tests", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to dropdown component page
    await page.goto("http://localhost:8001/components/action/dropdown");
    await page.waitForLoadState("networkidle");
  });

  test("dropdown variants visual regression", async ({ page }) => {
    // Test basic dropdown section - get the first card with dropdowns
    const basicSection = page.locator(".card").first();
    await expect(basicSection).toHaveScreenshot("dropdown-basic-variants.png");
  });

  test("dropdown positions visual regression", async ({ page }) => {
    // Test dropdown positions section
    const positionsSection = page.locator(".card").nth(1);
    await expect(positionsSection).toHaveScreenshot("dropdown-positions.png");
  });

  test("dropdown content types visual regression", async ({ page }) => {
    // Test dropdown with different content types
    const contentSection = page.locator(".card").nth(2);
    await expect(contentSection).toHaveScreenshot("dropdown-content-types.png");
  });

  test("dropdown states visual regression", async ({ page }) => {
    // Test different dropdown states and configurations
    const statesSection = page.locator(".card").nth(3);
    await expect(statesSection).toHaveScreenshot("dropdown-states.png");
  });

  // Theme testing
  test("dropdowns in different themes", async ({ page }) => {
    const themes = ["light", "dark", "cupcake", "cyberpunk", "synthwave"];

    for (const theme of themes) {
      // Change theme
      await page.evaluate((theme) => {
        document.documentElement.setAttribute("data-theme", theme);
      }, theme);

      // Wait for theme to apply
      await page.waitForTimeout(100);

      // Take screenshot of dropdown examples
      const dropdownSection = page.locator(".card").first();
      await expect(dropdownSection).toHaveScreenshot(`dropdowns-theme-${theme}.png`);
    }
  });

  // Responsive testing
  test("dropdowns responsive design", async ({ page }) => {
    const viewports = [
      { width: 375, height: 667, name: "mobile" },
      { width: 768, height: 1024, name: "tablet" },
      { width: 1920, height: 1080, name: "desktop" },
    ];

    for (const viewport of viewports) {
      await page.setViewportSize(viewport);

      const dropdownSection = page.locator(".card").first();
      await expect(dropdownSection).toHaveScreenshot(`dropdowns-${viewport.name}.png`);
    }
  });

  // Dropdown open state testing
  test("dropdown open state visual regression", async ({ page }) => {
    // Create a test dropdown in open state for visual testing
    await page.evaluate(() => {
      const container = document.createElement("div");
      container.className = "p-4";
      container.innerHTML = `
        <div class="dropdown dropdown-open">
          <div tabindex="0" role="button" class="btn m-1">Click</div>
          <ul tabindex="0" class="dropdown-content menu bg-base-100 rounded-box z-[1] w-52 p-2 shadow">
            <li><a>Item 1</a></li>
            <li><a>Item 2</a></li>
            <li><a>Item 3</a></li>
          </ul>
        </div>
      `;
      document.body.appendChild(container);
    });

    await page.waitForTimeout(500);

    const dropdownContainer = page.locator(".dropdown-open").last();
    await expect(dropdownContainer).toHaveScreenshot("dropdown-open-state.png");
  });

  // Dropdown positioning test
  test("dropdown positioning visual regression", async ({ page }) => {
    // Test different dropdown positioning
    await page.evaluate(() => {
      const container = document.createElement("div");
      container.className = "p-8 space-y-4 flex flex-col items-center";
      container.innerHTML = `
        <div class="dropdown dropdown-top dropdown-open">
          <div tabindex="0" role="button" class="btn">Top</div>
          <ul tabindex="0" class="dropdown-content menu bg-base-100 rounded-box z-[1] w-52 p-2 shadow">
            <li><a>Top Item 1</a></li>
            <li><a>Top Item 2</a></li>
          </ul>
        </div>
        <div class="dropdown dropdown-bottom dropdown-open">
          <div tabindex="0" role="button" class="btn">Bottom</div>
          <ul tabindex="0" class="dropdown-content menu bg-base-100 rounded-box z-[1] w-52 p-2 shadow">
            <li><a>Bottom Item 1</a></li>
            <li><a>Bottom Item 2</a></li>
          </ul>
        </div>
        <div class="dropdown dropdown-left dropdown-open">
          <div tabindex="0" role="button" class="btn">Left</div>
          <ul tabindex="0" class="dropdown-content menu bg-base-100 rounded-box z-[1] w-52 p-2 shadow">
            <li><a>Left Item 1</a></li>
            <li><a>Left Item 2</a></li>
          </ul>
        </div>
        <div class="dropdown dropdown-right dropdown-open">
          <div tabindex="0" role="button" class="btn">Right</div>
          <ul tabindex="0" class="dropdown-content menu bg-base-100 rounded-box z-[1] w-52 p-2 shadow">
            <li><a>Right Item 1</a></li>
            <li><a>Right Item 2</a></li>
          </ul>
        </div>
      `;
      document.body.appendChild(container);
    });

    const container = page.locator("body > div").last();
    await expect(container).toHaveScreenshot("dropdown-positions.png");
  });

  // Dropdown hover state testing
  test("dropdown hover behavior visual regression", async ({ page }) => {
    // Create dropdown with hover behavior
    await page.evaluate(() => {
      const container = document.createElement("div");
      container.className = "p-4";
      container.innerHTML = `
        <div class="dropdown dropdown-hover dropdown-open">
          <div tabindex="0" role="button" class="btn">Hover me</div>
          <ul tabindex="0" class="dropdown-content menu bg-base-100 rounded-box z-[1] w-52 p-2 shadow">
            <li><a>Hover Item 1</a></li>
            <li><a>Hover Item 2</a></li>
            <li><a>Hover Item 3</a></li>
          </ul>
        </div>
      `;
      document.body.appendChild(container);
    });

    const dropdownContainer = page.locator(".dropdown-hover").last();
    await expect(dropdownContainer).toHaveScreenshot("dropdown-hover.png");
  });

  // Accessibility testing
  test("dropdown accessibility visual regression", async ({ page }) => {
    // Test high contrast mode
    await page.emulateMedia({ reducedMotion: "reduce" });

    const dropdownSection = page.locator(".card").first();
    await expect(dropdownSection).toHaveScreenshot("dropdowns-reduced-motion.png");
  });

  // Dropdown with complex content
  test("dropdown with complex content", async ({ page }) => {
    await page.evaluate(() => {
      const container = document.createElement("div");
      container.className = "p-4";
      container.innerHTML = `
        <div class="dropdown dropdown-open">
          <div tabindex="0" role="button" class="btn btn-primary">Complex Menu</div>
          <ul tabindex="0" class="dropdown-content menu bg-base-100 rounded-box z-[1] w-80 p-2 shadow">
            <li class="menu-title">User Actions</li>
            <li><a><svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/></svg> Profile</a></li>
            <li><a><svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"/></svg> Dashboard</a></li>
            <li class="divider"></li>
            <li class="menu-title">Settings</li>
            <li><a><svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd"/></svg> Settings</a></li>
            <li><a class="text-error"><svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd"/></svg> Logout</a></li>
          </ul>
        </div>
      `;
      document.body.appendChild(container);
    });

    const dropdownContainer = page.locator(".dropdown-open").last();
    await expect(dropdownContainer).toHaveScreenshot("dropdown-complex-content.png");
  });
});
