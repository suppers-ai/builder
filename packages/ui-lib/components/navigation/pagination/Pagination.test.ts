import { assertEquals, assertStringIncludes } from "jsr:@std/assert";
import { DOMParser } from "https://deno.land/x/deno_dom@v0.1.46/deno-dom-wasm.ts";
import { renderToString } from "preact-render-to-string";
import { Pagination } from "./Pagination.tsx";

// Mock DOMParser for testing
const parser = new DOMParser();

Deno.test("Pagination - basic rendering", () => {
  const html = renderToString(Pagination({
    currentPage: 1,
    totalPages: 5,
  }) as ComponentProps);

  assertStringIncludes(html, 'class="join');
  assertStringIncludes(html, 'class="btn"');
  assertStringIncludes(html, "1");
  assertStringIncludes(html, "2");
  assertStringIncludes(html, "3");
  assertStringIncludes(html, "4");
  assertStringIncludes(html, "5");
});

Deno.test("Pagination - with custom class", () => {
  const html = renderToString(Pagination({
    currentPage: 1,
    totalPages: 3,
    class: "custom-pagination",
  }) as ComponentProps);
  assertStringIncludes(html, 'class="join custom-pagination"');
});

Deno.test("Pagination - returns null for totalPages <= 1", () => {
  const htmlZeroPages = renderToString(Pagination({
    currentPage: 1,
    totalPages: 0,
  }) as ComponentProps);
  assertEquals(htmlZeroPages, "");

  const htmlOnePage = renderToString(Pagination({
    currentPage: 1,
    totalPages: 1,
  }) as ComponentProps);
  assertEquals(htmlOnePage, "");
});

Deno.test("Pagination - size variants", () => {
  const sizes = ["xs", "sm", "md", "lg"];

  sizes.forEach((size) => {
    const html = renderToString(Pagination({
      currentPage: 1,
      totalPages: 3,
      size: size as "xs" | "sm" | "md" | "lg" | "xl",
    }) as ComponentProps);
    if (size === "md") {
      // Default size doesn't add a class
      assertStringIncludes(html, 'class="btn"');
    } else {
      assertStringIncludes(html, `btn-${size}`);
    }
  });
});

Deno.test("Pagination - current page active state", () => {
  const html = renderToString(Pagination({
    currentPage: 3,
    totalPages: 5,
  }) as ComponentProps);

  assertStringIncludes(html, "btn-active");

  const document = parser.parseFromString(html, "text/html");
  const activeButton = document?.querySelector(".btn-active");
  assertEquals(activeButton?.textContent, "3");
  assertStringIncludes(activeButton?.getAttribute("aria-current") || "", "page");
});

Deno.test("Pagination - first/last buttons", () => {
  const html = renderToString(Pagination({
    currentPage: 3,
    totalPages: 5,
    showFirstLast: true,
  }) as ComponentProps);

  assertStringIncludes(html, "«");
  assertStringIncludes(html, "»");
  assertStringIncludes(html, 'aria-label="Go to first page"');
  assertStringIncludes(html, 'aria-label="Go to last page"');
});

Deno.test("Pagination - hide first/last buttons", () => {
  const html = renderToString(Pagination({
    currentPage: 3,
    totalPages: 5,
    showFirstLast: false,
  }) as ComponentProps);

  const document = parser.parseFromString(html, "text/html");
  const firstButton = document?.querySelector('[aria-label="Go to first page"]');
  const lastButton = document?.querySelector('[aria-label="Go to last page"]');
  assertEquals(firstButton, null);
  assertEquals(lastButton, null);
});

Deno.test("Pagination - prev/next buttons", () => {
  const html = renderToString(Pagination({
    currentPage: 3,
    totalPages: 5,
    showPrevNext: true,
  }) as ComponentProps);

  assertStringIncludes(html, "‹");
  assertStringIncludes(html, "›");
  assertStringIncludes(html, 'aria-label="Go to previous page"');
  assertStringIncludes(html, 'aria-label="Go to next page"');
});

Deno.test("Pagination - hide prev/next buttons", () => {
  const html = renderToString(Pagination({
    currentPage: 3,
    totalPages: 5,
    showPrevNext: false,
  }) as ComponentProps);

  const document = parser.parseFromString(html, "text/html");
  const prevButton = document?.querySelector('[aria-label="Go to previous page"]');
  const nextButton = document?.querySelector('[aria-label="Go to next page"]');
  assertEquals(prevButton, null);
  assertEquals(nextButton, null);
});

Deno.test("Pagination - disabled first/prev buttons on first page", () => {
  const html = renderToString(Pagination({
    currentPage: 1,
    totalPages: 5,
  }) as ComponentProps);

  const document = parser.parseFromString(html, "text/html");
  const firstButton = document?.querySelector('[aria-label="Go to first page"]');
  const prevButton = document?.querySelector('[aria-label="Go to previous page"]');

  assertEquals(firstButton?.hasAttribute("disabled"), true);
  assertEquals(prevButton?.hasAttribute("disabled"), true);
});

Deno.test("Pagination - disabled last/next buttons on last page", () => {
  const html = renderToString(Pagination({
    currentPage: 5,
    totalPages: 5,
  }) as ComponentProps);

  const document = parser.parseFromString(html, "text/html");
  const lastButton = document?.querySelector('[aria-label="Go to last page"]');
  const nextButton = document?.querySelector('[aria-label="Go to next page"]');

  assertEquals(lastButton?.hasAttribute("disabled"), true);
  assertEquals(nextButton?.hasAttribute("disabled"), true);
});

Deno.test("Pagination - ellipsis for many pages", () => {
  const html = renderToString(Pagination({
    currentPage: 10,
    totalPages: 20,
    maxVisiblePages: 5,
  }) as ComponentProps);

  assertStringIncludes(html, "...");
  assertStringIncludes(html, "1");
  assertStringIncludes(html, "20");

  const document = parser.parseFromString(html, "text/html");
  const ellipsis = document?.querySelectorAll(".btn-disabled");
  assertEquals(ellipsis?.length, 2); // Should have 2 ellipsis elements
});

Deno.test("Pagination - maxVisiblePages controls visible page count", () => {
  const html = renderToString(Pagination({
    currentPage: 5,
    totalPages: 10,
    maxVisiblePages: 3,
  }) as ComponentProps);

  const document = parser.parseFromString(html, "text/html");
  const pageButtons = document?.querySelectorAll('button[aria-label*="Go to page"]');

  // Should have limited number of page buttons due to maxVisiblePages
  // Plus first and last page, so expect around 5 buttons total
  assertEquals(pageButtons?.length, 5);
});

Deno.test("Pagination - with id", () => {
  const html = renderToString(Pagination({
    currentPage: 1,
    totalPages: 3,
    id: "test-pagination",
  }) as ComponentProps);
  assertStringIncludes(html, 'id="test-pagination"');
});

Deno.test("Pagination - aria labels for accessibility", () => {
  const html = renderToString(Pagination({
    currentPage: 2,
    totalPages: 5,
  }) as ComponentProps);

  assertStringIncludes(html, 'aria-label="Go to page 1"');
  assertStringIncludes(html, 'aria-label="Go to page 2"');
  assertStringIncludes(html, 'aria-label="Go to page 3"');
  assertStringIncludes(html, 'aria-current="page"');
});

Deno.test("Pagination - ellipsis elements have correct styling", () => {
  const html = renderToString(Pagination({
    currentPage: 10,
    totalPages: 20,
    maxVisiblePages: 5,
  }) as ComponentProps);

  const document = parser.parseFromString(html, "text/html");
  const ellipsis = document?.querySelectorAll(".btn-disabled");

  ellipsis?.forEach((el) => {
    assertEquals(el.textContent, "...");
    assertEquals((el as unknown as Element).tagName, "SPAN");
  });
});

Deno.test("Pagination - current page near beginning", () => {
  const html = renderToString(Pagination({
    currentPage: 2,
    totalPages: 15,
    maxVisiblePages: 5,
  }) as ComponentProps);

  assertStringIncludes(html, "1");
  assertStringIncludes(html, "2");
  assertStringIncludes(html, "3");
  assertStringIncludes(html, "4");
  assertStringIncludes(html, "5");
  assertStringIncludes(html, "15");
});

Deno.test("Pagination - current page near end", () => {
  const html = renderToString(Pagination({
    currentPage: 14,
    totalPages: 15,
    maxVisiblePages: 5,
  }) as ComponentProps);

  assertStringIncludes(html, "1");
  assertStringIncludes(html, "11");
  assertStringIncludes(html, "12");
  assertStringIncludes(html, "13");
  assertStringIncludes(html, "14");
  assertStringIncludes(html, "15");
});

Deno.test("Pagination - no ellipsis when all pages visible", () => {
  const html = renderToString(Pagination({
    currentPage: 3,
    totalPages: 5,
    maxVisiblePages: 5,
  }) as ComponentProps);

  const document = parser.parseFromString(html, "text/html");
  const ellipsis = document?.querySelectorAll(".btn-disabled");
  assertEquals(ellipsis?.length, 0);
});

Deno.test("Pagination - single ellipsis scenarios", () => {
  const htmlStartEllipsis = renderToString(Pagination({
    currentPage: 13,
    totalPages: 15,
    maxVisiblePages: 5,
  }) as ComponentProps);

  const htmlEndEllipsis = renderToString(Pagination({
    currentPage: 3,
    totalPages: 15,
    maxVisiblePages: 5,
  }) as ComponentProps);

  const documentStart = parser.parseFromString(htmlStartEllipsis, "text/html");
  const documentEnd = parser.parseFromString(htmlEndEllipsis, "text/html");

  const ellipsisStart = documentStart?.querySelectorAll(".btn-disabled");
  const ellipsisEnd = documentEnd?.querySelectorAll(".btn-disabled");

  assertEquals(ellipsisStart?.length, 1);
  assertEquals(ellipsisEnd?.length, 1);
});

Deno.test("Pagination - button click handlers structure", () => {
  const html = renderToString(Pagination({
    currentPage: 3,
    totalPages: 5,
    onPageChange: () => {},
  }) as ComponentProps);

  const document = parser.parseFromString(html, "text/html");
  const pageButtons = document?.querySelectorAll('button[aria-label*="Go to page"]');
  const firstButton = document?.querySelector('[aria-label="Go to first page"]');
  const lastButton = document?.querySelector('[aria-label="Go to last page"]');
  const prevButton = document?.querySelector('[aria-label="Go to previous page"]');
  const nextButton = document?.querySelector('[aria-label="Go to next page"]');

  assertEquals(pageButtons?.length, 5);
  assertEquals(firstButton?.tagName, "BUTTON");
  assertEquals(lastButton?.tagName, "BUTTON");
  assertEquals(prevButton?.tagName, "BUTTON");
  assertEquals(nextButton?.tagName, "BUTTON");
});

Deno.test("Pagination - all button types present", () => {
  const html = renderToString(Pagination({
    currentPage: 3,
    totalPages: 5,
    showFirstLast: true,
    showPrevNext: true,
  }) as ComponentProps);

  const document = parser.parseFromString(html, "text/html");
  const allButtons = document?.querySelectorAll("button");

  // Should have: first, prev, 5 page buttons, next, last = 9 buttons total
  assertEquals(allButtons?.length, 9);
});

Deno.test("Pagination - minimal configuration", () => {
  const html = renderToString(Pagination({
    currentPage: 1,
    totalPages: 3,
    showFirstLast: false,
    showPrevNext: false,
  }) as ComponentProps);

  const document = parser.parseFromString(html, "text/html");
  const allButtons = document?.querySelectorAll("button");

  // Should only have 3 page buttons
  assertEquals(allButtons?.length, 3);
});

Deno.test("Pagination - default values", () => {
  const html = renderToString(Pagination({
    currentPage: 1,
    totalPages: 3,
  }) as ComponentProps);

  // Check default values are applied
  assertStringIncludes(html, "btn"); // Default size (md doesn't add class)
  assertStringIncludes(html, "«"); // showFirstLast default true
  assertStringIncludes(html, "‹"); // showPrevNext default true

  const document = parser.parseFromString(html, "text/html");
  const pageButtons = document?.querySelectorAll('button[aria-label*="Go to page"]');
  assertEquals(pageButtons?.length, 3); // maxVisiblePages default 5, but only 3 pages
});

Deno.test("Pagination - edge case: two pages", () => {
  const html = renderToString(Pagination({
    currentPage: 1,
    totalPages: 2,
  }) as ComponentProps);

  assertStringIncludes(html, "1");
  assertStringIncludes(html, "2");

  const document = parser.parseFromString(html, "text/html");
  const ellipsis = document?.querySelectorAll(".btn-disabled");
  assertEquals(ellipsis?.length, 0); // No ellipsis for 2 pages
});

Deno.test("Pagination - all props combined", () => {
  const html = renderToString(Pagination({
    class: "custom-pagination",
    currentPage: 5,
    totalPages: 10,
    size: "lg",
    showFirstLast: true,
    showPrevNext: true,
    maxVisiblePages: 3,
    onPageChange: () => {},
    onFirstPage: () => {},
    onLastPage: () => {},
    onNextPage: () => {},
    onPrevPage: () => {},
    id: "full-pagination",
  }) as ComponentProps);

  assertStringIncludes(html, 'class="join custom-pagination"');
  assertStringIncludes(html, 'id="full-pagination"');
  assertStringIncludes(html, "btn-lg");
  assertStringIncludes(html, "btn-active");
  assertStringIncludes(html, "«");
  assertStringIncludes(html, "»");
  assertStringIncludes(html, "‹");
  assertStringIncludes(html, "›");
  assertStringIncludes(html, "...");
});

Deno.test("Pagination - page button structure", () => {
  const html = renderToString(Pagination({
    currentPage: 2,
    totalPages: 4,
  }) as ComponentProps);

  const document = parser.parseFromString(html, "text/html");
  const pageButtons = document?.querySelectorAll('button[aria-label*="Go to page"]');

  pageButtons?.forEach((button, index) => {
    const pageNum = (index + 1).toString();
    assertEquals(button.textContent, pageNum);
    assertEquals(
      (button as unknown as Element).getAttribute("aria-label"),
      `Go to page ${pageNum}`,
    );
  });
});

Deno.test("Pagination - complex pagination scenario", () => {
  const html = renderToString(Pagination({
    currentPage: 50,
    totalPages: 100,
    maxVisiblePages: 7,
    size: "sm",
  }) as ComponentProps);

  assertStringIncludes(html, "btn-sm");
  assertStringIncludes(html, "1");
  assertStringIncludes(html, "100");
  assertStringIncludes(html, "50");
  assertStringIncludes(html, "...");

  const document = parser.parseFromString(html, "text/html");
  const ellipsis = document?.querySelectorAll(".btn-disabled");
  assertEquals(ellipsis?.length, 2); // Should have ellipsis on both sides

  const activeButton = document?.querySelector(".btn-active");
  assertEquals(activeButton?.textContent, "50");
});
