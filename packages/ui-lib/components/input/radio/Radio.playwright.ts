import { expect, test } from "@playwright/test";

test.describe("Radio Visual Tests", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:8001/components/input/radio");
    await page.waitForLoadState("networkidle");
  });

  test("radio variants visual regression", async ({ page }) => {
    const basicSection = page.locator(".card").first();
    await expect(basicSection).toHaveScreenshot("radio-basic-variants.png");
  });

  test("radio sizes visual regression", async ({ page }) => {
    const sizesSection = page.locator(".card").nth(1);
    await expect(sizesSection).toHaveScreenshot("radio-sizes.png");
  });

  test("radio colors visual regression", async ({ page }) => {
    const colorsSection = page.locator(".card").nth(2);
    await expect(colorsSection).toHaveScreenshot("radio-colors.png");
  });

  test("radio groups visual regression", async ({ page }) => {
    const groupsSection = page.locator(".card").nth(3);
    await expect(groupsSection).toHaveScreenshot("radio-groups.png");
  });

  test("radio interaction states", async ({ page }) => {
    const radio = page.locator("input[type='radio']").first();

    // Normal state
    await expect(radio).toHaveScreenshot("radio-normal.png");

    // Hover state
    await radio.hover();
    await expect(radio).toHaveScreenshot("radio-hover.png");

    // Focus state
    await radio.focus();
    await expect(radio).toHaveScreenshot("radio-focus.png");

    // Selected state
    await radio.check();
    await expect(radio).toHaveScreenshot("radio-selected.png");
  });

  test("radio size variations", async ({ page }) => {
    // Create radio buttons with different sizes
    await page.evaluate(() => {
      const container = document.createElement("div");
      container.className = "p-4 space-y-4";
      container.innerHTML = `
        <!-- Extra small -->
        <div class="form-control">
          <label class="label cursor-pointer">
            <span class="label-text">Extra Small</span>
            <input type="radio" name="size-demo-xs" class="radio radio-xs" checked />
          </label>
        </div>
        
        <!-- Small -->
        <div class="form-control">
          <label class="label cursor-pointer">
            <span class="label-text">Small</span>
            <input type="radio" name="size-demo-sm" class="radio radio-sm" checked />
          </label>
        </div>
        
        <!-- Medium (default) -->
        <div class="form-control">
          <label class="label cursor-pointer">
            <span class="label-text">Medium</span>
            <input type="radio" name="size-demo-md" class="radio" checked />
          </label>
        </div>
        
        <!-- Large -->
        <div class="form-control">
          <label class="label cursor-pointer">
            <span class="label-text">Large</span>
            <input type="radio" name="size-demo-lg" class="radio radio-lg" checked />
          </label>
        </div>
      `;
      document.body.appendChild(container);
    });

    const container = page.locator("div").last();
    await expect(container).toHaveScreenshot("radio-size-variations.png");
  });

  test("radio color variants", async ({ page }) => {
    // Create radio buttons with different colors
    await page.evaluate(() => {
      const container = document.createElement("div");
      container.className = "p-4 space-y-4";
      container.innerHTML = `
        <div class="form-control">
          <label class="label cursor-pointer">
            <span class="label-text">Default</span>
            <input type="radio" name="color-demo-default" class="radio" checked />
          </label>
        </div>
        
        <div class="form-control">
          <label class="label cursor-pointer">
            <span class="label-text">Primary</span>
            <input type="radio" name="color-demo-primary" class="radio radio-primary" checked />
          </label>
        </div>
        
        <div class="form-control">
          <label class="label cursor-pointer">
            <span class="label-text">Secondary</span>
            <input type="radio" name="color-demo-secondary" class="radio radio-secondary" checked />
          </label>
        </div>
        
        <div class="form-control">
          <label class="label cursor-pointer">
            <span class="label-text">Accent</span>
            <input type="radio" name="color-demo-accent" class="radio radio-accent" checked />
          </label>
        </div>
        
        <div class="form-control">
          <label class="label cursor-pointer">
            <span class="label-text">Success</span>
            <input type="radio" name="color-demo-success" class="radio radio-success" checked />
          </label>
        </div>
        
        <div class="form-control">
          <label class="label cursor-pointer">
            <span class="label-text">Warning</span>
            <input type="radio" name="color-demo-warning" class="radio radio-warning" checked />
          </label>
        </div>
        
        <div class="form-control">
          <label class="label cursor-pointer">
            <span class="label-text">Error</span>
            <input type="radio" name="color-demo-error" class="radio radio-error" checked />
          </label>
        </div>
        
        <div class="form-control">
          <label class="label cursor-pointer">
            <span class="label-text">Info</span>
            <input type="radio" name="color-demo-info" class="radio radio-info" checked />
          </label>
        </div>
      `;
      document.body.appendChild(container);
    });

    const container = page.locator("div").last();
    await expect(container).toHaveScreenshot("radio-color-variants.png");
  });

  test("radio group layouts", async ({ page }) => {
    // Create different radio group layouts
    await page.evaluate(() => {
      const container = document.createElement("div");
      container.className = "p-4 space-y-6";
      container.innerHTML = `
        <!-- Vertical group -->
        <div>
          <h3 class="text-lg font-semibold mb-2">Vertical Group</h3>
          <div class="form-control">
            <label class="label">
              <span class="label-text">Select your plan</span>
            </label>
            <label class="label cursor-pointer">
              <span class="label-text">Basic Plan - $9/month</span>
              <input type="radio" name="plan-vertical" class="radio radio-primary" checked />
            </label>
            <label class="label cursor-pointer">
              <span class="label-text">Pro Plan - $19/month</span>
              <input type="radio" name="plan-vertical" class="radio radio-primary" />
            </label>
            <label class="label cursor-pointer">
              <span class="label-text">Enterprise - $49/month</span>
              <input type="radio" name="plan-vertical" class="radio radio-primary" />
            </label>
          </div>
        </div>
        
        <!-- Horizontal group -->
        <div>
          <h3 class="text-lg font-semibold mb-2">Horizontal Group</h3>
          <div class="form-control">
            <label class="label">
              <span class="label-text">Rating</span>
            </label>
            <div class="flex space-x-4">
              <label class="label cursor-pointer">
                <input type="radio" name="rating-horizontal" class="radio radio-sm mr-2" checked />
                <span class="label-text">1 Star</span>
              </label>
              <label class="label cursor-pointer">
                <input type="radio" name="rating-horizontal" class="radio radio-sm mr-2" />
                <span class="label-text">2 Stars</span>
              </label>
              <label class="label cursor-pointer">
                <input type="radio" name="rating-horizontal" class="radio radio-sm mr-2" />
                <span class="label-text">3 Stars</span>
              </label>
              <label class="label cursor-pointer">
                <input type="radio" name="rating-horizontal" class="radio radio-sm mr-2" />
                <span class="label-text">4 Stars</span>
              </label>
              <label class="label cursor-pointer">
                <input type="radio" name="rating-horizontal" class="radio radio-sm mr-2" />
                <span class="label-text">5 Stars</span>
              </label>
            </div>
          </div>
        </div>
        
        <!-- Card layout -->
        <div>
          <h3 class="text-lg font-semibold mb-2">Card Layout</h3>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div class="card bg-base-100 shadow-sm border border-primary">
              <div class="card-body p-4">
                <label class="label cursor-pointer">
                  <div class="flex-1">
                    <h4 class="font-semibold">Starter</h4>
                    <p class="text-sm opacity-70">Perfect for individuals</p>
                    <p class="font-bold text-primary">$9/month</p>
                  </div>
                  <input type="radio" name="plan-cards" class="radio radio-primary" checked />
                </label>
              </div>
            </div>
            <div class="card bg-base-100 shadow-sm border">
              <div class="card-body p-4">
                <label class="label cursor-pointer">
                  <div class="flex-1">
                    <h4 class="font-semibold">Professional</h4>
                    <p class="text-sm opacity-70">For growing teams</p>
                    <p class="font-bold text-primary">$19/month</p>
                  </div>
                  <input type="radio" name="plan-cards" class="radio radio-primary" />
                </label>
              </div>
            </div>
            <div class="card bg-base-100 shadow-sm border">
              <div class="card-body p-4">
                <label class="label cursor-pointer">
                  <div class="flex-1">
                    <h4 class="font-semibold">Enterprise</h4>
                    <p class="text-sm opacity-70">For large organizations</p>
                    <p class="font-bold text-primary">$49/month</p>
                  </div>
                  <input type="radio" name="plan-cards" class="radio radio-primary" />
                </label>
              </div>
            </div>
          </div>
        </div>
      `;
      document.body.appendChild(container);
    });

    const container = page.locator("div").last();
    await expect(container).toHaveScreenshot("radio-group-layouts.png");
  });

  test("radio in different themes", async ({ page }) => {
    const themes = ["light", "dark", "cupcake", "cyberpunk"];

    for (const theme of themes) {
      await page.evaluate((theme) => {
        document.documentElement.setAttribute("data-theme", theme);
      }, theme);

      await page.waitForTimeout(100);

      const radioSection = page.locator("input[type='radio']").first();
      await expect(radioSection).toHaveScreenshot(`radio-theme-${theme}.png`);
    }
  });

  test("radio responsive design", async ({ page }) => {
    const viewports = [
      { width: 375, height: 667, name: "mobile" },
      { width: 768, height: 1024, name: "tablet" },
      { width: 1920, height: 1080, name: "desktop" },
    ];

    for (const viewport of viewports) {
      await page.setViewportSize(viewport);

      const radioSection = page.locator("input[type='radio']").first();
      await expect(radioSection).toHaveScreenshot(`radio-${viewport.name}.png`);
    }
  });

  test("radio disabled states", async ({ page }) => {
    // Create disabled radio buttons
    await page.evaluate(() => {
      const container = document.createElement("div");
      container.className = "p-4 space-y-4";
      container.innerHTML = `
        <div class="form-control">
          <label class="label cursor-pointer">
            <span class="label-text opacity-50">Disabled Unchecked</span>
            <input type="radio" name="disabled-demo" class="radio" disabled />
          </label>
        </div>
        
        <div class="form-control">
          <label class="label cursor-pointer">
            <span class="label-text opacity-50">Disabled Checked</span>
            <input type="radio" name="disabled-demo" class="radio radio-primary" disabled checked />
          </label>
        </div>
        
        <div class="form-control">
          <label class="label cursor-pointer">
            <span class="label-text">Enabled Option</span>
            <input type="radio" name="disabled-demo" class="radio radio-primary" />
          </label>
        </div>
      `;
      document.body.appendChild(container);
    });

    const container = page.locator("div").last();
    await expect(container).toHaveScreenshot("radio-disabled-states.png");
  });

  test("radio button styles", async ({ page }) => {
    // Create radio buttons with button-like appearance
    await page.evaluate(() => {
      const container = document.createElement("div");
      container.className = "p-4 space-y-4";
      container.innerHTML = `
        <!-- Button-style radio group -->
        <div>
          <h3 class="text-lg font-semibold mb-2">Button Style</h3>
          <div class="join">
            <input class="join-item btn" type="radio" name="options" aria-label="Option 1" checked />
            <input class="join-item btn" type="radio" name="options" aria-label="Option 2" />
            <input class="join-item btn" type="radio" name="options" aria-label="Option 3" />
          </div>
        </div>
        
        <!-- Tab-style radio group -->
        <div>
          <h3 class="text-lg font-semibold mb-2">Tab Style</h3>
          <div class="tabs tabs-boxed">
            <input type="radio" name="tab-options" class="tab" aria-label="Tab 1" checked />
            <input type="radio" name="tab-options" class="tab" aria-label="Tab 2" />
            <input type="radio" name="tab-options" class="tab" aria-label="Tab 3" />
          </div>
        </div>
      `;
      document.body.appendChild(container);
    });

    const container = page.locator("div").last();
    await expect(container).toHaveScreenshot("radio-button-styles.png");
  });
});
