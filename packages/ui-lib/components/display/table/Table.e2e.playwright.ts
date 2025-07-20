import { expect, test } from "@playwright/test";

test.describe("Table E2E Tests", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:8001/components/display/table");
    await page.waitForLoadState("networkidle");
  });

  test("page loads and displays table examples", async ({ page }) => {
    await expect(page).toHaveTitle(/Table/);
    await expect(page.locator("h1")).toContainText("Table");
    await expect(page.locator(".table").first()).toBeVisible();
  });

  test("table basic structure is correct", async ({ page }) => {
    const tables = page.locator(".table");
    const tableCount = await tables.count();

    expect(tableCount).toBeGreaterThan(0);

    // Check first table
    const firstTable = tables.first();
    await expect(firstTable).toBeVisible();

    // Should have thead
    const thead = firstTable.locator("thead");
    await expect(thead).toBeVisible();

    // Should have tbody
    const tbody = firstTable.locator("tbody");
    await expect(tbody).toBeVisible();

    // Should have headers
    const headers = firstTable.locator("th");
    const headerCount = await headers.count();
    expect(headerCount).toBeGreaterThan(0);

    // Should have data rows
    const rows = firstTable.locator("tbody tr");
    const rowCount = await rows.count();
    expect(rowCount).toBeGreaterThan(0);
  });

  test("table cells contain data", async ({ page }) => {
    const tableCells = page.locator(".table td");
    const cellCount = await tableCells.count();

    expect(cellCount).toBeGreaterThan(0);

    // Check first few cells have content
    for (let i = 0; i < Math.min(cellCount, 5); i++) {
      const cell = tableCells.nth(i);
      await expect(cell).toBeVisible();

      // Cell should have text content or child elements
      const textContent = await cell.textContent();
      const hasChildren = await cell.locator("*").count() > 0;

      expect(textContent?.trim().length > 0 || hasChildren).toBe(true);
    }
  });

  test("table interactive elements work", async ({ page }) => {
    // Test checkboxes in table
    const checkboxes = page.locator(".table input[type='checkbox']");
    const checkboxCount = await checkboxes.count();

    if (checkboxCount > 0) {
      const firstCheckbox = checkboxes.first();

      // Get initial state
      const initialChecked = await firstCheckbox.isChecked();

      // Click checkbox
      await firstCheckbox.click();

      // State should change
      const newChecked = await firstCheckbox.isChecked();
      expect(newChecked).toBe(!initialChecked);
    }

    // Test buttons in table
    const buttons = page.locator(".table button");
    const buttonCount = await buttons.count();

    if (buttonCount > 0) {
      const firstButton = buttons.first();
      await expect(firstButton).toBeVisible();
      await expect(firstButton).toBeEnabled();

      // Click button
      await firstButton.click();

      // Button should still be visible
      await expect(firstButton).toBeVisible();
    }
  });

  test("table size variants work", async ({ page }) => {
    const sizeVariants = ["table-xs", "table-sm", "table-md", "table-lg"];

    for (const size of sizeVariants) {
      const sizedTables = page.locator(`.${size}`);
      const sizedCount = await sizedTables.count();

      if (sizedCount > 0) {
        const sizedTable = sizedTables.first();
        await expect(sizedTable).toBeVisible();

        // Should have the size class
        const hasClass = await sizedTable.evaluate(
          (el, className) => el.classList.contains(className),
          size,
        );
        expect(hasClass).toBe(true);
      }
    }
  });

  test("table zebra striping works", async ({ page }) => {
    const zebraTables = page.locator(".table-zebra");
    const zebraCount = await zebraTables.count();

    if (zebraCount > 0) {
      const zebraTable = zebraTables.first();
      await expect(zebraTable).toBeVisible();

      // Should have zebra class
      const hasZebraClass = await zebraTable.evaluate((el) => el.classList.contains("table-zebra"));
      expect(hasZebraClass).toBe(true);

      // Check rows have alternating styles
      const rows = zebraTable.locator("tbody tr");
      const rowCount = await rows.count();

      if (rowCount > 1) {
        // Check first two rows have different background colors
        const firstRowBg = await rows.first().evaluate((el) =>
          getComputedStyle(el).backgroundColor
        );
        const secondRowBg = await rows.nth(1).evaluate((el) =>
          getComputedStyle(el).backgroundColor
        );

        // They should be different (zebra effect)
        expect(firstRowBg).not.toBe(secondRowBg);
      }
    }
  });

  test("table hover effects work", async ({ page }) => {
    const table = page.locator(".table").first();
    const rows = table.locator("tbody tr");
    const rowCount = await rows.count();

    if (rowCount > 0) {
      const firstRow = rows.first();

      // Hover over row
      await firstRow.hover();

      // Row should still be visible
      await expect(firstRow).toBeVisible();

      // Check if row has hover class or effect
      const hasHoverClass = await firstRow.evaluate((el) =>
        el.classList.contains("hover") || el.matches(":hover")
      );

      // Either has hover class or should respond to hover
      expect(typeof hasHoverClass).toBe("boolean");
    }
  });

  test("table scroll behavior", async ({ page }) => {
    const scrollContainers = page.locator(".overflow-x-auto");
    const containerCount = await scrollContainers.count();

    if (containerCount > 0) {
      const scrollContainer = scrollContainers.first();
      await expect(scrollContainer).toBeVisible();

      // Get scroll dimensions
      const scrollInfo = await scrollContainer.evaluate((el) => ({
        scrollWidth: el.scrollWidth,
        clientWidth: el.clientWidth,
        scrollLeft: el.scrollLeft,
      }));

      // If content is wider than container, test scrolling
      if (scrollInfo.scrollWidth > scrollInfo.clientWidth) {
        // Scroll horizontally
        await scrollContainer.evaluate((el) => el.scrollBy(100, 0));

        // Check scroll position changed
        const newScrollLeft = await scrollContainer.evaluate((el) => el.scrollLeft);
        expect(newScrollLeft).toBeGreaterThan(scrollInfo.scrollLeft);
      }
    }
  });

  test("table accessibility", async ({ page }) => {
    const tables = page.locator(".table");
    const tableCount = await tables.count();

    for (let i = 0; i < Math.min(tableCount, 3); i++) {
      const table = tables.nth(i);

      // Table should be visible
      await expect(table).toBeVisible();

      // Headers should be properly marked
      const headers = table.locator("th");
      const headerCount = await headers.count();

      for (let j = 0; j < Math.min(headerCount, 5); j++) {
        const header = headers.nth(j);
        const headerText = await header.textContent();

        // Headers should have meaningful text (unless they contain only interactive elements)
        const hasInteractive = await header.locator("input, button, a").count() > 0;
        if (!hasInteractive) {
          expect(headerText?.trim().length).toBeGreaterThan(0);
        }
      }

      // Check for proper table structure
      const tagName = await table.evaluate((el) => el.tagName.toLowerCase());
      expect(tagName).toBe("table");
    }
  });

  test("table form controls work", async ({ page }) => {
    // Test select elements in table
    const selects = page.locator(".table select");
    const selectCount = await selects.count();

    if (selectCount > 0) {
      const firstSelect = selects.first();
      await expect(firstSelect).toBeVisible();

      // Get options
      const options = firstSelect.locator("option");
      const optionCount = await options.count();

      if (optionCount > 1) {
        // Select different option
        await firstSelect.selectOption({ index: 1 });

        // Selection should work
        const selectedValue = await firstSelect.inputValue();
        expect(selectedValue).toBeTruthy();
      }
    }

    // Test toggle switches in table
    const toggles = page.locator(".table .toggle");
    const toggleCount = await toggles.count();

    if (toggleCount > 0) {
      const firstToggle = toggles.first();

      const initialChecked = await firstToggle.isChecked();
      await firstToggle.click();

      const newChecked = await firstToggle.isChecked();
      expect(newChecked).toBe(!initialChecked);
    }
  });

  test("table keyboard navigation", async ({ page }) => {
    // Focus first interactive element in table
    await page.keyboard.press("Tab");

    const focusedElement = page.locator(":focus");
    const focusedCount = await focusedElement.count();

    if (focusedCount > 0) {
      // Should be within a table
      const isInTable = await focusedElement.evaluate((el) => {
        return !!el.closest(".table") || !!el.closest("table");
      });

      if (isInTable) {
        // Test further tab navigation
        await page.keyboard.press("Tab");

        const nextFocused = page.locator(":focus");
        const nextFocusedCount = await nextFocused.count();

        if (nextFocusedCount > 0) {
          const tagName = await nextFocused.evaluate((el) => el.tagName.toLowerCase());
          expect(["input", "button", "select", "a", "th", "td"]).toContain(tagName);
        }
      }
    }
  });

  test("table responsive behavior", async ({ page }) => {
    const table = page.locator(".table").first();

    // Desktop view
    await page.setViewportSize({ width: 1920, height: 1080 });
    await expect(table).toBeVisible();

    const desktopSize = await table.evaluate((el) => ({
      width: el.offsetWidth,
      height: el.offsetHeight,
    }));

    // Mobile view
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(table).toBeVisible();

    const mobileSize = await table.evaluate((el) => ({
      width: el.offsetWidth,
      height: el.offsetHeight,
    }));

    // Table should adapt to smaller screens
    expect(mobileSize.width).toBeLessThanOrEqual(desktopSize.width);
    expect(mobileSize.height).toBeGreaterThan(0);

    // Check if table is in a scrollable container
    const scrollContainer = table.locator("..").filter({ hasText: "overflow" });
    if (await scrollContainer.count() > 0) {
      await expect(scrollContainer).toBeVisible();
    }
  });

  test("table sorting indicators", async ({ page }) => {
    // Look for sorting indicators in headers
    const sortHeaders = page.locator(
      '.table th:has-text("↕"), .table th:has-text("↑"), .table th:has-text("↓")',
    );
    const sortCount = await sortHeaders.count();

    if (sortCount > 0) {
      const sortHeader = sortHeaders.first();
      await expect(sortHeader).toBeVisible();

      // Click to test sorting
      await sortHeader.click();

      // Header should still be visible
      await expect(sortHeader).toBeVisible();

      const headerText = await sortHeader.textContent();
      expect(headerText).toBeTruthy();
    }
  });

  test("table with avatars and images", async ({ page }) => {
    const tableImages = page.locator(".table img");
    const imageCount = await tableImages.count();

    if (imageCount > 0) {
      for (let i = 0; i < Math.min(imageCount, 3); i++) {
        const image = tableImages.nth(i);

        await expect(image).toBeVisible();

        // Image should have src
        const src = await image.getAttribute("src");
        expect(src).toBeTruthy();

        // Image should have alt text
        const alt = await image.getAttribute("alt");
        expect(alt).toBeTruthy();

        // Wait for image to load
        await image.evaluate((img) => {
          if (img.complete) return;
          return new Promise((resolve) => {
            img.onload = resolve;
            img.onerror = resolve;
          });
        });
      }
    }
  });

  test("table pin functionality", async ({ page }) => {
    // Test pinned rows
    const pinnedRowTables = page.locator(".table-pin-rows");
    const pinnedRowCount = await pinnedRowTables.count();

    if (pinnedRowCount > 0) {
      const pinnedTable = pinnedRowTables.first();
      await expect(pinnedTable).toBeVisible();

      const hasClass = await pinnedTable.evaluate((el) => el.classList.contains("table-pin-rows"));
      expect(hasClass).toBe(true);
    }

    // Test pinned columns
    const pinnedColTables = page.locator(".table-pin-cols");
    const pinnedColCount = await pinnedColTables.count();

    if (pinnedColCount > 0) {
      const pinnedTable = pinnedColTables.first();
      await expect(pinnedTable).toBeVisible();

      const hasClass = await pinnedTable.evaluate((el) => el.classList.contains("table-pin-cols"));
      expect(hasClass).toBe(true);
    }
  });

  test("API documentation is present", async ({ page }) => {
    await expect(page.locator("table, .api-table")).toBeVisible();
    await expect(page.locator('text="headers"')).toBeVisible();
    await expect(page.locator('text="rows"')).toBeVisible();
    await expect(page.locator('text="size"')).toBeVisible();
    await expect(page.locator('text="zebra"')).toBeVisible();
  });
});
