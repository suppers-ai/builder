import { assertEquals, assertStringIncludes } from "jsr:@std/assert";
import { DOMParser } from "https://deno.land/x/deno_dom@v0.1.46/deno-dom-wasm.ts";
import { renderToString } from "preact-render-to-string";
import { TabItemProps, Tabs } from "./Tabs.tsx";
import { h } from "preact";

// Mock DOMParser for testing
const parser = new DOMParser();

const basicTabs: TabItemProps[] = [
  {
    id: "tab1",
    label: "Tab 1",
    content: "Content for tab 1",
  },
  {
    id: "tab2",
    label: "Tab 2",
    content: "Content for tab 2",
  },
  {
    id: "tab3",
    label: "Tab 3",
    content: "Content for tab 3",
  },
];

Deno.test("Tabs - basic rendering", () => {
  const html = renderToString(Tabs({
    tabs: basicTabs,
  }));

  assertStringIncludes(html, 'class="tabs tabs-md"');
  assertStringIncludes(html, 'role="tablist"');
  assertStringIncludes(html, "Tab 1");
  assertStringIncludes(html, "Tab 2");
  assertStringIncludes(html, "Tab 3");
});

Deno.test("Tabs - with custom class", () => {
  const html = renderToString(Tabs({
    tabs: basicTabs,
    class: "custom-tabs",
  }));
  assertStringIncludes(html, 'class="tabs tabs-md custom-tabs"');
});

Deno.test("Tabs - size variants", () => {
  const sizes = ["xs", "sm", "md", "lg"];

  sizes.forEach((size) => {
    const html = renderToString(Tabs({
      tabs: basicTabs,
      size: size as 'xs' | 'sm' | 'md' | 'lg' | 'xl',
    }));
    assertStringIncludes(html, `tabs-${size}`);
  });
});

Deno.test("Tabs - style variants", () => {
  const borderedHtml = renderToString(Tabs({
    tabs: basicTabs,
    bordered: true,
  }));

  const liftedHtml = renderToString(Tabs({
    tabs: basicTabs,
    lifted: true,
  }));

  const boxedHtml = renderToString(Tabs({
    tabs: basicTabs,
    boxed: true,
  }));

  assertStringIncludes(borderedHtml, "tabs-bordered");
  assertStringIncludes(liftedHtml, "tabs-lifted");
  assertStringIncludes(boxedHtml, "tabs-boxed");
});

Deno.test("Tabs - active tab (first tab default)", () => {
  const html = renderToString(Tabs({
    tabs: basicTabs,
  }));

  assertStringIncludes(html, "tab-active");
  assertStringIncludes(html, "Content for tab 1");

  const document = parser.parseFromString(html, "text/html");
  const activeTab = document?.querySelector(".tab-active");
  assertEquals(activeTab?.textContent, "Tab 1");
});

Deno.test("Tabs - with specific active tab", () => {
  const html = renderToString(Tabs({
    tabs: basicTabs,
    activeTab: "tab2",
  }));

  assertStringIncludes(html, "Content for tab 2");

  const document = parser.parseFromString(html, "text/html");
  const activeTab = document?.querySelector(".tab-active");
  assertEquals(activeTab?.textContent, "Tab 2");
});

Deno.test("Tabs - disabled tab", () => {
  const tabsWithDisabled: TabItemProps[] = [
    { id: "tab1", label: "Tab 1", content: "Content 1" },
    { id: "tab2", label: "Disabled Tab", content: "Content 2", disabled: true },
    { id: "tab3", label: "Tab 3", content: "Content 3" },
  ];

  const html = renderToString(Tabs({
    tabs: tabsWithDisabled,
  }));

  assertStringIncludes(html, "tab-disabled");
  assertStringIncludes(html, 'aria-disabled="true"');
});

Deno.test("Tabs - with onClick handler adds interactive styles", () => {
  const html = renderToString(Tabs({
    tabs: basicTabs,
    onTabChange: () => {},
  }));

  assertStringIncludes(html, "cursor-pointer");
});

Deno.test("Tabs - without onClick handler no interactive styles", () => {
  const html = renderToString(Tabs({
    tabs: basicTabs,
  }));

  const document = parser.parseFromString(html, "text/html");
  const tabs = document?.querySelectorAll(".tab");
  tabs?.forEach((tab) => {
    assertEquals(tab.className?.includes("cursor-pointer"), false);
  });
});

Deno.test("Tabs - accessibility attributes", () => {
  const html = renderToString(Tabs({
    tabs: basicTabs,
    activeTab: "tab2",
  }));

  assertStringIncludes(html, 'role="tablist"');
  assertStringIncludes(html, 'role="tab"');
  assertStringIncludes(html, 'aria-selected="true"');
  assertStringIncludes(html, 'aria-selected="false"');
});

Deno.test("Tabs - with JSX content", () => {
  const tabsWithJSX: TabItemProps[] = [
    {
      id: "content-tab",
      label: "Rich Content",
      content: h("div", { class: "space-y-4" }, [
        h("h3", { class: "text-lg font-semibold" }, "Section Title"),
        h("p", {}, "This is a paragraph with rich content."),
        h("button", { class: "btn btn-primary" }, "Action Button"),
      ]),
    },
    {
      id: "simple-tab",
      label: "Simple",
      content: "Simple text content",
    },
  ];

  const html = renderToString(Tabs({
    tabs: tabsWithJSX,
  }));

  assertStringIncludes(html, '<h3 class="text-lg font-semibold">Section Title</h3>');
  assertStringIncludes(html, "<p>This is a paragraph with rich content.</p>");
  assertStringIncludes(html, '<button class="btn btn-primary">Action Button</button>');
});

Deno.test("Tabs - with id", () => {
  const html = renderToString(Tabs({
    tabs: basicTabs,
    id: "test-tabs",
  }));
  assertStringIncludes(html, 'id="test-tabs"');
});

Deno.test("Tabs - tab content structure", () => {
  const html = renderToString(Tabs({
    tabs: basicTabs,
    activeTab: "tab3",
  }));

  assertStringIncludes(html, "tab-content bg-base-100 border-base-300 rounded-box p-6 mt-2");
  assertStringIncludes(html, "Content for tab 3");
});

Deno.test("Tabs - empty tabs array", () => {
  const html = renderToString(Tabs({
    tabs: [],
  }));

  assertStringIncludes(html, 'class="tabs tabs-md"');

  const document = parser.parseFromString(html, "text/html");
  const tabElements = document?.querySelectorAll(".tab");
  assertEquals(tabElements?.length, 0);

  const tabContent = document?.querySelector(".tab-content");
  assertEquals(tabContent, null);
});

Deno.test("Tabs - single tab", () => {
  const singleTab: TabItemProps[] = [
    { id: "only-tab", label: "Only Tab", content: "Only content" },
  ];

  const html = renderToString(Tabs({
    tabs: singleTab,
  }));

  const document = parser.parseFromString(html, "text/html");
  const tabElements = document?.querySelectorAll(".tab");
  assertEquals(tabElements?.length, 1);

  assertStringIncludes(html, "tab-active");
  assertStringIncludes(html, "Only content");
});

Deno.test("Tabs - all style variants combined", () => {
  const html = renderToString(Tabs({
    tabs: basicTabs,
    bordered: true,
    lifted: true,
    boxed: true,
    size: "lg",
  }));

  assertStringIncludes(html, "tabs tabs-lg tabs-bordered tabs-lifted tabs-boxed");
});

Deno.test("Tabs - default values", () => {
  const html = renderToString(Tabs({
    tabs: basicTabs,
  }));

  assertStringIncludes(html, "tabs-md"); // Default size

  const document = parser.parseFromString(html, "text/html");
  const tabsContainer = document?.querySelector(".tabs");
  assertEquals(tabsContainer?.className?.includes("tabs-bordered"), false);
  assertEquals(tabsContainer?.className?.includes("tabs-lifted"), false);
  assertEquals(tabsContainer?.className?.includes("tabs-boxed"), false);
});

Deno.test("Tabs - all props combined", () => {
  const complexTabs: TabItemProps[] = [
    {
      id: "tab1",
      label: "Active Tab",
      content: h("div", { class: "rich-content" }, "Rich content 1"),
    },
    { id: "tab2", label: "Regular Tab", content: "Simple content 2" },
    { id: "tab3", label: "Disabled Tab", content: "Content 3", disabled: true },
  ];

  const html = renderToString(Tabs({
    class: "custom-tabs",
    size: "lg",
    tabs: complexTabs,
    activeTab: "tab1",
    bordered: true,
    lifted: false,
    boxed: true,
    onTabChange: () => {},
    id: "full-tabs",
  }));

  assertStringIncludes(html, 'class="tabs tabs-lg tabs-bordered tabs-boxed custom-tabs"');
  assertStringIncludes(html, 'id="full-tabs"');
  assertStringIncludes(html, "cursor-pointer");
  assertStringIncludes(html, "tab-disabled");
  assertStringIncludes(html, '<div class="rich-content">Rich content 1</div>');
});

Deno.test("Tabs - tab state management", () => {
  const html = renderToString(Tabs({
    tabs: basicTabs,
    activeTab: "nonexistent-tab",
  }));

  // When activeTab doesn't exist, no tab should be active
  assertEquals(html.includes("tab-active"), false);
  assertEquals(html.includes("Content for tab"), false); // No content shown
});
