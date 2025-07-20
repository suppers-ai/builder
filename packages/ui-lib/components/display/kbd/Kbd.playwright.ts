import { expect, test } from "@playwright/test";

test.describe("Kbd Visual Tests", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:8001/components/display/kbd");
    await page.waitForLoadState("networkidle");
  });

  test("kbd variants visual regression", async ({ page }) => {
    const basicSection = page.locator(".card").first();
    await expect(basicSection).toHaveScreenshot("kbd-basic-variants.png");
  });

  test("kbd sizes visual regression", async ({ page }) => {
    const sizesSection = page.locator(".card").nth(1);
    await expect(sizesSection).toHaveScreenshot("kbd-sizes.png");
  });

  test("kbd styles visual regression", async ({ page }) => {
    const stylesSection = page.locator(".card").nth(2);
    await expect(stylesSection).toHaveScreenshot("kbd-styles.png");
  });

  test("kbd combinations visual regression", async ({ page }) => {
    const combinationsSection = page.locator(".card").nth(3);
    await expect(combinationsSection).toHaveScreenshot("kbd-combinations.png");
  });

  test("kbd interaction states", async ({ page }) => {
    const kbdElement = page.locator(".kbd").first();

    // Normal state
    await expect(kbdElement).toHaveScreenshot("kbd-normal.png");

    // Hover state (if interactive)
    const isInteractive = await kbdElement.evaluate((el) =>
      el.classList.contains("cursor-pointer")
    );
    if (isInteractive) {
      await kbdElement.hover();
      await expect(kbdElement).toHaveScreenshot("kbd-hover.png");
    }
  });

  test("keyboard shortcut combinations", async ({ page }) => {
    // Create various keyboard combinations for visual testing
    await page.evaluate(() => {
      const container = document.createElement("div");
      container.className = "p-4 space-y-4";
      container.innerHTML = `
        <!-- Single keys -->
        <div class="space-x-2">
          <kbd class="kbd">⌘</kbd>
          <kbd class="kbd">⌥</kbd>
          <kbd class="kbd">⌃</kbd>
          <kbd class="kbd">⇧</kbd>
        </div>
        
        <!-- Key combinations -->
        <div class="space-x-1">
          <kbd class="kbd kbd-sm">⌘</kbd>
          <span>+</span>
          <kbd class="kbd kbd-sm">K</kbd>
        </div>
        
        <div class="space-x-1">
          <kbd class="kbd kbd-sm">Ctrl</kbd>
          <span>+</span>
          <kbd class="kbd kbd-sm">Shift</kbd>
          <span>+</span>
          <kbd class="kbd kbd-sm">P</kbd>
        </div>
        
        <!-- Function keys -->
        <div class="space-x-2">
          <kbd class="kbd kbd-xs">F1</kbd>
          <kbd class="kbd kbd-xs">F2</kbd>
          <kbd class="kbd kbd-xs">F12</kbd>
        </div>
        
        <!-- Special keys -->
        <div class="space-x-2">
          <kbd class="kbd">↵</kbd>
          <kbd class="kbd">⌫</kbd>
          <kbd class="kbd">⌦</kbd>
          <kbd class="kbd">⇥</kbd>
        </div>
      `;
      document.body.appendChild(container);
    });

    const container = page.locator("div").last();
    await expect(container).toHaveScreenshot("kbd-shortcut-combinations.png");
  });

  test("kbd with different content types", async ({ page }) => {
    // Create kbd elements with various content types
    await page.evaluate(() => {
      const container = document.createElement("div");
      container.className = "p-4 space-y-4";
      container.innerHTML = `
        <!-- Text keys -->
        <div class="space-x-2">
          <kbd class="kbd">Escape</kbd>
          <kbd class="kbd">Enter</kbd>
          <kbd class="kbd">Space</kbd>
        </div>
        
        <!-- Number keys -->
        <div class="space-x-2">
          <kbd class="kbd kbd-sm">1</kbd>
          <kbd class="kbd kbd-sm">2</kbd>
          <kbd class="kbd kbd-sm">3</kbd>
        </div>
        
        <!-- Arrow keys -->
        <div class="space-x-1">
          <kbd class="kbd kbd-sm">↑</kbd>
          <kbd class="kbd kbd-sm">↓</kbd>
          <kbd class="kbd kbd-sm">←</kbd>
          <kbd class="kbd kbd-sm">→</kbd>
        </div>
        
        <!-- Single letters -->
        <div class="space-x-1">
          <kbd class="kbd kbd-lg">A</kbd>
          <kbd class="kbd kbd-lg">S</kbd>
          <kbd class="kbd kbd-lg">D</kbd>
          <kbd class="kbd kbd-lg">F</kbd>
        </div>
      `;
      document.body.appendChild(container);
    });

    const container = page.locator("div").last();
    await expect(container).toHaveScreenshot("kbd-content-types.png");
  });

  test("kbd in different themes", async ({ page }) => {
    const themes = ["light", "dark", "cupcake", "cyberpunk"];

    for (const theme of themes) {
      await page.evaluate((theme) => {
        document.documentElement.setAttribute("data-theme", theme);
      }, theme);

      await page.waitForTimeout(100);

      const kbdSection = page.locator(".kbd").first();
      await expect(kbdSection).toHaveScreenshot(`kbd-theme-${theme}.png`);
    }
  });

  test("kbd responsive design", async ({ page }) => {
    const viewports = [
      { width: 375, height: 667, name: "mobile" },
      { width: 768, height: 1024, name: "tablet" },
      { width: 1920, height: 1080, name: "desktop" },
    ];

    for (const viewport of viewports) {
      await page.setViewportSize(viewport);

      const kbdSection = page.locator(".kbd").first();
      await expect(kbdSection).toHaveScreenshot(`kbd-${viewport.name}.png`);
    }
  });

  test("kbd variant styles", async ({ page }) => {
    // Create kbd elements with different variant styles
    await page.evaluate(() => {
      const container = document.createElement("div");
      container.className = "p-4 space-y-4";
      container.innerHTML = `
        <div class="space-x-2">
          <kbd class="kbd">Default</kbd>
          <kbd class="kbd kbd-primary">Primary</kbd>
          <kbd class="kbd kbd-secondary">Secondary</kbd>
          <kbd class="kbd kbd-accent">Accent</kbd>
          <kbd class="kbd kbd-ghost">Ghost</kbd>
        </div>
      `;
      document.body.appendChild(container);
    });

    const container = page.locator("div").last();
    await expect(container).toHaveScreenshot("kbd-variant-styles.png");
  });

  test("kbd in context examples", async ({ page }) => {
    // Create contextual examples showing kbd usage
    await page.evaluate(() => {
      const container = document.createElement("div");
      container.className = "p-4 space-y-6";
      container.innerHTML = `
        <!-- In sentences -->
        <p>Press <kbd class="kbd kbd-sm">Ctrl</kbd> + <kbd class="kbd kbd-sm">C</kbd> to copy</p>
        <p>Use <kbd class="kbd kbd-sm">⌘</kbd> + <kbd class="kbd kbd-sm">K</kbd> to open search</p>
        
        <!-- In lists -->
        <ul class="space-y-2">
          <li><kbd class="kbd kbd-xs">Tab</kbd> - Next field</li>
          <li><kbd class="kbd kbd-xs">Shift</kbd> + <kbd class="kbd kbd-xs">Tab</kbd> - Previous field</li>
          <li><kbd class="kbd kbd-xs">Enter</kbd> - Submit form</li>
        </ul>
        
        <!-- In code blocks -->
        <div class="mockup-code">
          <pre><code>Press <kbd class="kbd kbd-xs">Escape</kbd> to exit vim</code></pre>
        </div>
      `;
      document.body.appendChild(container);
    });

    const container = page.locator("div").last();
    await expect(container).toHaveScreenshot("kbd-context-examples.png");
  });
});
