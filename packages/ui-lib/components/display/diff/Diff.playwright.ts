import { expect, test } from "@playwright/test";

test.describe("Diff Visual Tests", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:8001/components/display/diff");
    await page.waitForLoadState("networkidle");
  });

  test("diff variants visual regression", async ({ page }) => {
    const basicSection = page.locator(".card").first();
    await expect(basicSection).toHaveScreenshot("diff-basic-variants.png");
  });

  test("diff text comparison visual regression", async ({ page }) => {
    const textSection = page.locator(".card").nth(1);
    await expect(textSection).toHaveScreenshot("diff-text-comparison.png");
  });

  test("diff image comparison visual regression", async ({ page }) => {
    const imageSection = page.locator(".card").nth(2);
    await expect(imageSection).toHaveScreenshot("diff-image-comparison.png");
  });

  test("diff resizer interaction", async ({ page }) => {
    const diff = page.locator(".diff").first();
    const resizer = diff.locator(".diff-resizer");

    // Initial state
    await expect(diff).toHaveScreenshot("diff-initial.png");

    if (await resizer.count() > 0) {
      // Drag resizer to different positions
      const resizerBox = await resizer.boundingBox();
      const diffBox = await diff.boundingBox();

      if (resizerBox && diffBox) {
        // Drag to 25% position
        await page.mouse.move(
          resizerBox.x + resizerBox.width / 2,
          resizerBox.y + resizerBox.height / 2,
        );
        await page.mouse.down();
        await page.mouse.move(
          diffBox.x + diffBox.width * 0.25,
          resizerBox.y + resizerBox.height / 2,
        );
        await page.mouse.up();

        await page.waitForTimeout(200);
        await expect(diff).toHaveScreenshot("diff-25-percent.png");

        // Drag to 75% position
        await page.mouse.move(
          diffBox.x + diffBox.width * 0.25,
          resizerBox.y + resizerBox.height / 2,
        );
        await page.mouse.down();
        await page.mouse.move(
          diffBox.x + diffBox.width * 0.75,
          resizerBox.y + resizerBox.height / 2,
        );
        await page.mouse.up();

        await page.waitForTimeout(200);
        await expect(diff).toHaveScreenshot("diff-75-percent.png");
      }
    }
  });

  test("diff content types", async ({ page }) => {
    // Create different types of diff content
    await page.evaluate(() => {
      const container = document.createElement("div");
      container.className = "p-4 space-y-6";
      container.innerHTML = `
        <!-- Text diff -->
        <div class="diff aspect-[16/9]">
          <div class="diff-item-1">
            <div class="bg-primary text-primary-content text-9xl font-black grid place-content-center">
              OLD
            </div>
          </div>
          <div class="diff-item-2">
            <div class="bg-base-200 text-9xl font-black grid place-content-center">
              NEW
            </div>
          </div>
          <div class="diff-resizer"></div>
        </div>
        
        <!-- Image diff -->
        <div class="diff aspect-[16/9]">
          <div class="diff-item-1">
            <img alt="Before" src="https://placeimg.com/400/200/arch" />
          </div>
          <div class="diff-item-2">
            <img alt="After" src="https://placeimg.com/400/200/nature" />
          </div>
          <div class="diff-resizer"></div>
        </div>
        
        <!-- Component diff -->
        <div class="diff aspect-[16/9]">
          <div class="diff-item-1">
            <div class="bg-warning text-warning-content p-8">
              <h2 class="text-2xl font-bold">Version 1.0</h2>
              <p>Basic functionality</p>
              <ul class="list-disc list-inside mt-2">
                <li>Feature A</li>
                <li>Feature B</li>
              </ul>
            </div>
          </div>
          <div class="diff-item-2">
            <div class="bg-success text-success-content p-8">
              <h2 class="text-2xl font-bold">Version 2.0</h2>
              <p>Enhanced functionality</p>
              <ul class="list-disc list-inside mt-2">
                <li>Feature A</li>
                <li>Feature B</li>
                <li>Feature C</li>
                <li>Feature D</li>
              </ul>
            </div>
          </div>
          <div class="diff-resizer"></div>
        </div>
      `;
      document.body.appendChild(container);
    });

    const container = page.locator("div").last();
    await expect(container).toHaveScreenshot("diff-content-types.png");
  });

  test("diff aspect ratios", async ({ page }) => {
    // Create diff with different aspect ratios
    await page.evaluate(() => {
      const container = document.createElement("div");
      container.className = "p-4 space-y-4";
      container.innerHTML = `
        <!-- Square aspect -->
        <div class="diff aspect-square max-w-sm">
          <div class="diff-item-1">
            <div class="bg-primary text-primary-content grid place-content-center h-full">
              <span class="text-4xl font-bold">1:1</span>
            </div>
          </div>
          <div class="diff-item-2">
            <div class="bg-secondary text-secondary-content grid place-content-center h-full">
              <span class="text-4xl font-bold">SQUARE</span>
            </div>
          </div>
          <div class="diff-resizer"></div>
        </div>
        
        <!-- Wide aspect -->
        <div class="diff aspect-[21/9]">
          <div class="diff-item-1">
            <div class="bg-accent text-accent-content grid place-content-center h-full">
              <span class="text-2xl font-bold">21:9 ULTRAWIDE</span>
            </div>
          </div>
          <div class="diff-item-2">
            <div class="bg-neutral text-neutral-content grid place-content-center h-full">
              <span class="text-2xl font-bold">CINEMATIC</span>
            </div>
          </div>
          <div class="diff-resizer"></div>
        </div>
        
        <!-- Portrait aspect -->
        <div class="diff aspect-[9/16] max-w-sm">
          <div class="diff-item-1">
            <div class="bg-info text-info-content grid place-content-center h-full">
              <span class="text-lg font-bold text-center">9:16<br/>MOBILE</span>
            </div>
          </div>
          <div class="diff-item-2">
            <div class="bg-success text-success-content grid place-content-center h-full">
              <span class="text-lg font-bold text-center">PORTRAIT<br/>VIEW</span>
            </div>
          </div>
          <div class="diff-resizer"></div>
        </div>
      `;
      document.body.appendChild(container);
    });

    const container = page.locator("div").last();
    await expect(container).toHaveScreenshot("diff-aspect-ratios.png");
  });

  test("diff with labels and descriptions", async ({ page }) => {
    // Create diff with labels and descriptions
    await page.evaluate(() => {
      const container = document.createElement("div");
      container.className = "p-4 space-y-6";
      container.innerHTML = `
        <!-- Diff with labels -->
        <div>
          <div class="flex justify-between items-center mb-2">
            <h3 class="text-lg font-semibold">Design Comparison</h3>
            <div class="text-sm text-gray-500">Drag to compare</div>
          </div>
          <div class="diff aspect-[16/9] border rounded-lg overflow-hidden">
            <div class="diff-item-1">
              <div class="bg-gradient-to-br from-blue-400 to-blue-600 text-white p-8">
                <div class="absolute top-4 left-4 bg-black bg-opacity-50 px-2 py-1 rounded text-sm">
                  BEFORE
                </div>
                <h2 class="text-3xl font-bold mb-4">Old Design</h2>
                <p>Traditional layout with basic styling</p>
              </div>
            </div>
            <div class="diff-item-2">
              <div class="bg-gradient-to-br from-purple-400 to-pink-600 text-white p-8">
                <div class="absolute top-4 right-4 bg-black bg-opacity-50 px-2 py-1 rounded text-sm">
                  AFTER
                </div>
                <h2 class="text-3xl font-bold mb-4">New Design</h2>
                <p>Modern layout with enhanced visual appeal</p>
              </div>
            </div>
            <div class="diff-resizer"></div>
          </div>
          <div class="flex justify-between text-sm text-gray-600 mt-2">
            <span>Previous Version</span>
            <span>Current Version</span>
          </div>
        </div>
        
        <!-- Performance comparison -->
        <div>
          <h3 class="text-lg font-semibold mb-2">Performance Before/After</h3>
          <div class="diff aspect-[16/9]">
            <div class="diff-item-1">
              <div class="bg-red-100 p-6 h-full flex flex-col justify-center">
                <h3 class="text-2xl font-bold text-red-800 mb-4">Before Optimization</h3>
                <div class="space-y-2">
                  <div class="text-red-600">Load Time: 3.2s</div>
                  <div class="text-red-600">Bundle Size: 450KB</div>
                  <div class="text-red-600">Performance Score: 65</div>
                </div>
              </div>
            </div>
            <div class="diff-item-2">
              <div class="bg-green-100 p-6 h-full flex flex-col justify-center">
                <h3 class="text-2xl font-bold text-green-800 mb-4">After Optimization</h3>
                <div class="space-y-2">
                  <div class="text-green-600">Load Time: 1.1s</div>
                  <div class="text-green-600">Bundle Size: 280KB</div>
                  <div class="text-green-600">Performance Score: 92</div>
                </div>
              </div>
            </div>
            <div class="diff-resizer"></div>
          </div>
        </div>
      `;
      document.body.appendChild(container);
    });

    const container = page.locator("div").last();
    await expect(container).toHaveScreenshot("diff-with-labels.png");
  });

  test("diff in different themes", async ({ page }) => {
    const themes = ["light", "dark", "cupcake", "cyberpunk"];

    for (const theme of themes) {
      await page.evaluate((theme) => {
        document.documentElement.setAttribute("data-theme", theme);
      }, theme);

      await page.waitForTimeout(100);

      const diffSection = page.locator(".diff").first();
      await expect(diffSection).toHaveScreenshot(`diff-theme-${theme}.png`);
    }
  });

  test("diff responsive design", async ({ page }) => {
    const viewports = [
      { width: 375, height: 667, name: "mobile" },
      { width: 768, height: 1024, name: "tablet" },
      { width: 1920, height: 1080, name: "desktop" },
    ];

    for (const viewport of viewports) {
      await page.setViewportSize(viewport);

      const diffSection = page.locator(".diff").first();
      await expect(diffSection).toHaveScreenshot(`diff-${viewport.name}.png`);
    }
  });

  test("diff with custom styling", async ({ page }) => {
    // Create diff with custom borders and shadows
    await page.evaluate(() => {
      const container = document.createElement("div");
      container.className = "p-4";
      container.innerHTML = `
        <div class="diff aspect-[16/9] border-4 border-primary rounded-xl shadow-2xl overflow-hidden">
          <div class="diff-item-1">
            <div class="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white p-8">
              <h2 class="text-4xl font-bold mb-4">BEFORE</h2>
              <div class="grid grid-cols-2 gap-4">
                <div class="bg-white bg-opacity-20 p-4 rounded">Feature 1</div>
                <div class="bg-white bg-opacity-20 p-4 rounded">Feature 2</div>
              </div>
            </div>
          </div>
          <div class="diff-item-2">
            <div class="bg-gradient-to-r from-green-400 to-blue-500 text-white p-8">
              <h2 class="text-4xl font-bold mb-4">AFTER</h2>
              <div class="grid grid-cols-2 gap-4">
                <div class="bg-white bg-opacity-20 p-4 rounded">Feature 1</div>
                <div class="bg-white bg-opacity-20 p-4 rounded">Feature 2</div>
                <div class="bg-white bg-opacity-20 p-4 rounded">Feature 3</div>
                <div class="bg-white bg-opacity-20 p-4 rounded">Feature 4</div>
              </div>
            </div>
          </div>
          <div class="diff-resizer bg-white shadow-lg"></div>
        </div>
      `;
      document.body.appendChild(container);
    });

    const container = page.locator("div").last();
    await expect(container).toHaveScreenshot("diff-custom-styling.png");
  });

  test("diff resizer states", async ({ page }) => {
    const diff = page.locator(".diff").first();
    const resizer = diff.locator(".diff-resizer");

    if (await resizer.count() > 0) {
      // Normal state
      await expect(resizer).toHaveScreenshot("diff-resizer-normal.png");

      // Hover state
      await resizer.hover();
      await expect(resizer).toHaveScreenshot("diff-resizer-hover.png");

      // Active state (mouse down)
      await page.mouse.down();
      await expect(resizer).toHaveScreenshot("diff-resizer-active.png");
      await page.mouse.up();
    }
  });
});
