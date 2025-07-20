import { expect, test } from "@playwright/test";

test.describe("Select Visual Tests", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:8001/components/input/select");
    await page.waitForLoadState("networkidle");
  });

  test("select variants visual regression", async ({ page }) => {
    const basicSection = page.locator(".card").first();
    await expect(basicSection).toHaveScreenshot("select-basic-variants.png");
  });

  test("select sizes visual regression", async ({ page }) => {
    const sizesSection = page.locator(".card").nth(1);
    await expect(sizesSection).toHaveScreenshot("select-sizes.png");
  });

  test("select states visual regression", async ({ page }) => {
    const statesSection = page.locator(".card").nth(2);
    await expect(statesSection).toHaveScreenshot("select-states.png");
  });

  test("select with options visual regression", async ({ page }) => {
    const optionsSection = page.locator(".card").nth(3);
    await expect(optionsSection).toHaveScreenshot("select-options.png");
  });

  test("select interaction states", async ({ page }) => {
    const select = page.locator("select").first();

    // Normal state
    await expect(select).toHaveScreenshot("select-normal.png");

    // Focus state
    await select.focus();
    await expect(select).toHaveScreenshot("select-focus.png");

    // Hover state
    await select.hover();
    await expect(select).toHaveScreenshot("select-hover.png");
  });

  test("select dropdown opened", async ({ page }) => {
    const select = page.locator("select").first();

    // Click to open dropdown
    await select.click();

    // Take screenshot of opened dropdown
    await expect(select).toHaveScreenshot("select-opened.png");
  });

  test("select with different option counts", async ({ page }) => {
    // Create selects with varying number of options
    await page.evaluate(() => {
      const container = document.createElement("div");
      container.className = "p-4 space-y-4";
      container.innerHTML = `
        <!-- Few options -->
        <select class="select select-bordered w-full max-w-xs">
          <option disabled selected>Pick one</option>
          <option>Option 1</option>
          <option>Option 2</option>
        </select>
        
        <!-- Many options -->
        <select class="select select-bordered w-full max-w-xs">
          <option disabled selected>Choose from many</option>
          <option>Option 1</option>
          <option>Option 2</option>
          <option>Option 3</option>
          <option>Option 4</option>
          <option>Option 5</option>
          <option>Option 6</option>
          <option>Option 7</option>
          <option>Option 8</option>
          <option>Option 9</option>
          <option>Option 10</option>
        </select>
        
        <!-- Grouped options -->
        <select class="select select-bordered w-full max-w-xs">
          <option disabled selected>Grouped options</option>
          <optgroup label="Group 1">
            <option>Option 1.1</option>
            <option>Option 1.2</option>
          </optgroup>
          <optgroup label="Group 2">
            <option>Option 2.1</option>
            <option>Option 2.2</option>
          </optgroup>
        </select>
      `;
      document.body.appendChild(container);
    });

    const container = page.locator("div").last();
    await expect(container).toHaveScreenshot("select-option-variations.png");
  });

  test("select in different themes", async ({ page }) => {
    const themes = ["light", "dark", "cupcake", "cyberpunk"];

    for (const theme of themes) {
      await page.evaluate((theme) => {
        document.documentElement.setAttribute("data-theme", theme);
      }, theme);

      await page.waitForTimeout(100);

      const selectSection = page.locator("select").first();
      await expect(selectSection).toHaveScreenshot(`select-theme-${theme}.png`);
    }
  });

  test("select responsive design", async ({ page }) => {
    const viewports = [
      { width: 375, height: 667, name: "mobile" },
      { width: 768, height: 1024, name: "tablet" },
      { width: 1920, height: 1080, name: "desktop" },
    ];

    for (const viewport of viewports) {
      await page.setViewportSize(viewport);

      const selectSection = page.locator("select").first();
      await expect(selectSection).toHaveScreenshot(`select-${viewport.name}.png`);
    }
  });

  test("select with form controls", async ({ page }) => {
    // Create select within form control context
    await page.evaluate(() => {
      const container = document.createElement("div");
      container.className = "p-4 space-y-4";
      container.innerHTML = `
        <!-- With label -->
        <div class="form-control w-full max-w-xs">
          <label class="label">
            <span class="label-text">Pick the best fantasy franchise to date</span>
          </label>
          <select class="select select-bordered">
            <option disabled selected>Pick one</option>
            <option>Star Wars</option>
            <option>Harry Potter</option>
            <option>Lord of the Rings</option>
            <option>Planet of the Apes</option>
            <option>Star Trek</option>
          </select>
          <label class="label">
            <span class="label-text-alt">Alt label</span>
          </label>
        </div>
        
        <!-- With error state -->
        <div class="form-control w-full max-w-xs">
          <select class="select select-bordered select-error">
            <option disabled selected>Error state</option>
            <option>Option 1</option>
            <option>Option 2</option>
          </select>
        </div>
        
        <!-- With success state -->
        <div class="form-control w-full max-w-xs">
          <select class="select select-bordered select-success">
            <option disabled selected>Success state</option>
            <option>Option 1</option>
            <option>Option 2</option>
          </select>
        </div>
      `;
      document.body.appendChild(container);
    });

    const container = page.locator("div").last();
    await expect(container).toHaveScreenshot("select-form-controls.png");
  });

  test("select variant styles", async ({ page }) => {
    // Create selects with different styles
    await page.evaluate(() => {
      const container = document.createElement("div");
      container.className = "p-4 space-y-4";
      container.innerHTML = `
        <select class="select w-full max-w-xs">
          <option>Default select</option>
        </select>
        
        <select class="select select-bordered w-full max-w-xs">
          <option>Bordered select</option>
        </select>
        
        <select class="select select-ghost w-full max-w-xs">
          <option>Ghost select</option>
        </select>
        
        <select class="select select-primary w-full max-w-xs">
          <option>Primary select</option>
        </select>
        
        <select class="select select-secondary w-full max-w-xs">
          <option>Secondary select</option>
        </select>
      `;
      document.body.appendChild(container);
    });

    const container = page.locator("div").last();
    await expect(container).toHaveScreenshot("select-variant-styles.png");
  });
});
