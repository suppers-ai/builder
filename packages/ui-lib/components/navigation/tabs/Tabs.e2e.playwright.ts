import { expect, test } from "@playwright/test";

test.describe("Tabs E2E Tests", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:8001/components/navigation/tabs");
    await page.waitForLoadState("networkidle");
  });

  test("page loads and displays tabs examples", async ({ page }) => {
    await expect(page).toHaveTitle(/Tabs/);
    await expect(page.locator("h1")).toContainText("Tabs");
    await expect(page.locator(".tabs").first()).toBeVisible();
  });

  test("tab switching functionality works", async ({ page }) => {
    const tabs = page.locator(".tab");
    const tabCount = await tabs.count();

    if (tabCount > 1) {
      // Click second tab
      const secondTab = tabs.nth(1);
      await secondTab.click();

      // Check if it becomes active
      await expect(secondTab).toHaveClass(/tab-active/);

      // Check if corresponding content is shown
      const tabContent = page.locator(".tab-content");
      if (await tabContent.count() > 0) {
        await expect(tabContent).toBeVisible();
      }
    }
  });

  test("tab keyboard navigation", async ({ page }) => {
    const firstTab = page.locator(".tab").first();

    // Focus first tab
    await firstTab.focus();
    await expect(firstTab).toBeFocused();

    // Navigate with arrow keys
    await page.keyboard.press("ArrowRight");

    // Check if focus moved to next tab
    const focusedElement = page.locator(":focus");
    const tagName = await focusedElement.evaluate((el) => el.tagName.toLowerCase());
    expect(["a", "button"]).toContain(tagName);
  });

  test("tab activation with Enter/Space", async ({ page }) => {
    const tabs = page.locator(".tab");
    const tabCount = await tabs.count();

    if (tabCount > 1) {
      const secondTab = tabs.nth(1);

      // Focus tab
      await secondTab.focus();

      // Activate with Enter
      await page.keyboard.press("Enter");

      // Check if tab becomes active
      await expect(secondTab).toHaveClass(/tab-active/);
    }
  });

  test("disabled tabs are not interactive", async ({ page }) => {
    const disabledTab = page.locator(".tab-disabled, .tab[disabled]").first();

    if (await disabledTab.count() > 0) {
      // Try to click disabled tab
      await disabledTab.click({ force: true });

      // Should not become active
      const isActive = await disabledTab.evaluate((el) => el.classList.contains("tab-active"));
      expect(isActive).toBe(false);
    }
  });

  test("tab content updates when switching tabs", async ({ page }) => {
    const tabs = page.locator(".tab");
    const tabContent = page.locator(".tab-content");
    const tabCount = await tabs.count();
    const contentExists = await tabContent.count() > 0;

    if (tabCount > 1 && contentExists) {
      // Get initial content
      const initialContent = await tabContent.textContent();

      // Click different tab
      const otherTab = tabs.nth(1);
      await otherTab.click();

      // Wait for content to update
      await page.waitForTimeout(100);

      // Check if content changed
      const newContent = await tabContent.textContent();
      expect(newContent).not.toBe(initialContent);
    }
  });

  test("tabs accessibility attributes", async ({ page }) => {
    const tabs = page.locator(".tab");
    const tabsContainer = page.locator(".tabs");
    const tabCount = await tabs.count();

    // Check tabs container has tablist role
    const containerRole = await tabsContainer.first().getAttribute("role");
    expect(containerRole).toBe("tablist");

    // Check individual tabs
    for (let i = 0; i < Math.min(tabCount, 3); i++) {
      const tab = tabs.nth(i);

      // Check role
      const role = await tab.getAttribute("role");
      expect(role).toBe("tab");

      // Check aria-selected
      const ariaSelected = await tab.getAttribute("aria-selected");
      expect(["true", "false"]).toContain(ariaSelected);

      // Active tab should have aria-selected="true"
      const isActive = await tab.evaluate((el) => el.classList.contains("tab-active"));
      if (isActive) {
        expect(ariaSelected).toBe("true");
      }
    }
  });

  test("tabs work with different styles", async ({ page }) => {
    // Test bordered tabs
    const borderedTabs = page.locator(".tabs-bordered .tab");
    if (await borderedTabs.count() > 0) {
      await borderedTabs.first().click();
      await expect(borderedTabs.first()).toBeVisible();
    }

    // Test boxed tabs
    const boxedTabs = page.locator(".tabs-boxed .tab");
    if (await boxedTabs.count() > 0) {
      await boxedTabs.first().click();
      await expect(boxedTabs.first()).toBeVisible();
    }

    // Test lifted tabs
    const liftedTabs = page.locator(".tabs-lifted .tab");
    if (await liftedTabs.count() > 0) {
      await liftedTabs.first().click();
      await expect(liftedTabs.first()).toBeVisible();
    }
  });

  test("API documentation is present", async ({ page }) => {
    await expect(page.locator("table, .api-table")).toBeVisible();
    await expect(page.locator('text="tabs"')).toBeVisible();
    await expect(page.locator('text="activeTab"')).toBeVisible();
    await expect(page.locator('text="bordered"')).toBeVisible();
    await expect(page.locator('text="lifted"')).toBeVisible();
    await expect(page.locator('text="boxed"')).toBeVisible();
  });

  test("tabs responsive behavior", async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    const tabs = page.locator(".tabs");
    await expect(tabs.first()).toBeVisible();

    // Tabs should still be functional on mobile
    const tabElements = page.locator(".tab");
    const tabCount = await tabElements.count();

    if (tabCount > 1) {
      await tabElements.nth(1).click();
      await expect(tabElements.nth(1)).toHaveClass(/tab-active/);
    }
  });
});
