import { assertEquals, assertStringIncludes } from "jsr:@std/assert";
import { DOMParser } from "https://deno.land/x/deno_dom@v0.1.46/deno-dom-wasm.ts";
import { renderToString } from "preact-render-to-string";
import { Kbd } from "./Kbd.tsx";

// Mock DOMParser for testing
const parser = new DOMParser();

Deno.test("Kbd - basic rendering", () => {
  const html = renderToString(Kbd({
    children: "Ctrl",
  }));

  assertStringIncludes(html, '<kbd class="kbd kbd-md">Ctrl</kbd>');
});

Deno.test("Kbd - with custom class", () => {
  const html = renderToString(Kbd({
    children: "Ctrl",
    class: "custom-kbd",
  }));
  assertStringIncludes(html, 'class="kbd kbd-md custom-kbd"');
});

Deno.test("Kbd - size variants", () => {
  const sizes = ["xs", "sm", "md", "lg", "xl"];

  sizes.forEach((size) => {
    const html = renderToString(Kbd({
      children: "Key",
      size: size as "xs" | "sm" | "md" | "lg" | "xl",
    }));
    assertStringIncludes(html, `kbd-${size}`);
  });
});

Deno.test("Kbd - variant styles", () => {
  const variants = ["default", "primary", "secondary", "accent", "ghost"];

  variants.forEach((variant) => {
    const html = renderToString(Kbd({
      children: "Key",
      variant: variant as string,
    }));

    if (variant === "default") {
      // Default variant doesn't add extra class
      assertStringIncludes(html, 'class="kbd kbd-md"');
    } else {
      assertStringIncludes(html, `kbd-${variant}`);
    }
  });
});

Deno.test("Kbd - with onClick adds interactive styles", () => {
  const html = renderToString(Kbd({
    children: "Ctrl",
    onClick: () => {},
  }));
  assertStringIncludes(html, "cursor-pointer hover:opacity-80");
});

Deno.test("Kbd - without onClick no interactive styles", () => {
  const html = renderToString(Kbd({
    children: "Ctrl",
  }));
  const document = parser.parseFromString(html, "text/html");
  const kbd = document?.querySelector("kbd");
  assertEquals(kbd?.className?.includes("cursor-pointer"), false);
});

Deno.test("Kbd - with id", () => {
  const html = renderToString(Kbd({
    children: "Ctrl",
    id: "test-kbd",
  }));
  assertStringIncludes(html, 'id="test-kbd"');
});

Deno.test("Kbd - keyboard shortcut combinations", () => {
  const html = renderToString(Kbd({
    children: "⌘+K",
  }));
  assertStringIncludes(html, '<kbd class="kbd kbd-md">⌘+K</kbd>');
});

Deno.test("Kbd - empty content", () => {
  const html = renderToString(Kbd({
    children: "",
  }));
  assertStringIncludes(html, '<kbd class="kbd kbd-md"></kbd>');
});

Deno.test("Kbd - all props combined", () => {
  const html = renderToString(Kbd({
    class: "custom-kbd",
    children: "Escape",
    size: "lg",
    variant: "primary",
    onClick: () => {},
    id: "escape-key",
  }));

  assertStringIncludes(
    html,
    'class="kbd kbd-lg kbd-primary cursor-pointer hover:opacity-80 custom-kbd"',
  );
  assertStringIncludes(html, 'id="escape-key"');
  assertStringIncludes(html, ">Escape</kbd>");
});

Deno.test("Kbd - special characters", () => {
  const specialKeys = ["⌘", "⌥", "⌃", "⇧", "↵", "⌫", "⌦", "⇥"];

  specialKeys.forEach((key) => {
    const html = renderToString(Kbd({
      children: key,
    }));
    assertStringIncludes(html, `>${key}</kbd>`);
  });
});

Deno.test("Kbd - default values", () => {
  const html = renderToString(Kbd({
    children: "Test",
  }));
  assertStringIncludes(html, "kbd-md");
  assertStringIncludes(html, 'class="kbd kbd-md"');
  const document = parser.parseFromString(html, "text/html");
  const kbd = document?.querySelector("kbd");
  assertEquals(kbd?.className?.includes("kbd-primary"), false);
  assertEquals(kbd?.className?.includes("cursor-pointer"), false);
});

Deno.test("Kbd - tag structure", () => {
  const html = renderToString(Kbd({
    children: "Space",
  }));

  const document = parser.parseFromString(html, "text/html");
  const kbd = document?.querySelector("kbd");
  assertEquals(kbd?.tagName, "KBD");
  assertEquals(kbd?.textContent, "Space");
});
