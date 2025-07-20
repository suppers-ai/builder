import { expect, test } from "@playwright/test";

test.describe("Collapse Visual Tests", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:8001/components/display/collapse");
    await page.waitForLoadState("networkidle");
  });

  test("collapse variants visual regression", async ({ page }) => {
    const basicSection = page.locator(".card").first();
    await expect(basicSection).toHaveScreenshot("collapse-basic-variants.png");
  });

  test("collapse with icons visual regression", async ({ page }) => {
    const iconsSection = page.locator(".card").nth(1);
    await expect(iconsSection).toHaveScreenshot("collapse-icons.png");
  });

  test("collapse accordion visual regression", async ({ page }) => {
    const accordionSection = page.locator(".card").nth(2);
    await expect(accordionSection).toHaveScreenshot("collapse-accordion.png");
  });

  test("collapse interaction states", async ({ page }) => {
    const collapse = page.locator(".collapse").first();

    // Closed state
    await expect(collapse).toHaveScreenshot("collapse-closed.png");

    // Find and click collapse trigger
    const trigger = collapse.locator(
      ".collapse-title, input[type='checkbox'], input[type='radio']",
    );
    if (await trigger.count() > 0) {
      await trigger.first().click();
      await page.waitForTimeout(300); // Wait for animation

      // Open state
      await expect(collapse).toHaveScreenshot("collapse-open.png");
    }
  });

  test("collapse types variations", async ({ page }) => {
    // Create different collapse types
    await page.evaluate(() => {
      const container = document.createElement("div");
      container.className = "p-4 space-y-4";
      container.innerHTML = `
        <!-- Checkbox based collapse -->
        <div class="collapse collapse-checkbox bg-base-200">
          <input type="checkbox" /> 
          <div class="collapse-title text-xl font-medium">
            Click me to show/hide content
          </div>
          <div class="collapse-content"> 
            <p>hello</p>
          </div>
        </div>
        
        <!-- Radio based collapse -->
        <div class="collapse collapse-radio bg-base-200">
          <input type="radio" name="my-accordion-1" /> 
          <div class="collapse-title text-xl font-medium">
            Radio Collapse 1
          </div>
          <div class="collapse-content"> 
            <p>Radio content 1</p>
          </div>
        </div>
        
        <!-- Plus/minus icon collapse -->
        <div class="collapse collapse-plus bg-base-200">
          <input type="checkbox" /> 
          <div class="collapse-title text-xl font-medium">
            Plus/Minus Collapse
          </div>
          <div class="collapse-content"> 
            <p>Content with plus/minus icon</p>
          </div>
        </div>
        
        <!-- Arrow icon collapse -->
        <div class="collapse collapse-arrow bg-base-200">
          <input type="checkbox" /> 
          <div class="collapse-title text-xl font-medium">
            Arrow Collapse
          </div>
          <div class="collapse-content"> 
            <p>Content with arrow icon</p>
          </div>
        </div>
      `;
      document.body.appendChild(container);
    });

    const container = page.locator("div").last();
    await expect(container).toHaveScreenshot("collapse-types-variations.png");
  });

  test("collapse with rich content", async ({ page }) => {
    // Create collapse with various content types
    await page.evaluate(() => {
      const container = document.createElement("div");
      container.className = "p-4 space-y-4";
      container.innerHTML = `
        <!-- Collapse with form -->
        <div class="collapse collapse-arrow bg-base-200">
          <input type="checkbox" /> 
          <div class="collapse-title text-xl font-medium">
            Contact Form
          </div>
          <div class="collapse-content"> 
            <form class="space-y-4">
              <input type="text" placeholder="Name" class="input input-bordered w-full" />
              <input type="email" placeholder="Email" class="input input-bordered w-full" />
              <textarea placeholder="Message" class="textarea textarea-bordered w-full"></textarea>
              <button class="btn btn-primary">Submit</button>
            </form>
          </div>
        </div>
        
        <!-- Collapse with list -->
        <div class="collapse collapse-plus bg-base-200">
          <input type="checkbox" /> 
          <div class="collapse-title text-xl font-medium">
            Features List
          </div>
          <div class="collapse-content"> 
            <ul class="list-disc list-inside space-y-1">
              <li>Feature 1: Advanced analytics</li>
              <li>Feature 2: Real-time updates</li>
              <li>Feature 3: Custom dashboards</li>
              <li>Feature 4: Team collaboration</li>
            </ul>
          </div>
        </div>
        
        <!-- Collapse with image -->
        <div class="collapse collapse-arrow bg-base-200">
          <input type="checkbox" /> 
          <div class="collapse-title text-xl font-medium">
            Product Gallery
          </div>
          <div class="collapse-content"> 
            <div class="grid grid-cols-2 gap-4">
              <img src="https://placeimg.com/150/150/tech" class="rounded" />
              <img src="https://placeimg.com/150/150/nature" class="rounded" />
            </div>
          </div>
        </div>
      `;
      document.body.appendChild(container);
    });

    const container = page.locator("div").last();
    await expect(container).toHaveScreenshot("collapse-rich-content.png");
  });

  test("collapse accordion group", async ({ page }) => {
    // Create accordion-style collapse group
    await page.evaluate(() => {
      const container = document.createElement("div");
      container.className = "p-4";
      container.innerHTML = `
        <div class="space-y-2">
          <div class="collapse collapse-arrow bg-base-200">
            <input type="radio" name="my-accordion-2" checked="checked" /> 
            <div class="collapse-title text-xl font-medium">
              Section 1: Getting Started
            </div>
            <div class="collapse-content"> 
              <p>Welcome to our platform! Here you'll find everything you need to get started with your journey.</p>
            </div>
          </div>
          
          <div class="collapse collapse-arrow bg-base-200">
            <input type="radio" name="my-accordion-2" /> 
            <div class="collapse-title text-xl font-medium">
              Section 2: Advanced Features
            </div>
            <div class="collapse-content"> 
              <p>Explore advanced features that will help you maximize your productivity and efficiency.</p>
            </div>
          </div>
          
          <div class="collapse collapse-arrow bg-base-200">
            <input type="radio" name="my-accordion-2" /> 
            <div class="collapse-title text-xl font-medium">
              Section 3: Support & Help
            </div>
            <div class="collapse-content"> 
              <p>Need help? Our support team is here to assist you with any questions or issues.</p>
            </div>
          </div>
        </div>
      `;
      document.body.appendChild(container);
    });

    const container = page.locator("div").last();
    await expect(container).toHaveScreenshot("collapse-accordion-group.png");
  });

  test("collapse in different themes", async ({ page }) => {
    const themes = ["light", "dark", "cupcake", "cyberpunk"];

    for (const theme of themes) {
      await page.evaluate((theme) => {
        document.documentElement.setAttribute("data-theme", theme);
      }, theme);

      await page.waitForTimeout(100);

      const collapseSection = page.locator(".collapse").first();
      await expect(collapseSection).toHaveScreenshot(`collapse-theme-${theme}.png`);
    }
  });

  test("collapse responsive design", async ({ page }) => {
    const viewports = [
      { width: 375, height: 667, name: "mobile" },
      { width: 768, height: 1024, name: "tablet" },
      { width: 1920, height: 1080, name: "desktop" },
    ];

    for (const viewport of viewports) {
      await page.setViewportSize(viewport);

      const collapseSection = page.locator(".collapse").first();
      await expect(collapseSection).toHaveScreenshot(`collapse-${viewport.name}.png`);
    }
  });

  test("collapse custom styling", async ({ page }) => {
    // Create collapse with custom styling
    await page.evaluate(() => {
      const container = document.createElement("div");
      container.className = "p-4 space-y-4";
      container.innerHTML = `
        <!-- Bordered collapse -->
        <div class="collapse collapse-arrow border border-base-300 bg-base-100 rounded-box">
          <input type="checkbox" /> 
          <div class="collapse-title text-xl font-medium">
            Bordered Collapse
          </div>
          <div class="collapse-content"> 
            <p>Content in a bordered collapse</p>
          </div>
        </div>
        
        <!-- Colored collapse -->
        <div class="collapse collapse-plus bg-primary text-primary-content">
          <input type="checkbox" /> 
          <div class="collapse-title text-xl font-medium">
            Primary Colored Collapse
          </div>
          <div class="collapse-content"> 
            <p>Content in a primary colored collapse</p>
          </div>
        </div>
        
        <!-- Shadow collapse -->
        <div class="collapse collapse-arrow bg-base-100 shadow-xl">
          <input type="checkbox" /> 
          <div class="collapse-title text-xl font-medium">
            Shadow Collapse
          </div>
          <div class="collapse-content"> 
            <p>Content in a shadowed collapse</p>
          </div>
        </div>
      `;
      document.body.appendChild(container);
    });

    const container = page.locator("div").last();
    await expect(container).toHaveScreenshot("collapse-custom-styling.png");
  });

  test("collapse focus states", async ({ page }) => {
    const collapseInput = page.locator(".collapse input").first();

    if (await collapseInput.count() > 0) {
      // Focus state
      await collapseInput.focus();
      await expect(collapseInput).toHaveScreenshot("collapse-focus.png");

      // Active state (checked)
      await collapseInput.check();
      await page.waitForTimeout(200);
      await expect(collapseInput).toHaveScreenshot("collapse-active.png");
    }
  });
});
