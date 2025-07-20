import { expect, test } from "@playwright/test";

test.describe("Textarea Visual Tests", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to textarea component page
    await page.goto("http://localhost:8001/components/input/textarea");
    await page.waitForLoadState("networkidle");
  });

  test("textarea sizes visual regression", async ({ page }) => {
    // Test sizes section
    const sizesSection = page.locator("section").filter({ hasText: "Sizes" });
    await expect(sizesSection).toHaveScreenshot("textarea-sizes.png");
  });

  test("textarea colors visual regression", async ({ page }) => {
    // Test colors section
    const colorsSection = page.locator("section").filter({ hasText: "Colors" });
    await expect(colorsSection).toHaveScreenshot("textarea-colors.png");
  });

  test("textarea variants visual regression", async ({ page }) => {
    // Test variants section
    const variantsSection = page.locator("section").filter({ hasText: "Variants" });
    await expect(variantsSection).toHaveScreenshot("textarea-variants.png");
  });

  test("textarea rows visual regression", async ({ page }) => {
    // Test rows section
    const rowsSection = page.locator("section").filter({ hasText: "Rows" });
    await expect(rowsSection).toHaveScreenshot("textarea-rows.png");
  });

  test("textarea states visual regression", async ({ page }) => {
    // Test states section
    const statesSection = page.locator("section").filter({ hasText: "States" });
    await expect(statesSection).toHaveScreenshot("textarea-states.png");
  });

  test("textarea interactive visual regression", async ({ page }) => {
    // Test interactive section
    const interactiveSection = page.locator("section").filter({ hasText: "Interactive" });
    await expect(interactiveSection).toHaveScreenshot("textarea-interactive.png");
  });

  // Test specific textarea interactions
  test("textarea hover states", async ({ page }) => {
    const primaryTextarea = page.locator(".textarea-primary").first();

    // Normal state
    await expect(primaryTextarea).toHaveScreenshot("textarea-primary-normal.png");

    // Hover state
    await primaryTextarea.hover();
    await expect(primaryTextarea).toHaveScreenshot("textarea-primary-hover.png");
  });

  test("textarea focus states", async ({ page }) => {
    const primaryTextarea = page.locator(".textarea-primary").first();

    // Focus state
    await primaryTextarea.focus();
    await expect(primaryTextarea).toHaveScreenshot("textarea-primary-focus.png");
  });

  // Theme testing
  test("textarea in different themes", async ({ page }) => {
    const themes = ["light", "dark", "cupcake", "cyberpunk", "synthwave"];

    for (const theme of themes) {
      // Change theme
      await page.evaluate((theme) => {
        document.documentElement.setAttribute("data-theme", theme);
      }, theme);

      // Wait for theme to apply
      await page.waitForTimeout(100);

      // Take screenshot of textarea examples
      const textareaSection = page.locator("section").filter({ hasText: "Sizes" });
      await expect(textareaSection).toHaveScreenshot(`textarea-theme-${theme}.png`);
    }
  });

  // Responsive testing
  test("textarea responsive design", async ({ page }) => {
    const viewports = [
      { width: 375, height: 667, name: "mobile" },
      { width: 768, height: 1024, name: "tablet" },
      { width: 1920, height: 1080, name: "desktop" },
    ];

    for (const viewport of viewports) {
      await page.setViewportSize(viewport);

      const textareaSection = page.locator("section").filter({ hasText: "Sizes" });
      await expect(textareaSection).toHaveScreenshot(`textarea-${viewport.name}.png`);
    }
  });

  // Edge cases
  test("textarea with long text", async ({ page }) => {
    // Navigate to a test page or inject textareas with long text
    await page.evaluate(() => {
      const container = document.createElement("div");
      container.className = "p-4 space-y-4";
      container.innerHTML = `
        <textarea class="textarea textarea-primary w-full" rows="3">This is a very long text content that should wrap properly within the textarea. Let's make it even longer to test how the textarea handles extensive content. This should demonstrate text wrapping behavior and how the textarea maintains its layout with lots of text.</textarea>
        <textarea class="textarea textarea-bordered w-full" rows="5">Small textarea with multiple lines of content to test wrapping behavior and layout consistency across different content lengths.</textarea>
        <textarea class="textarea textarea-ghost w-full" rows="8">Large textarea with extremely long text content that definitely wraps and shows how the component handles extensive user input while maintaining proper styling and layout structure.</textarea>
      `;
      document.body.appendChild(container);
    });

    const container = page.locator("div").last();
    await expect(container).toHaveScreenshot("textarea-long-text.png");
  });

  test("textarea validation states", async ({ page }) => {
    // Test validation visual states
    await page.evaluate(() => {
      const container = document.createElement("div");
      container.className = "p-4 space-y-4";
      container.innerHTML = `
        <textarea class="textarea textarea-success w-full" placeholder="Valid textarea">Valid content</textarea>
        <textarea class="textarea textarea-error w-full" placeholder="Invalid textarea">Invalid content</textarea>
        <textarea class="textarea textarea-warning w-full" placeholder="Warning textarea">Warning content</textarea>
        <textarea class="textarea textarea-info w-full" placeholder="Info textarea">Info content</textarea>
      `;
      document.body.appendChild(container);
    });

    const container = page.locator("div").last();
    await expect(container).toHaveScreenshot("textarea-validation-states.png");
  });

  test("textarea accessibility contrast", async ({ page }) => {
    // Test high contrast mode or accessibility features
    await page.emulateMedia({ reducedMotion: "reduce" });

    const textareaSection = page.locator("section").filter({ hasText: "Sizes" });
    await expect(textareaSection).toHaveScreenshot("textarea-reduced-motion.png");
  });

  // Test different textarea configurations
  test("textarea content overflow", async ({ page }) => {
    // Test how textarea handles content overflow
    await page.evaluate(() => {
      const container = document.createElement("div");
      container.className = "p-4 space-y-4";
      container.innerHTML = `
        <textarea class="textarea textarea-bordered w-full" rows="2" style="resize: none;">This is a lot of text that should overflow the fixed height textarea. Let's see how it handles scrolling and content that exceeds the visible area. This should demonstrate the textarea's behavior when content is longer than the available space.</textarea>
        <textarea class="textarea textarea-primary w-full" rows="4" style="resize: vertical;">Vertically resizable textarea with moderate content to test resize behavior and visual consistency.</textarea>
        <textarea class="textarea textarea-secondary w-full" rows="6">Normal textarea with proper content length for comparison.</textarea>
      `;
      document.body.appendChild(container);
    });

    const container = page.locator("div").last();
    await expect(container).toHaveScreenshot("textarea-content-overflow.png");
  });

  // Performance test - ensure consistent rendering
  test("textarea rendering consistency", async ({ page }) => {
    // Test multiple renders for consistency
    for (let i = 0; i < 3; i++) {
      await page.reload();
      await page.waitForLoadState("networkidle");

      const textareaSection = page.locator("section").filter({ hasText: "Sizes" });
      await expect(textareaSection).toHaveScreenshot(`textarea-render-${i}.png`);
    }
  });
});
