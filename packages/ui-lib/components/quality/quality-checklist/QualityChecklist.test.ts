import { assertEquals, assertStringIncludes } from "jsr:@std/assert";
import { DOMParser } from "https://deno.land/x/deno_dom@v0.1.46/deno-dom-wasm.ts";
import { renderToString } from "preact-render-to-string";
import { defaultQualityChecks, QualityChecklist } from "./QualityChecklist.tsx";

// Mock DOMParser for testing
const parser = new DOMParser();

const basicChecks = [
  {
    id: "test-1",
    title: "Test Check 1",
    description: "This is a test check",
    status: "pass" as const,
    category: "accessibility" as const,
  },
  {
    id: "test-2",
    title: "Test Check 2",
    description: "This is another test check",
    status: "fail" as const,
    category: "performance" as const,
  },
  {
    id: "test-3",
    title: "Test Check 3",
    description: "This is a warning check",
    status: "warning" as const,
    category: "accessibility" as const,
  },
];

Deno.test("QualityChecklist - basic rendering", () => {
  const html = renderToString(QualityChecklist({
    checks: basicChecks,
  }));

  assertStringIncludes(html, "Quality Assurance Checklist");
  assertStringIncludes(html, "Test Check 1");
  assertStringIncludes(html, "Test Check 2");
  assertStringIncludes(html, "Test Check 3");
  assertStringIncludes(html, "This is a test check");
});

Deno.test("QualityChecklist - with custom title", () => {
  const html = renderToString(QualityChecklist({
    checks: basicChecks,
    title: "Custom QA Report",
  }));
  assertStringIncludes(html, "Custom QA Report");
});

Deno.test("QualityChecklist - stats summary", () => {
  const html = renderToString(QualityChecklist({
    checks: basicChecks,
  }));

  assertStringIncludes(html, ">3</div>"); // Total checks
  assertStringIncludes(html, 'text-success">1</div>'); // Pass count
  assertStringIncludes(html, 'text-error">1</div>'); // Fail count
  assertStringIncludes(html, 'text-warning">1</div>'); // Warning count
  assertStringIncludes(html, "33.3%"); // Pass rate (1/3 * 100)
});

Deno.test("QualityChecklist - status icons", () => {
  const html = renderToString(QualityChecklist({
    checks: basicChecks,
  }));

  assertStringIncludes(html, "text-success"); // Pass icon
  assertStringIncludes(html, "text-error"); // Fail icon
  assertStringIncludes(html, "text-warning"); // Warning icon
});

Deno.test("QualityChecklist - status border colors", () => {
  const html = renderToString(QualityChecklist({
    checks: basicChecks,
  }));

  assertStringIncludes(html, "border-success"); // Pass border
  assertStringIncludes(html, "border-error"); // Fail border
  assertStringIncludes(html, "border-warning"); // Warning border
});

Deno.test("QualityChecklist - categories shown by default", () => {
  const html = renderToString(QualityChecklist({
    checks: basicChecks,
  }));

  assertStringIncludes(html, "accessibility"); // Component renders lowercase
  assertStringIncludes(html, "performance"); // Component renders lowercase
  assertStringIncludes(html, "2 items"); // Accessibility has 2 items
  assertStringIncludes(html, "1 items"); // Performance has 1 item
});

Deno.test("QualityChecklist - categories disabled", () => {
  const html = renderToString(QualityChecklist({
    checks: basicChecks,
    showCategories: false,
  }));

  const document = parser.parseFromString(html, "text/html");
  const categoryHeaders = document?.querySelectorAll("h3");
  assertEquals(categoryHeaders?.length, 0);

  // Should show category badges on individual items instead
  assertStringIncludes(html, "badge-primary"); // accessibility
  assertStringIncludes(html, "badge-secondary"); // performance
});

Deno.test("QualityChecklist - category badge colors", () => {
  const allCategoryChecks = [
    {
      id: "1",
      title: "A11y",
      description: "Test",
      status: "pass" as const,
      category: "accessibility" as const,
    },
    {
      id: "2",
      title: "Perf",
      description: "Test",
      status: "pass" as const,
      category: "performance" as const,
    },
    {
      id: "3",
      title: "SEO",
      description: "Test",
      status: "pass" as const,
      category: "seo" as const,
    },
    {
      id: "4",
      title: "Compat",
      description: "Test",
      status: "pass" as const,
      category: "compatibility" as const,
    },
    {
      id: "5",
      title: "UX",
      description: "Test",
      status: "pass" as const,
      category: "usability" as const,
    },
  ];

  const html = renderToString(QualityChecklist({
    checks: allCategoryChecks,
  }));

  assertStringIncludes(html, "badge-primary"); // accessibility
  assertStringIncludes(html, "badge-secondary"); // performance
  assertStringIncludes(html, "badge-accent"); // seo
  assertStringIncludes(html, "badge-info"); // compatibility
  assertStringIncludes(html, "badge-success"); // usability
});

Deno.test("QualityChecklist - info status (default)", () => {
  const infoChecks = [
    {
      id: "info-1",
      title: "Info Check",
      description: "This is an info check",
      status: "info" as const,
      category: "seo" as const,
    },
  ];

  const html = renderToString(QualityChecklist({
    checks: infoChecks,
  }));

  assertStringIncludes(html, "text-info");
  assertStringIncludes(html, "border-info");
  // Info status doesn't increment counters in stats, only shows in items // Info count in stats
});

Deno.test("QualityChecklist - empty checks array", () => {
  const html = renderToString(QualityChecklist({
    checks: [],
  }));

  assertStringIncludes(html, ">0</div>"); // Total count
  assertStringIncludes(html, "0%"); // Pass rate

  const document = parser.parseFromString(html, "text/html");
  const checkItems = document?.querySelectorAll(".border-l-4");
  assertEquals(checkItems?.length, 0);
});

Deno.test("QualityChecklist - single category", () => {
  const singleCategoryChecks = [
    {
      id: "1",
      title: "Check 1",
      description: "Test 1",
      status: "pass" as const,
      category: "accessibility" as const,
    },
    {
      id: "2",
      title: "Check 2",
      description: "Test 2",
      status: "fail" as const,
      category: "accessibility" as const,
    },
  ];

  const html = renderToString(QualityChecklist({
    checks: singleCategoryChecks,
  }));

  const document = parser.parseFromString(html, "text/html");
  const categoryHeaders = document?.querySelectorAll("h3");
  assertEquals(categoryHeaders?.length, 1);
  assertEquals(categoryHeaders?.[0]?.textContent, "accessibility");
});

Deno.test("QualityChecklist - action buttons", () => {
  const html = renderToString(QualityChecklist({
    checks: basicChecks,
  }));

  assertStringIncludes(html, "Export Report");
  assertStringIncludes(html, "Run Tests");
  assertStringIncludes(html, "btn btn-sm btn-outline");
  assertStringIncludes(html, "btn btn-sm btn-primary");
});

Deno.test("QualityChecklist - last updated date", () => {
  const html = renderToString(QualityChecklist({
    checks: basicChecks,
  }));

  assertStringIncludes(html, "Last updated:");
  // Should contain today's date in some format
  const today = new Date().toLocaleDateString();
  assertStringIncludes(html, today);
});

Deno.test("QualityChecklist - card structure", () => {
  const html = renderToString(QualityChecklist({
    checks: basicChecks,
  }));

  assertStringIncludes(html, "card bg-base-100 border border-base-300 shadow-lg");
  assertStringIncludes(html, "card-header p-6 border-b border-base-300");
  assertStringIncludes(html, "card-body p-6");
  assertStringIncludes(html, "card-footer p-6 border-t border-base-300");
});

Deno.test("QualityChecklist - stats grid layout", () => {
  const html = renderToString(QualityChecklist({
    checks: basicChecks,
  }));

  assertStringIncludes(html, "grid grid-cols-2 md:grid-cols-5 gap-4");
  assertStringIncludes(html, "stat bg-base-200 rounded-lg p-3");
  assertStringIncludes(html, "stat bg-success/10 rounded-lg p-3");
  assertStringIncludes(html, "stat bg-error/10 rounded-lg p-3");
  assertStringIncludes(html, "stat bg-warning/10 rounded-lg p-3");
  assertStringIncludes(html, "stat bg-primary/10 rounded-lg p-3");
});

Deno.test("QualityChecklist - pass rate calculation", () => {
  const passRateChecks = [
    {
      id: "1",
      title: "Pass 1",
      description: "Test",
      status: "pass" as const,
      category: "accessibility" as const,
    },
    {
      id: "2",
      title: "Pass 2",
      description: "Test",
      status: "pass" as const,
      category: "accessibility" as const,
    },
    {
      id: "3",
      title: "Fail 1",
      description: "Test",
      status: "fail" as const,
      category: "accessibility" as const,
    },
    {
      id: "4",
      title: "Warning 1",
      description: "Test",
      status: "warning" as const,
      category: "accessibility" as const,
    },
  ];

  const html = renderToString(QualityChecklist({
    checks: passRateChecks,
  }));

  // 2 passes out of 4 total = 50%
  assertStringIncludes(html, "50.0%");
});

Deno.test("QualityChecklist - default quality checks data", () => {
  const html = renderToString(QualityChecklist({
    checks: defaultQualityChecks,
  }));

  assertStringIncludes(html, "ARIA Labels Present");
  assertStringIncludes(html, "Color Contrast Compliance");
  assertStringIncludes(html, "Lazy Loading Implemented");
  assertStringIncludes(html, "Meta Tags Complete");
  assertStringIncludes(html, "Cross-Browser Tested");
  assertStringIncludes(html, "Loading States");

  // Should have all 5 categories
  assertStringIncludes(html, "accessibility"); // Component renders lowercase
  assertStringIncludes(html, "performance"); // Component renders lowercase
  assertStringIncludes(html, "seo"); // Component renders lowercase
  assertStringIncludes(html, "compatibility"); // Component renders lowercase
  assertStringIncludes(html, "usability"); // Component renders lowercase
});

Deno.test("QualityChecklist - check item structure", () => {
  const html = renderToString(QualityChecklist({
    checks: basicChecks,
  }));

  assertStringIncludes(html, "border-l-4");
  assertStringIncludes(html, "bg-base-200/50 p-4 rounded-r-lg");
  assertStringIncludes(html, "flex items-start gap-3");
  assertStringIncludes(html, "font-medium text-sm");
  assertStringIncludes(html, "text-sm text-base-content/70");
});

Deno.test("QualityChecklist - default values", () => {
  const html = renderToString(QualityChecklist({
    checks: basicChecks,
  }));

  // Default title
  assertStringIncludes(html, "Quality Assurance Checklist");

  // Default showCategories=true (categories should be visible)
  const document = parser.parseFromString(html, "text/html");
  const categoryHeaders = document?.querySelectorAll("h3");
  assertEquals(categoryHeaders?.length >= 1, true);
});
