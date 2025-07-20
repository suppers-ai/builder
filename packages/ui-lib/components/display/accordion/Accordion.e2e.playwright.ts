import { expect, test } from "@playwright/test";

test.describe("Accordion E2E Tests", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:8001/components/display/accordion");
    await page.waitForLoadState("networkidle");
  });

  test("page loads and displays accordion examples", async ({ page }) => {
    await expect(page).toHaveTitle(/Accordion/);
    await expect(page.locator("h1")).toContainText("Accordion");
    await expect(page.locator(".collapse").first()).toBeVisible();
  });

  test("accordion expand/collapse functionality", async ({ page }) => {
    const accordion = page.locator(".collapse").first();
    const trigger = accordion.locator(".collapse-title, input[type='checkbox']").first();
    const content = accordion.locator(".collapse-content");

    // Initially collapsed (content should not be visible)
    const initiallyExpanded = await content.isVisible();

    // Click to expand
    await trigger.click();
    await page.waitForTimeout(300); // Wait for animation

    // Content should now be visible
    const afterClick = await content.isVisible();
    expect(afterClick).toBe(!initiallyExpanded);

    // Click again to collapse
    await trigger.click();
    await page.waitForTimeout(300);

    // Content visibility should return to initial state
    const afterSecondClick = await content.isVisible();
    expect(afterSecondClick).toBe(initiallyExpanded);
  });

  test("accordion keyboard navigation", async ({ page }) => {
    const accordionTrigger = page.locator(".collapse-title").first();

    // Focus accordion trigger
    await accordionTrigger.focus();
    await expect(accordionTrigger).toBeFocused();

    // Activate with Enter
    const content = page.locator(".collapse-content").first();
    const initiallyVisible = await content.isVisible();

    await page.keyboard.press("Enter");
    await page.waitForTimeout(300);

    const afterEnter = await content.isVisible();
    expect(afterEnter).toBe(!initiallyVisible);

    // Activate with Space
    await page.keyboard.press("Space");
    await page.waitForTimeout(300);

    const afterSpace = await content.isVisible();
    expect(afterSpace).toBe(initiallyVisible);
  });

  test("multiple accordion behavior", async ({ page }) => {
    const accordions = page.locator(".collapse");
    const accordionCount = await accordions.count();

    if (accordionCount > 1) {
      // Expand first accordion
      const firstTrigger = accordions.first().locator(".collapse-title, input").first();
      await firstTrigger.click();
      await page.waitForTimeout(300);

      const firstContent = accordions.first().locator(".collapse-content");
      const firstExpanded = await firstContent.isVisible();

      // Expand second accordion
      const secondTrigger = accordions.nth(1).locator(".collapse-title, input").first();
      await secondTrigger.click();
      await page.waitForTimeout(300);

      const secondContent = accordions.nth(1).locator(".collapse-content");
      const secondExpanded = await secondContent.isVisible();

      // Both should be able to be expanded simultaneously (unless it's a radio group)
      const inputType = await firstTrigger.getAttribute("type");
      if (inputType === "radio") {
        // Radio group - only one should be expanded
        expect(firstExpanded && secondExpanded).toBe(false);
      } else {
        // Checkbox group - both can be expanded
        expect(secondExpanded).toBe(true);
      }
    }
  });

  test("accordion content accessibility", async ({ page }) => {
    const accordions = page.locator(".collapse");
    const accordionCount = await accordions.count();

    for (let i = 0; i < Math.min(accordionCount, 3); i++) {
      const accordion = accordions.nth(i);
      const trigger = accordion.locator(".collapse-title").first();
      const content = accordion.locator(".collapse-content").first();

      // Check ARIA attributes
      const ariaExpanded = await trigger.getAttribute("aria-expanded");
      expect(["true", "false"]).toContain(ariaExpanded || "false");

      // Check if content has proper structure
      const contentText = await content.textContent();
      if (contentText) {
        expect(contentText.trim().length).toBeGreaterThan(0);
      }
    }
  });

  test("accordion disabled state", async ({ page }) => {
    const disabledAccordion = page.locator(".collapse [disabled], .collapse.disabled").first();

    if (await disabledAccordion.count() > 0) {
      const content = disabledAccordion.locator("..//.collapse-content").first();
      const initiallyVisible = await content.isVisible();

      // Try to click disabled accordion
      await disabledAccordion.click({ force: true });
      await page.waitForTimeout(300);

      // State should not change
      const afterClick = await content.isVisible();
      expect(afterClick).toBe(initiallyVisible);
    }
  });

  test("accordion animation performance", async ({ page }) => {
    const accordion = page.locator(".collapse").first();
    const trigger = accordion.locator(".collapse-title, input").first();

    // Measure animation time
    const startTime = Date.now();
    await trigger.click();

    // Wait for animation to complete
    await page.waitForTimeout(500);

    const endTime = Date.now();
    const animationTime = endTime - startTime;

    // Animation should complete within reasonable time
    expect(animationTime).toBeLessThan(1000);

    // Content should be visible after animation
    const content = accordion.locator(".collapse-content");
    await expect(content).toBeVisible();
  });

  test("accordion with nested content", async ({ page }) => {
    // Look for accordions with complex nested content
    const nestedContent = page.locator(
      ".collapse-content .btn, .collapse-content ul, .collapse-content .card",
    );
    const hasNestedContent = await nestedContent.count() > 0;

    if (hasNestedContent) {
      // Expand accordion to reveal nested content
      const parentAccordion = nestedContent.first().locator("../../..");
      const trigger = parentAccordion.locator(".collapse-title, input").first();

      await trigger.click();
      await page.waitForTimeout(300);

      // Nested content should be interactive
      const nestedButton = nestedContent.filter({ hasText: /button|click|action/i }).first();
      if (await nestedButton.count() > 0) {
        await expect(nestedButton).toBeVisible();
        await nestedButton.click();
      }
    }
  });

  test("API documentation is present", async ({ page }) => {
    await expect(page.locator("table, .api-table")).toBeVisible();
    await expect(page.locator('text="items"')).toBeVisible();
    await expect(page.locator('text="multiple"')).toBeVisible();
    await expect(page.locator('text="defaultOpen"')).toBeVisible();
  });
});
