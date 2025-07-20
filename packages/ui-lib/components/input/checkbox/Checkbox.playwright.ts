import { expect, test } from "@playwright/test";

test.describe("Checkbox Visual Tests", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:8001/components/input/checkbox");
    await page.waitForLoadState("networkidle");
  });

  test("checkbox variants visual regression", async ({ page }) => {
    const basicSection = page.locator(".card").first();
    await expect(basicSection).toHaveScreenshot("checkbox-basic-variants.png");
  });

  test("checkbox sizes visual regression", async ({ page }) => {
    const sizesSection = page.locator(".card").nth(1);
    await expect(sizesSection).toHaveScreenshot("checkbox-sizes.png");
  });

  test("checkbox colors visual regression", async ({ page }) => {
    const colorsSection = page.locator(".card").nth(2);
    await expect(colorsSection).toHaveScreenshot("checkbox-colors.png");
  });

  test("checkbox states visual regression", async ({ page }) => {
    const statesSection = page.locator(".card").nth(3);
    await expect(statesSection).toHaveScreenshot("checkbox-states.png");
  });

  test("checkbox interaction states", async ({ page }) => {
    const checkbox = page.locator(".checkbox").first();

    // Normal state
    await expect(checkbox).toHaveScreenshot("checkbox-normal.png");

    // Hover state
    await checkbox.hover();
    await expect(checkbox).toHaveScreenshot("checkbox-hover.png");

    // Focus state
    await checkbox.focus();
    await expect(checkbox).toHaveScreenshot("checkbox-focus.png");

    // Checked state
    await checkbox.check();
    await expect(checkbox).toHaveScreenshot("checkbox-checked.png");
  });

  test("checkbox size variations", async ({ page }) => {
    // Create checkboxes with different sizes
    await page.evaluate(() => {
      const container = document.createElement("div");
      container.className = "p-4 space-y-4";
      container.innerHTML = `
        <!-- Extra small -->
        <div class="form-control">
          <label class="label cursor-pointer">
            <span class="label-text">Extra Small</span>
            <input type="checkbox" class="checkbox checkbox-xs" checked />
          </label>
        </div>
        
        <!-- Small -->
        <div class="form-control">
          <label class="label cursor-pointer">
            <span class="label-text">Small</span>
            <input type="checkbox" class="checkbox checkbox-sm" checked />
          </label>
        </div>
        
        <!-- Medium (default) -->
        <div class="form-control">
          <label class="label cursor-pointer">
            <span class="label-text">Medium</span>
            <input type="checkbox" class="checkbox" checked />
          </label>
        </div>
        
        <!-- Large -->
        <div class="form-control">
          <label class="label cursor-pointer">
            <span class="label-text">Large</span>
            <input type="checkbox" class="checkbox checkbox-lg" checked />
          </label>
        </div>
      `;
      document.body.appendChild(container);
    });

    const container = page.locator("div").last();
    await expect(container).toHaveScreenshot("checkbox-size-variations.png");
  });

  test("checkbox color variants", async ({ page }) => {
    // Create checkboxes with different colors
    await page.evaluate(() => {
      const container = document.createElement("div");
      container.className = "p-4 space-y-4";
      container.innerHTML = `
        <div class="form-control">
          <label class="label cursor-pointer">
            <span class="label-text">Default</span>
            <input type="checkbox" class="checkbox" checked />
          </label>
        </div>
        
        <div class="form-control">
          <label class="label cursor-pointer">
            <span class="label-text">Primary</span>
            <input type="checkbox" class="checkbox checkbox-primary" checked />
          </label>
        </div>
        
        <div class="form-control">
          <label class="label cursor-pointer">
            <span class="label-text">Secondary</span>
            <input type="checkbox" class="checkbox checkbox-secondary" checked />
          </label>
        </div>
        
        <div class="form-control">
          <label class="label cursor-pointer">
            <span class="label-text">Accent</span>
            <input type="checkbox" class="checkbox checkbox-accent" checked />
          </label>
        </div>
        
        <div class="form-control">
          <label class="label cursor-pointer">
            <span class="label-text">Success</span>
            <input type="checkbox" class="checkbox checkbox-success" checked />
          </label>
        </div>
        
        <div class="form-control">
          <label class="label cursor-pointer">
            <span class="label-text">Warning</span>
            <input type="checkbox" class="checkbox checkbox-warning" checked />
          </label>
        </div>
        
        <div class="form-control">
          <label class="label cursor-pointer">
            <span class="label-text">Error</span>
            <input type="checkbox" class="checkbox checkbox-error" checked />
          </label>
        </div>
        
        <div class="form-control">
          <label class="label cursor-pointer">
            <span class="label-text">Info</span>
            <input type="checkbox" class="checkbox checkbox-info" checked />
          </label>
        </div>
      `;
      document.body.appendChild(container);
    });

    const container = page.locator("div").last();
    await expect(container).toHaveScreenshot("checkbox-color-variants.png");
  });

  test("checkbox indeterminate state", async ({ page }) => {
    // Create checkbox with indeterminate state
    await page.evaluate(() => {
      const container = document.createElement("div");
      container.className = "p-4 space-y-4";
      container.innerHTML = `
        <div class="form-control">
          <label class="label cursor-pointer">
            <span class="label-text">Indeterminate State</span>
            <input type="checkbox" class="checkbox" id="indeterminate-checkbox" />
          </label>
        </div>
      `;
      document.body.appendChild(container);

      // Set indeterminate state
      const checkbox = document.getElementById("indeterminate-checkbox");
      if (checkbox) {
        checkbox.indeterminate = true;
      }
    });

    const container = page.locator("div").last();
    await expect(container).toHaveScreenshot("checkbox-indeterminate.png");
  });

  test("checkbox in different themes", async ({ page }) => {
    const themes = ["light", "dark", "cupcake", "cyberpunk"];

    for (const theme of themes) {
      await page.evaluate((theme) => {
        document.documentElement.setAttribute("data-theme", theme);
      }, theme);

      await page.waitForTimeout(100);

      const checkboxSection = page.locator(".checkbox").first();
      await expect(checkboxSection).toHaveScreenshot(`checkbox-theme-${theme}.png`);
    }
  });

  test("checkbox responsive design", async ({ page }) => {
    const viewports = [
      { width: 375, height: 667, name: "mobile" },
      { width: 768, height: 1024, name: "tablet" },
      { width: 1920, height: 1080, name: "desktop" },
    ];

    for (const viewport of viewports) {
      await page.setViewportSize(viewport);

      const checkboxSection = page.locator(".checkbox").first();
      await expect(checkboxSection).toHaveScreenshot(`checkbox-${viewport.name}.png`);
    }
  });

  test("checkbox with form controls", async ({ page }) => {
    // Create checkboxes in form context
    await page.evaluate(() => {
      const container = document.createElement("div");
      container.className = "p-4";
      container.innerHTML = `
        <form class="space-y-4">
          <!-- Standard form control -->
          <div class="form-control">
            <label class="label">
              <span class="label-text">Accept Terms</span>
            </label>
            <label class="label cursor-pointer">
              <span class="label-text">I agree to the terms and conditions</span>
              <input type="checkbox" class="checkbox" />
            </label>
          </div>
          
          <!-- Checkbox list -->
          <div class="form-control">
            <label class="label">
              <span class="label-text">Select your interests</span>
            </label>
            <label class="label cursor-pointer">
              <span class="label-text">Technology</span>
              <input type="checkbox" class="checkbox checkbox-primary" checked />
            </label>
            <label class="label cursor-pointer">
              <span class="label-text">Design</span>
              <input type="checkbox" class="checkbox checkbox-primary" />
            </label>
            <label class="label cursor-pointer">
              <span class="label-text">Marketing</span>
              <input type="checkbox" class="checkbox checkbox-primary" checked />
            </label>
          </div>
          
          <!-- Disabled checkbox -->
          <div class="form-control">
            <label class="label cursor-pointer">
              <span class="label-text opacity-50">Disabled Option</span>
              <input type="checkbox" class="checkbox" disabled />
            </label>
          </div>
          
          <!-- Disabled checked checkbox -->
          <div class="form-control">
            <label class="label cursor-pointer">
              <span class="label-text opacity-50">Disabled Checked</span>
              <input type="checkbox" class="checkbox" disabled checked />
            </label>
          </div>
        </form>
      `;
      document.body.appendChild(container);
    });

    const container = page.locator("div").last();
    await expect(container).toHaveScreenshot("checkbox-form-controls.png");
  });

  test("checkbox group variations", async ({ page }) => {
    // Create different checkbox group layouts
    await page.evaluate(() => {
      const container = document.createElement("div");
      container.className = "p-4 space-y-6";
      container.innerHTML = `
        <!-- Horizontal layout -->
        <div>
          <h3 class="text-lg font-semibold mb-2">Horizontal Layout</h3>
          <div class="flex space-x-4">
            <label class="label cursor-pointer">
              <input type="checkbox" class="checkbox checkbox-sm mr-2" checked />
              <span class="label-text">Option 1</span>
            </label>
            <label class="label cursor-pointer">
              <input type="checkbox" class="checkbox checkbox-sm mr-2" />
              <span class="label-text">Option 2</span>
            </label>
            <label class="label cursor-pointer">
              <input type="checkbox" class="checkbox checkbox-sm mr-2" checked />
              <span class="label-text">Option 3</span>
            </label>
          </div>
        </div>
        
        <!-- Card layout -->
        <div>
          <h3 class="text-lg font-semibold mb-2">Card Layout</h3>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div class="card bg-base-100 shadow-sm border">
              <div class="card-body p-4">
                <label class="label cursor-pointer">
                  <div>
                    <h4 class="font-semibold">Basic Plan</h4>
                    <p class="text-sm opacity-70">$9/month</p>
                  </div>
                  <input type="checkbox" class="checkbox checkbox-primary" />
                </label>
              </div>
            </div>
            <div class="card bg-base-100 shadow-sm border">
              <div class="card-body p-4">
                <label class="label cursor-pointer">
                  <div>
                    <h4 class="font-semibold">Pro Plan</h4>
                    <p class="text-sm opacity-70">$19/month</p>
                  </div>
                  <input type="checkbox" class="checkbox checkbox-primary" checked />
                </label>
              </div>
            </div>
            <div class="card bg-base-100 shadow-sm border">
              <div class="card-body p-4">
                <label class="label cursor-pointer">
                  <div>
                    <h4 class="font-semibold">Enterprise</h4>
                    <p class="text-sm opacity-70">$49/month</p>
                  </div>
                  <input type="checkbox" class="checkbox checkbox-primary" />
                </label>
              </div>
            </div>
          </div>
        </div>
      `;
      document.body.appendChild(container);
    });

    const container = page.locator("div").last();
    await expect(container).toHaveScreenshot("checkbox-group-variations.png");
  });
});
