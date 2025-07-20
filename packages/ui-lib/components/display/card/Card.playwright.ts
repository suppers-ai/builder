import { expect, test } from "@playwright/test";

test.describe("Card Visual Tests", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to card component page
    await page.goto("http://localhost:8001/components/display/card");
    await page.waitForLoadState("networkidle");
  });

  test("card variants visual regression", async ({ page }) => {
    // Test basic card section - get the first card with cards
    const basicSection = page.locator(".card").first();
    await expect(basicSection).toHaveScreenshot("card-basic-variants.png");
  });

  test("card layouts visual regression", async ({ page }) => {
    // Test card layouts section
    const layoutsSection = page.locator(".card").nth(1);
    await expect(layoutsSection).toHaveScreenshot("card-layouts.png");
  });

  test("card with images visual regression", async ({ page }) => {
    // Test card with images section
    const imagesSection = page.locator(".card").nth(2);
    await expect(imagesSection).toHaveScreenshot("card-images.png");
  });

  test("card actions visual regression", async ({ page }) => {
    // Test card actions section
    const actionsSection = page.locator(".card").nth(3);
    await expect(actionsSection).toHaveScreenshot("card-actions.png");
  });

  // Theme testing
  test("cards in different themes", async ({ page }) => {
    const themes = ["light", "dark", "cupcake", "cyberpunk", "synthwave"];

    for (const theme of themes) {
      // Change theme
      await page.evaluate((theme) => {
        document.documentElement.setAttribute("data-theme", theme);
      }, theme);

      // Wait for theme to apply
      await page.waitForTimeout(100);

      // Take screenshot of card examples
      const cardSection = page.locator(".card").first();
      await expect(cardSection).toHaveScreenshot(`cards-theme-${theme}.png`);
    }
  });

  // Responsive testing
  test("cards responsive design", async ({ page }) => {
    const viewports = [
      { width: 375, height: 667, name: "mobile" },
      { width: 768, height: 1024, name: "tablet" },
      { width: 1920, height: 1080, name: "desktop" },
    ];

    for (const viewport of viewports) {
      await page.setViewportSize(viewport);

      const cardSection = page.locator(".card").first();
      await expect(cardSection).toHaveScreenshot(`cards-${viewport.name}.png`);
    }
  });

  // Card variants testing
  test("card variant styles visual regression", async ({ page }) => {
    await page.evaluate(() => {
      const container = document.createElement("div");
      container.className = "p-8 space-y-6";
      container.innerHTML = `
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="card bg-base-100 shadow-xl">
            <div class="card-body">
              <h2 class="card-title">Default Card</h2>
              <p>Standard card with shadow</p>
            </div>
          </div>
          <div class="card bg-base-100 shadow-xl card-compact">
            <div class="card-body">
              <h2 class="card-title">Compact Card</h2>
              <p>Compact card with reduced padding</p>
            </div>
          </div>
          <div class="card bg-base-100 shadow-xl card-bordered">
            <div class="card-body">
              <h2 class="card-title">Bordered Card</h2>
              <p>Card with border styling</p>
            </div>
          </div>
          <div class="card bg-base-100 shadow-xl glass">
            <div class="card-body">
              <h2 class="card-title">Glass Card</h2>
              <p>Card with glass effect</p>
            </div>
          </div>
        </div>
      `;
      document.body.appendChild(container);
    });

    const container = page.locator("body > div").last();
    await expect(container).toHaveScreenshot("card-variants.png");
  });

  // Card with images testing
  test("card with images visual regression", async ({ page }) => {
    await page.evaluate(() => {
      const container = document.createElement("div");
      container.className = "p-8 space-y-6";
      container.innerHTML = `
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="card bg-base-100 shadow-xl">
            <figure>
              <img src="https://via.placeholder.com/400x200/6366F1/FFFFFF?text=Card+Image" alt="Card Image" />
            </figure>
            <div class="card-body">
              <h2 class="card-title">Card with Image</h2>
              <p>Card featuring a top image</p>
              <div class="card-actions justify-end">
                <button class="btn btn-primary">View</button>
              </div>
            </div>
          </div>
          <div class="card card-side bg-base-100 shadow-xl">
            <figure>
              <img src="https://via.placeholder.com/200x300/10B981/FFFFFF?text=Side+Image" alt="Side Image" />
            </figure>
            <div class="card-body">
              <h2 class="card-title">Side Card</h2>
              <p>Card with side image layout</p>
              <div class="card-actions justify-end">
                <button class="btn btn-primary">Action</button>
              </div>
            </div>
          </div>
        </div>
      `;
      document.body.appendChild(container);
    });

    const container = page.locator("body > div").last();
    await expect(container).toHaveScreenshot("card-with-images.png");
  });

  // Card actions testing
  test("card actions visual regression", async ({ page }) => {
    await page.evaluate(() => {
      const container = document.createElement("div");
      container.className = "p-8 space-y-6";
      container.innerHTML = `
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="card bg-base-100 shadow-xl">
            <div class="card-body">
              <h2 class="card-title">Single Action</h2>
              <p>Card with one action button</p>
              <div class="card-actions justify-end">
                <button class="btn btn-primary">Action</button>
              </div>
            </div>
          </div>
          <div class="card bg-base-100 shadow-xl">
            <div class="card-body">
              <h2 class="card-title">Multiple Actions</h2>
              <p>Card with multiple action buttons</p>
              <div class="card-actions justify-end">
                <button class="btn btn-ghost">Cancel</button>
                <button class="btn btn-primary">Save</button>
              </div>
            </div>
          </div>
          <div class="card bg-base-100 shadow-xl">
            <div class="card-body">
              <h2 class="card-title">Action Variants</h2>
              <p>Card with different action button styles</p>
              <div class="card-actions justify-end">
                <button class="btn btn-outline btn-sm">Edit</button>
                <button class="btn btn-error btn-sm">Delete</button>
                <button class="btn btn-success btn-sm">Approve</button>
              </div>
            </div>
          </div>
          <div class="card bg-base-100 shadow-xl">
            <div class="card-body">
              <h2 class="card-title">Justified Actions</h2>
              <p>Card with justified actions</p>
              <div class="card-actions justify-between">
                <button class="btn btn-ghost">Back</button>
                <button class="btn btn-primary">Next</button>
              </div>
            </div>
          </div>
        </div>
      `;
      document.body.appendChild(container);
    });

    const container = page.locator("body > div").last();
    await expect(container).toHaveScreenshot("card-actions.png");
  });

  // Card content variations
  test("card content variations visual regression", async ({ page }) => {
    await page.evaluate(() => {
      const container = document.createElement("div");
      container.className = "p-8 space-y-6";
      container.innerHTML = `
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="card bg-base-100 shadow-xl">
            <div class="card-body">
              <h2 class="card-title">Text Content</h2>
              <p>This is a simple card with text content. It demonstrates how cards can contain various types of textual information.</p>
            </div>
          </div>
          <div class="card bg-base-100 shadow-xl">
            <div class="card-body">
              <h2 class="card-title">
                Badge Title
                <div class="badge badge-secondary">NEW</div>
              </h2>
              <p>Card with badge in title</p>
            </div>
          </div>
          <div class="card bg-base-100 shadow-xl">
            <div class="card-body">
              <h2 class="card-title">List Content</h2>
              <ul class="list-disc list-inside space-y-1">
                <li>Feature one</li>
                <li>Feature two</li>
                <li>Feature three</li>
              </ul>
            </div>
          </div>
          <div class="card bg-base-100 shadow-xl">
            <div class="card-body">
              <h2 class="card-title">Mixed Content</h2>
              <p>Card with mixed content types:</p>
              <div class="flex gap-2 mt-2">
                <div class="badge badge-primary">Tag 1</div>
                <div class="badge badge-secondary">Tag 2</div>
                <div class="badge badge-accent">Tag 3</div>
              </div>
              <div class="rating rating-sm mt-2">
                <input type="radio" class="mask mask-star-2 bg-orange-400" />
                <input type="radio" class="mask mask-star-2 bg-orange-400" />
                <input type="radio" class="mask mask-star-2 bg-orange-400" />
                <input type="radio" class="mask mask-star-2 bg-orange-400" />
                <input type="radio" class="mask mask-star-2 bg-orange-400" />
              </div>
            </div>
          </div>
        </div>
      `;
      document.body.appendChild(container);
    });

    const container = page.locator("body > div").last();
    await expect(container).toHaveScreenshot("card-content-variations.png");
  });

  // Card sizes and layouts
  test("card sizes and layouts visual regression", async ({ page }) => {
    await page.evaluate(() => {
      const container = document.createElement("div");
      container.className = "p-8 space-y-6";
      container.innerHTML = `
        <div class="space-y-6">
          <div class="card bg-base-100 shadow-xl w-96">
            <div class="card-body">
              <h2 class="card-title">Fixed Width Card</h2>
              <p>This card has a fixed width of 96 (24rem)</p>
            </div>
          </div>
          <div class="card bg-base-100 shadow-xl max-w-sm">
            <div class="card-body">
              <h2 class="card-title">Max Width Card</h2>
              <p>This card has a maximum width constraint</p>
            </div>
          </div>
          <div class="card bg-base-100 shadow-xl card-compact w-64">
            <div class="card-body">
              <h2 class="card-title">Compact Card</h2>
              <p>Compact card with reduced padding</p>
            </div>
          </div>
          <div class="card bg-base-100 shadow-xl">
            <div class="card-body">
              <h2 class="card-title">Full Width Card</h2>
              <p>This card takes the full width of its container</p>
            </div>
          </div>
        </div>
      `;
      document.body.appendChild(container);
    });

    const container = page.locator("body > div").last();
    await expect(container).toHaveScreenshot("card-sizes-layouts.png");
  });

  // Card hover effects
  test("card hover effects visual regression", async ({ page }) => {
    await page.evaluate(() => {
      const container = document.createElement("div");
      container.className = "p-8 space-y-6";
      container.innerHTML = `
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow cursor-pointer">
            <div class="card-body">
              <h2 class="card-title">Hover Shadow</h2>
              <p>Card with hover shadow effect</p>
            </div>
          </div>
          <div class="card bg-base-100 shadow-xl hover:scale-105 transition-transform cursor-pointer">
            <div class="card-body">
              <h2 class="card-title">Hover Scale</h2>
              <p>Card with hover scale effect</p>
            </div>
          </div>
          <div class="card bg-base-100 shadow-xl hover:bg-base-200 transition-colors cursor-pointer">
            <div class="card-body">
              <h2 class="card-title">Hover Background</h2>
              <p>Card with hover background effect</p>
            </div>
          </div>
          <div class="card bg-base-100 shadow-xl hover:shadow-2xl hover:scale-105 transition-all cursor-pointer">
            <div class="card-body">
              <h2 class="card-title">Combined Effects</h2>
              <p>Card with multiple hover effects</p>
            </div>
          </div>
        </div>
      `;
      document.body.appendChild(container);
    });

    const container = page.locator("body > div").last();
    await expect(container).toHaveScreenshot("card-hover-effects.png");
  });

  // Card grid layouts
  test("card grid layouts visual regression", async ({ page }) => {
    await page.evaluate(() => {
      const container = document.createElement("div");
      container.className = "p-8";
      container.innerHTML = `
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div class="card bg-base-100 shadow-xl">
            <figure>
              <img src="https://via.placeholder.com/400x200/EC4899/FFFFFF?text=Card+1" alt="Card 1" />
            </figure>
            <div class="card-body">
              <h2 class="card-title">Card 1</h2>
              <p>First card in grid layout</p>
              <div class="card-actions justify-end">
                <button class="btn btn-primary">View</button>
              </div>
            </div>
          </div>
          <div class="card bg-base-100 shadow-xl">
            <figure>
              <img src="https://via.placeholder.com/400x200/8B5CF6/FFFFFF?text=Card+2" alt="Card 2" />
            </figure>
            <div class="card-body">
              <h2 class="card-title">Card 2</h2>
              <p>Second card in grid layout</p>
              <div class="card-actions justify-end">
                <button class="btn btn-primary">View</button>
              </div>
            </div>
          </div>
          <div class="card bg-base-100 shadow-xl">
            <figure>
              <img src="https://via.placeholder.com/400x200/06B6D4/FFFFFF?text=Card+3" alt="Card 3" />
            </figure>
            <div class="card-body">
              <h2 class="card-title">Card 3</h2>
              <p>Third card in grid layout</p>
              <div class="card-actions justify-end">
                <button class="btn btn-primary">View</button>
              </div>
            </div>
          </div>
          <div class="card bg-base-100 shadow-xl">
            <div class="card-body">
              <h2 class="card-title">Card 4</h2>
              <p>Fourth card without image</p>
              <div class="card-actions justify-end">
                <button class="btn btn-primary">View</button>
              </div>
            </div>
          </div>
          <div class="card bg-base-100 shadow-xl">
            <div class="card-body">
              <h2 class="card-title">Card 5</h2>
              <p>Fifth card with longer content to test how cards handle different content lengths in a grid layout</p>
              <div class="card-actions justify-end">
                <button class="btn btn-primary">View</button>
              </div>
            </div>
          </div>
          <div class="card bg-base-100 shadow-xl">
            <div class="card-body">
              <h2 class="card-title">Card 6</h2>
              <p>Sixth card in grid</p>
              <div class="card-actions justify-end">
                <button class="btn btn-primary">View</button>
              </div>
            </div>
          </div>
        </div>
      `;
      document.body.appendChild(container);
    });

    const container = page.locator("body > div").last();
    await expect(container).toHaveScreenshot("card-grid-layouts.png");
  });

  // Accessibility testing
  test("card accessibility visual regression", async ({ page }) => {
    // Test high contrast mode
    await page.emulateMedia({ reducedMotion: "reduce" });

    const cardSection = page.locator(".card").first();
    await expect(cardSection).toHaveScreenshot("cards-reduced-motion.png");
  });

  // Card states
  test("card states visual regression", async ({ page }) => {
    await page.evaluate(() => {
      const container = document.createElement("div");
      container.className = "p-8 space-y-6";
      container.innerHTML = `
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="card bg-base-100 shadow-xl">
            <div class="card-body">
              <h2 class="card-title">Normal State</h2>
              <p>Default card state</p>
            </div>
          </div>
          <div class="card bg-base-100 shadow-xl opacity-50">
            <div class="card-body">
              <h2 class="card-title">Disabled State</h2>
              <p>Card with reduced opacity</p>
            </div>
          </div>
          <div class="card bg-success text-success-content shadow-xl">
            <div class="card-body">
              <h2 class="card-title">Success State</h2>
              <p>Card with success styling</p>
            </div>
          </div>
          <div class="card bg-error text-error-content shadow-xl">
            <div class="card-body">
              <h2 class="card-title">Error State</h2>
              <p>Card with error styling</p>
            </div>
          </div>
        </div>
      `;
      document.body.appendChild(container);
    });

    const container = page.locator("body > div").last();
    await expect(container).toHaveScreenshot("card-states.png");
  });
});
