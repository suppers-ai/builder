import { expect, test } from "@playwright/test";

test.describe("Accordion Visual Tests", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:8001/components/display/accordion");
    await page.waitForLoadState("networkidle");
  });

  test("accordion variants visual regression", async ({ page }) => {
    const basicSection = page.locator(".card").first();
    await expect(basicSection).toHaveScreenshot("accordion-basic-variants.png");
  });

  test("accordion states visual regression", async ({ page }) => {
    const statesSection = page.locator(".card").nth(1);
    await expect(statesSection).toHaveScreenshot("accordion-states.png");
  });

  test("accordion expanded content", async ({ page }) => {
    const expandedSection = page.locator(".card").nth(2);
    await expect(expandedSection).toHaveScreenshot("accordion-expanded.png");
  });

  test("accordion interaction states", async ({ page }) => {
    const accordionItem = page.locator(".collapse").first();

    // Collapsed state
    await expect(accordionItem).toHaveScreenshot("accordion-item-collapsed.png");

    // Expanded state (click to expand)
    const trigger = accordionItem.locator(".collapse-title, input[type='checkbox']").first();
    await trigger.click();
    await page.waitForTimeout(300); // Wait for animation

    await expect(accordionItem).toHaveScreenshot("accordion-item-expanded.png");
  });

  test("accordion hover states", async ({ page }) => {
    const accordionTitle = page.locator(".collapse-title").first();

    // Normal state
    await expect(accordionTitle).toHaveScreenshot("accordion-title-normal.png");

    // Hover state
    await accordionTitle.hover();
    await expect(accordionTitle).toHaveScreenshot("accordion-title-hover.png");
  });

  test("accordion with complex content", async ({ page }) => {
    // Create accordion with rich content for visual testing
    await page.evaluate(() => {
      const container = document.createElement("div");
      container.className = "p-4";
      container.innerHTML = `
        <div class="collapse collapse-arrow bg-base-200">
          <input type="checkbox" />
          <div class="collapse-title text-xl font-medium">
            Rich Content Accordion
          </div>
          <div class="collapse-content">
            <div class="space-y-4">
              <p>This accordion contains various types of content:</p>
              <ul class="list-disc list-inside space-y-1">
                <li>Bullet points</li>
                <li>Multiple paragraphs</li>
                <li>Interactive elements</li>
              </ul>
              <div class="flex gap-2">
                <button class="btn btn-primary btn-sm">Action 1</button>
                <button class="btn btn-secondary btn-sm">Action 2</button>
              </div>
            </div>
          </div>
        </div>
      `;
      document.body.appendChild(container);
    });

    const container = page.locator("div").last();
    await expect(container).toHaveScreenshot("accordion-rich-content.png");
  });

  test("accordion in different themes", async ({ page }) => {
    const themes = ["light", "dark", "cupcake", "cyberpunk"];

    for (const theme of themes) {
      await page.evaluate((theme) => {
        document.documentElement.setAttribute("data-theme", theme);
      }, theme);

      await page.waitForTimeout(100);

      const accordionSection = page.locator(".collapse").first();
      await expect(accordionSection).toHaveScreenshot(`accordion-theme-${theme}.png`);
    }
  });

  test("accordion responsive design", async ({ page }) => {
    const viewports = [
      { width: 375, height: 667, name: "mobile" },
      { width: 768, height: 1024, name: "tablet" },
      { width: 1920, height: 1080, name: "desktop" },
    ];

    for (const viewport of viewports) {
      await page.setViewportSize(viewport);

      const accordionSection = page.locator(".collapse").first();
      await expect(accordionSection).toHaveScreenshot(`accordion-${viewport.name}.png`);
    }
  });
});
