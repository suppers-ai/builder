import { assertEquals, assertStringIncludes } from "jsr:@std/assert";
import { DOMParser } from "https://deno.land/x/deno_dom@v0.1.46/deno-dom-wasm.ts";
import { renderToString } from "preact-render-to-string";
import { Divider } from "./Divider.tsx";

// Mock DOMParser for testing
const parser = new DOMParser();

Deno.test("Divider - basic rendering", () => {
  const html = renderToString(Divider({}));

  assertStringIncludes(html, 'class="divider divider-horizontal"');
});

Deno.test("Divider - with custom class", () => {
  const html = renderToString(Divider({
    class: "custom-divider",
  }));
  assertStringIncludes(html, 'class="divider divider-horizontal custom-divider"');
});

Deno.test("Divider - with text", () => {
  const html = renderToString(Divider({
    text: "OR",
  }));

  assertStringIncludes(html, 'class="divider divider-horizontal"');
  assertStringIncludes(html, ">OR</div>");
});

Deno.test("Divider - without text", () => {
  const html = renderToString(Divider({}));

  const document = parser.parseFromString(html, "text/html");
  const divider = document?.querySelector(".divider");
  assertEquals(divider?.textContent, "");
});

Deno.test("Divider - horizontal orientation (default)", () => {
  const html = renderToString(Divider({}));

  assertStringIncludes(html, "divider-horizontal");
  const document = parser.parseFromString(html, "text/html");
  const divider = document?.querySelector(".divider");
  assertEquals(divider?.className?.includes("divider-vertical"), false);
});

Deno.test("Divider - vertical orientation", () => {
  const html = renderToString(Divider({
    vertical: true,
  }));

  assertStringIncludes(html, "divider-vertical");
  const document = parser.parseFromString(html, "text/html");
  const divider = document?.querySelector(".divider");
  assertEquals(divider?.className?.includes("divider-horizontal"), false);
});

Deno.test("Divider - position variants", () => {
  const positions = ["start", "center", "end"];

  positions.forEach((position) => {
    const html = renderToString(Divider({
      position: position as string,
      text: "Test",
    }));

    if (position === "center") {
      // Center is default, no extra class
      assertStringIncludes(html, 'class="divider divider-horizontal"');
    } else {
      assertStringIncludes(html, `divider-${position}`);
    }
  });
});

Deno.test("Divider - responsive option", () => {
  const html = renderToString(Divider({
    responsive: true,
  }));

  assertStringIncludes(html, "divider-responsive");
});

Deno.test("Divider - not responsive (default)", () => {
  const html = renderToString(Divider({}));

  const document = parser.parseFromString(html, "text/html");
  const divider = document?.querySelector(".divider");
  assertEquals(divider?.className?.includes("divider-responsive"), false);
});

Deno.test("Divider - with id", () => {
  const html = renderToString(Divider({
    id: "test-divider",
  }));
  assertStringIncludes(html, 'id="test-divider"');
});

Deno.test("Divider - all props combined", () => {
  const html = renderToString(Divider({
    class: "custom-divider",
    text: "Section Break",
    position: "start",
    responsive: true,
    vertical: false,
    id: "full-divider",
  }));

  assertStringIncludes(
    html,
    'class="divider divider-horizontal divider-start divider-responsive custom-divider"',
  );
  assertStringIncludes(html, 'id="full-divider"');
  assertStringIncludes(html, ">Section Break</div>");
});

Deno.test("Divider - vertical with text", () => {
  const html = renderToString(Divider({
    text: "Vertical OR",
    vertical: true,
    position: "center",
  }));

  assertStringIncludes(html, 'class="divider divider-vertical"');
  assertStringIncludes(html, ">Vertical OR</div>");
});

Deno.test("Divider - end positioned divider", () => {
  const html = renderToString(Divider({
    text: "End Text",
    position: "end",
  }));

  assertStringIncludes(html, "divider-end");
  assertStringIncludes(html, ">End Text</div>");
});

Deno.test("Divider - start positioned divider", () => {
  const html = renderToString(Divider({
    text: "Start Text",
    position: "start",
  }));

  assertStringIncludes(html, "divider-start");
  assertStringIncludes(html, ">Start Text</div>");
});

Deno.test("Divider - default values", () => {
  const html = renderToString(Divider({}));

  assertStringIncludes(html, "divider-horizontal");
  assertStringIncludes(html, 'class="divider divider-horizontal"');

  const document = parser.parseFromString(html, "text/html");
  const divider = document?.querySelector(".divider");
  assertEquals(divider?.className?.includes("divider-start"), false);
  assertEquals(divider?.className?.includes("divider-end"), false);
  assertEquals(divider?.className?.includes("divider-responsive"), false);
  assertEquals(divider?.className?.includes("divider-vertical"), false);
});

Deno.test("Divider - empty text handling", () => {
  const html = renderToString(Divider({
    text: "",
  }));

  const document = parser.parseFromString(html, "text/html");
  const divider = document?.querySelector(".divider");
  assertEquals(divider?.textContent, "");
});
