import { expect, test } from "@playwright/test";

test.describe("Countdown Visual Tests", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:8001/components/display/countdown");
    await page.waitForLoadState("networkidle");
  });

  test("countdown variants visual regression", async ({ page }) => {
    const basicSection = page.locator(".card").first();
    await expect(basicSection).toHaveScreenshot("countdown-basic-variants.png");
  });

  test("countdown styles visual regression", async ({ page }) => {
    const stylesSection = page.locator(".card").nth(1);
    await expect(stylesSection).toHaveScreenshot("countdown-styles.png");
  });

  test("countdown sizes visual regression", async ({ page }) => {
    const sizesSection = page.locator(".card").nth(2);
    await expect(sizesSection).toHaveScreenshot("countdown-sizes.png");
  });

  test("countdown different formats", async ({ page }) => {
    // Create countdown with different time formats
    await page.evaluate(() => {
      const container = document.createElement("div");
      container.className = "p-4 space-y-6";
      container.innerHTML = `
        <!-- Days, hours, minutes, seconds -->
        <div class="grid grid-flow-col gap-5 text-center auto-cols-max">
          <div class="flex flex-col p-2 bg-neutral rounded-box text-neutral-content">
            <span class="countdown font-mono text-5xl">
              <span style="--value:15;"></span>
            </span>
            days
          </div> 
          <div class="flex flex-col p-2 bg-neutral rounded-box text-neutral-content">
            <span class="countdown font-mono text-5xl">
              <span style="--value:10;"></span>
            </span>
            hours
          </div> 
          <div class="flex flex-col p-2 bg-neutral rounded-box text-neutral-content">
            <span class="countdown font-mono text-5xl">
              <span style="--value:24;"></span>
            </span>
            min
          </div> 
          <div class="flex flex-col p-2 bg-neutral rounded-box text-neutral-content">
            <span class="countdown font-mono text-5xl">
              <span style="--value:48;"></span>
            </span>
            sec
          </div>
        </div>
        
        <!-- Clock format -->
        <div class="flex gap-5 justify-center">
          <div>
            <span class="countdown font-mono text-6xl">
              <span style="--value:15;"></span>:
              <span style="--value:25;"></span>:
              <span style="--value:12;"></span>
            </span>
          </div>
        </div>
        
        <!-- Single unit countdown -->
        <div class="text-center">
          <span class="countdown font-mono text-8xl">
            <span style="--value:89;"></span>
          </span>
          <div class="text-lg">seconds until launch</div>
        </div>
      `;
      document.body.appendChild(container);
    });

    const container = page.locator("div").last();
    await expect(container).toHaveScreenshot("countdown-different-formats.png");
  });

  test("countdown color themes", async ({ page }) => {
    // Create countdown with different color themes
    await page.evaluate(() => {
      const container = document.createElement("div");
      container.className = "p-4 space-y-4";
      container.innerHTML = `
        <!-- Primary theme -->
        <div class="grid grid-flow-col gap-3 text-center auto-cols-max">
          <div class="flex flex-col p-2 bg-primary rounded-box text-primary-content">
            <span class="countdown font-mono text-3xl">
              <span style="--value:23;"></span>
            </span>
            hours
          </div>
          <div class="flex flex-col p-2 bg-primary rounded-box text-primary-content">
            <span class="countdown font-mono text-3xl">
              <span style="--value:59;"></span>
            </span>
            min
          </div>
        </div>
        
        <!-- Secondary theme -->
        <div class="grid grid-flow-col gap-3 text-center auto-cols-max">
          <div class="flex flex-col p-2 bg-secondary rounded-box text-secondary-content">
            <span class="countdown font-mono text-3xl">
              <span style="--value:18;"></span>
            </span>
            hours
          </div>
          <div class="flex flex-col p-2 bg-secondary rounded-box text-secondary-content">
            <span class="countdown font-mono text-3xl">
              <span style="--value:42;"></span>
            </span>
            min
          </div>
        </div>
        
        <!-- Accent theme -->
        <div class="grid grid-flow-col gap-3 text-center auto-cols-max">
          <div class="flex flex-col p-2 bg-accent rounded-box text-accent-content">
            <span class="countdown font-mono text-3xl">
              <span style="--value:07;"></span>
            </span>
            hours
          </div>
          <div class="flex flex-col p-2 bg-accent rounded-box text-accent-content">
            <span class="countdown font-mono text-3xl">
              <span style="--value:33;"></span>
            </span>
            min
          </div>
        </div>
      `;
      document.body.appendChild(container);
    });

    const container = page.locator("div").last();
    await expect(container).toHaveScreenshot("countdown-color-themes.png");
  });

  test("countdown size variations", async ({ page }) => {
    // Create countdown with different sizes
    await page.evaluate(() => {
      const container = document.createElement("div");
      container.className = "p-4 space-y-6 text-center";
      container.innerHTML = `
        <!-- Extra small -->
        <div>
          <span class="countdown font-mono text-xs">
            <span style="--value:12;"></span>:
            <span style="--value:34;"></span>
          </span>
          <div class="text-xs">XS Size</div>
        </div>
        
        <!-- Small -->
        <div>
          <span class="countdown font-mono text-sm">
            <span style="--value:12;"></span>:
            <span style="--value:34;"></span>
          </span>
          <div class="text-sm">Small Size</div>
        </div>
        
        <!-- Medium -->
        <div>
          <span class="countdown font-mono text-2xl">
            <span style="--value:12;"></span>:
            <span style="--value:34;"></span>
          </span>
          <div class="text-base">Medium Size</div>
        </div>
        
        <!-- Large -->
        <div>
          <span class="countdown font-mono text-4xl">
            <span style="--value:12;"></span>:
            <span style="--value:34;"></span>
          </span>
          <div class="text-lg">Large Size</div>
        </div>
        
        <!-- Extra large -->
        <div>
          <span class="countdown font-mono text-6xl">
            <span style="--value:12;"></span>:
            <span style="--value:34;"></span>
          </span>
          <div class="text-xl">XL Size</div>
        </div>
      `;
      document.body.appendChild(container);
    });

    const container = page.locator("div").last();
    await expect(container).toHaveScreenshot("countdown-size-variations.png");
  });

  test("countdown layout styles", async ({ page }) => {
    // Create countdown with different layout styles
    await page.evaluate(() => {
      const container = document.createElement("div");
      container.className = "p-4 space-y-6";
      container.innerHTML = `
        <!-- Boxed style -->
        <div class="flex justify-center">
          <div class="grid grid-flow-col gap-5 text-center auto-cols-max">
            <div class="flex flex-col p-4 bg-neutral rounded-box text-neutral-content border-2 border-neutral-focus">
              <span class="countdown font-mono text-4xl">
                <span style="--value:05;"></span>
              </span>
              <span class="text-xs">DAYS</span>
            </div>
            <div class="flex flex-col p-4 bg-neutral rounded-box text-neutral-content border-2 border-neutral-focus">
              <span class="countdown font-mono text-4xl">
                <span style="--value:14;"></span>
              </span>
              <span class="text-xs">HOURS</span>
            </div>
          </div>
        </div>
        
        <!-- Minimal style -->
        <div class="text-center">
          <span class="countdown font-mono text-5xl text-primary">
            <span style="--value:02;"></span>:
            <span style="--value:45;"></span>:
            <span style="--value:33;"></span>
          </span>
          <div class="text-sm opacity-60 mt-1">TIME REMAINING</div>
        </div>
        
        <!-- Card style -->
        <div class="flex justify-center">
          <div class="grid grid-flow-col gap-3 text-center auto-cols-max">
            <div class="flex flex-col p-3 bg-base-100 rounded-lg shadow-lg">
              <span class="countdown font-mono text-3xl text-primary">
                <span style="--value:28;"></span>
              </span>
              <span class="text-xs uppercase tracking-wide">Days</span>
            </div>
            <div class="flex flex-col p-3 bg-base-100 rounded-lg shadow-lg">
              <span class="countdown font-mono text-3xl text-secondary">
                <span style="--value:16;"></span>
              </span>
              <span class="text-xs uppercase tracking-wide">Hours</span>
            </div>
            <div class="flex flex-col p-3 bg-base-100 rounded-lg shadow-lg">
              <span class="countdown font-mono text-3xl text-accent">
                <span style="--value:47;"></span>
              </span>
              <span class="text-xs uppercase tracking-wide">Minutes</span>
            </div>
          </div>
        </div>
      `;
      document.body.appendChild(container);
    });

    const container = page.locator("div").last();
    await expect(container).toHaveScreenshot("countdown-layout-styles.png");
  });

  test("countdown in different themes", async ({ page }) => {
    const themes = ["light", "dark", "cupcake", "cyberpunk"];

    for (const theme of themes) {
      await page.evaluate((theme) => {
        document.documentElement.setAttribute("data-theme", theme);
      }, theme);

      await page.waitForTimeout(100);

      const countdownSection = page.locator(".countdown").first();
      await expect(countdownSection).toHaveScreenshot(`countdown-theme-${theme}.png`);
    }
  });

  test("countdown responsive design", async ({ page }) => {
    const viewports = [
      { width: 375, height: 667, name: "mobile" },
      { width: 768, height: 1024, name: "tablet" },
      { width: 1920, height: 1080, name: "desktop" },
    ];

    for (const viewport of viewports) {
      await page.setViewportSize(viewport);

      const countdownSection = page.locator(".countdown").first();
      await expect(countdownSection).toHaveScreenshot(`countdown-${viewport.name}.png`);
    }
  });

  test("countdown with labels and descriptions", async ({ page }) => {
    // Create countdown with descriptive labels
    await page.evaluate(() => {
      const container = document.createElement("div");
      container.className = "p-4 space-y-6";
      container.innerHTML = `
        <!-- Event countdown -->
        <div class="text-center">
          <h2 class="text-2xl font-bold mb-4">Product Launch</h2>
          <div class="grid grid-flow-col gap-5 text-center auto-cols-max justify-center">
            <div class="flex flex-col">
              <span class="countdown font-mono text-4xl">
                <span style="--value:30;"></span>
              </span>
              <span class="text-sm uppercase">Days</span>
            </div>
            <div class="flex flex-col">
              <span class="countdown font-mono text-4xl">
                <span style="--value:12;"></span>
              </span>
              <span class="text-sm uppercase">Hours</span>
            </div>
            <div class="flex flex-col">
              <span class="countdown font-mono text-4xl">
                <span style="--value:45;"></span>
              </span>
              <span class="text-sm uppercase">Minutes</span>
            </div>
          </div>
          <p class="text-sm opacity-70 mt-4">Don't miss out on our biggest release yet!</p>
        </div>
        
        <!-- Sale countdown -->
        <div class="bg-error text-error-content p-6 rounded-lg text-center">
          <h3 class="text-xl font-bold mb-2">Flash Sale Ends In:</h3>
          <span class="countdown font-mono text-6xl">
            <span style="--value:02;"></span>:
            <span style="--value:59;"></span>:
            <span style="--value:42;"></span>
          </span>
          <div class="text-sm mt-2">Hours : Minutes : Seconds</div>
          <p class="text-sm mt-4">Save up to 50% on all items!</p>
        </div>
      `;
      document.body.appendChild(container);
    });

    const container = page.locator("div").last();
    await expect(container).toHaveScreenshot("countdown-with-labels.png");
  });

  test("countdown animation frames", async ({ page }) => {
    const countdown = page.locator(".countdown").first();

    // Take initial screenshot
    await expect(countdown).toHaveScreenshot("countdown-frame-1.png");

    // Wait a moment and take another screenshot
    await page.waitForTimeout(500);
    await expect(countdown).toHaveScreenshot("countdown-frame-2.png");
  });
});
