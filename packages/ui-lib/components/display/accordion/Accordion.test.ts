import { assertEquals, assertStringIncludes } from "jsr:@std/assert";
import { DOMParser } from "https://deno.land/x/deno_dom@v0.1.46/deno-dom-wasm.ts";
import { renderToString } from "preact-render-to-string";
import { Accordion, AccordionItemProps } from "./Accordion.tsx";
import { h } from "preact";

// Mock DOMParser for testing
const parser = new DOMParser();

const basicItems: AccordionItemProps[] = [
  {
    id: "item1",
    title: "First Item",
    content: "First item content",
  },
  {
    id: "item2",
    title: "Second Item",
    content: "Second item content",
  },
  {
    id: "item3",
    title: "Third Item",
    content: "Third item content",
  },
];

Deno.test("Accordion - basic rendering", () => {
  const html = renderToString(Accordion({
    items: basicItems,
  }));

  assertStringIncludes(html, 'class="collapse-container"');
  assertStringIncludes(html, 'class="collapse collapse-arrow bg-base-200 mb-2"');
  assertStringIncludes(html, "First Item");
  assertStringIncludes(html, "Second Item");
  assertStringIncludes(html, "Third Item");
});

Deno.test("Accordion - with custom class", () => {
  const html = renderToString(Accordion({
    items: basicItems,
    class: "custom-accordion",
  }));
  assertStringIncludes(html, 'class="collapse-container custom-accordion"');
});

Deno.test("Accordion - with id", () => {
  const html = renderToString(Accordion({
    items: basicItems,
    id: "test-accordion",
  }));
  assertStringIncludes(html, 'id="test-accordion"');
});

Deno.test("Accordion - uncontrolled mode (default)", () => {
  const html = renderToString(Accordion({
    items: basicItems,
  }));

  // Should use radio buttons for single mode
  assertStringIncludes(html, 'type="radio"');
  assertStringIncludes(html, 'name="accordion"');
  assertStringIncludes(html, '<label for="collapse-item1"');
});

Deno.test("Accordion - uncontrolled multiple mode", () => {
  const html = renderToString(Accordion({
    items: basicItems,
    multiple: true,
  }));

  // Should use checkboxes for multiple mode
  assertStringIncludes(html, 'type="checkbox"');
  const document = parser.parseFromString(html, "text/html");
  const radioInputs = document?.querySelectorAll('input[name="accordion"]');
  assertEquals(radioInputs?.length, 0); // No radio inputs with name attribute
});

Deno.test("Accordion - with defaultOpen items", () => {
  const html = renderToString(Accordion({
    items: basicItems,
    defaultOpen: ["item1", "item3"],
  }));

  assertStringIncludes(html, 'id="collapse-item1"');
  assertStringIncludes(html, 'id="collapse-item3"');
});

Deno.test("Accordion - controlled mode", () => {
  const html = renderToString(Accordion({
    items: basicItems,
    openItems: ["item2"],
    onToggle: () => {},
  }));

  // Should use controlled checkboxes
  assertStringIncludes(html, 'type="checkbox"');
  assertStringIncludes(html, 'class="sr-only"');
  assertStringIncludes(html, 'role="button"');
  assertStringIncludes(html, "aria-expanded");
});

Deno.test("Accordion - disabled items", () => {
  const itemsWithDisabled: AccordionItemProps[] = [
    {
      id: "item1",
      title: "First Item",
      content: "First item content",
    },
    {
      id: "item2",
      title: "Disabled Item",
      content: "Disabled content",
      disabled: true,
    },
  ];

  const html = renderToString(Accordion({
    items: itemsWithDisabled,
  }));

  assertStringIncludes(html, "disabled");
  assertStringIncludes(html, "opacity-50 cursor-not-allowed");
});

Deno.test("Accordion - JSX content", () => {
  const jsxItems: AccordionItemProps[] = [
    {
      id: "item1",
      title: h("strong", {}, "Bold Title"),
      content: h("div", {}, [
        h("p", {}, "Paragraph content"),
        h("button", { class: "btn" }, "Action Button"),
      ]),
    },
  ];

  const html = renderToString(Accordion({
    items: jsxItems,
  }));

  assertStringIncludes(html, "<strong>Bold Title</strong>");
  assertStringIncludes(html, "<p>Paragraph content</p>");
  assertStringIncludes(html, '<button class="btn">Action Button</button>');
});

Deno.test("Accordion - controlled mode with open item", () => {
  const html = renderToString(Accordion({
    items: basicItems,
    openItems: ["item2"],
    onToggle: () => {},
  }));

  const document = parser.parseFromString(html, "text/html");

  // Check that the controlled checkbox is checked
  const checkboxes = document?.querySelectorAll('input[type="checkbox"]');
  const secondCheckbox = checkboxes?.[1]; // item2 should be checked
  assertEquals(secondCheckbox?.hasAttribute("checked"), true);

  // Check content is visible for open item
  assertStringIncludes(html, "Second item content");
});

Deno.test("Accordion - controlled mode accessibility", () => {
  const html = renderToString(Accordion({
    items: basicItems,
    openItems: ["item1"],
    onToggle: () => {},
  }));

  assertStringIncludes(html, 'role="button"');
  assertStringIncludes(html, 'aria-expanded="true"');
  assertStringIncludes(html, 'aria-expanded="false"');
  assertStringIncludes(html, "tabindex");
});

Deno.test("Accordion - uncontrolled mode structure", () => {
  const html = renderToString(Accordion({
    items: basicItems,
  }));

  assertStringIncludes(html, '<label for="collapse-item1"');
  assertStringIncludes(html, '<label for="collapse-item2"');
  assertStringIncludes(html, '<label for="collapse-item3"');
  assertStringIncludes(html, 'class="collapse-content"');
});

Deno.test("Accordion - empty items array", () => {
  const html = renderToString(Accordion({
    items: [],
  }));

  assertStringIncludes(html, 'class="collapse-container"');
  const document = parser.parseFromString(html, "text/html");
  const collapseItems = document?.querySelectorAll(".collapse");
  assertEquals(collapseItems?.length, 0);
});

Deno.test("Accordion - all props combined", () => {
  const html = renderToString(Accordion({
    items: basicItems,
    class: "custom-accordion",
    id: "full-accordion",
    multiple: true,
    defaultOpen: ["item1", "item2"],
  }));

  assertStringIncludes(html, 'class="collapse-container custom-accordion"');
  assertStringIncludes(html, 'id="full-accordion"');
  assertStringIncludes(html, 'type="checkbox"');
});
