import { assertEquals, assertStringIncludes } from "jsr:@std/assert";
import { DOMParser } from "https://deno.land/x/deno_dom@v0.1.46/deno-dom-wasm.ts";
import { renderToString } from "preact-render-to-string";
import { PhoneMockup } from "./PhoneMockup.tsx";
import { h } from "preact";

// Mock DOMParser for testing
const parser = new DOMParser();

Deno.test("PhoneMockup - basic rendering", () => {
  const html = renderToString(PhoneMockup({
    children: "Phone content",
  }));

  assertStringIncludes(html, 'class="mockup-phone"');
  assertStringIncludes(html, '<div class="camera">');
  assertStringIncludes(html, '<div class="display">');
  assertStringIncludes(html, "artboard artboard-demo phone-1");
  assertStringIncludes(html, "Phone content");
});

Deno.test("PhoneMockup - with custom class", () => {
  const html = renderToString(PhoneMockup({
    children: "Content",
    class: "custom-phone",
  }));
  assertStringIncludes(html, 'class="mockup-phone custom-phone"');
});

Deno.test("PhoneMockup - orientation variants", () => {
  const portraitHtml = renderToString(PhoneMockup({
    children: "Portrait content",
    orientation: "portrait",
  }));

  const landscapeHtml = renderToString(PhoneMockup({
    children: "Landscape content",
    orientation: "landscape",
  }));

  assertStringIncludes(portraitHtml, 'class="mockup-phone"');
  assertStringIncludes(landscapeHtml, "mockup-phone-landscape");
});

Deno.test("PhoneMockup - color variants", () => {
  const colors = ["black", "white", "silver", "gold"];

  colors.forEach((color) => {
    const html = renderToString(PhoneMockup({
      children: "Test content",
      color: color as any,
    }));

    if (color === "black") {
      // Black is default, no extra border class
      assertStringIncludes(html, 'class="mockup-phone"');
    } else if (color === "white") {
      assertStringIncludes(html, "border-white");
    } else if (color === "silver") {
      assertStringIncludes(html, "border-gray-300");
    } else if (color === "gold") {
      assertStringIncludes(html, "border-yellow-400");
    }
  });
});

Deno.test("PhoneMockup - variant prop (currently not implemented)", () => {
  const variants = ["iphone", "android", "classic"];

  variants.forEach((variant) => {
    const html = renderToString(PhoneMockup({
      children: "Variant content",
      variant: variant as any,
    }));

    // Variant prop exists but doesn't affect classes currently
    assertStringIncludes(html, "mockup-phone");
    assertStringIncludes(html, "Variant content");
  });
});

Deno.test("PhoneMockup - with JSX children", () => {
  const content = h("div", { class: "app-content" }, [
    h("h1", {}, "App Title"),
    h("p", {}, "App description"),
    h("button", { class: "btn" }, "Action"),
  ]);

  const html = renderToString(PhoneMockup({
    children: content,
  }));

  assertStringIncludes(html, '<div class="app-content">');
  assertStringIncludes(html, "<h1>App Title</h1>");
  assertStringIncludes(html, "<p>App description</p>");
  assertStringIncludes(html, '<button class="btn">Action</button>');
});

Deno.test("PhoneMockup - with complex content", () => {
  const appContent = h("div", {
    class: "h-full bg-gradient-to-b from-blue-400 to-purple-600 p-4 text-white",
  }, [
    h("div", { class: "text-center mb-8" }, [
      h("h2", { class: "text-2xl font-bold" }, "Mobile App"),
      h("p", { class: "opacity-80" }, "Beautiful interface"),
    ]),
    h("div", { class: "space-y-4" }, [
      h("div", { class: "bg-white/20 rounded-lg p-4" }, "Feature 1"),
      h("div", { class: "bg-white/20 rounded-lg p-4" }, "Feature 2"),
      h("div", { class: "bg-white/20 rounded-lg p-4" }, "Feature 3"),
    ]),
  ]);

  const html = renderToString(PhoneMockup({
    children: appContent,
  }));

  assertStringIncludes(html, "Mobile App");
  assertStringIncludes(html, "Beautiful interface");
  assertStringIncludes(html, "Feature 1");
  assertStringIncludes(html, "bg-gradient-to-b from-blue-400 to-purple-600");
});

Deno.test("PhoneMockup - phone structure elements", () => {
  const html = renderToString(PhoneMockup({
    children: "Structure test",
  }));

  const document = parser.parseFromString(html, "text/html");

  const mockupPhone = document?.querySelector(".mockup-phone");
  assertEquals(mockupPhone !== null, true);

  const camera = document?.querySelector(".camera");
  assertEquals(camera !== null, true);

  const display = document?.querySelector(".display");
  assertEquals(display !== null, true);

  const artboard = document?.querySelector(".artboard");
  assertEquals(artboard !== null, true);
  assertEquals(artboard?.textContent, "Structure test");
});

Deno.test("PhoneMockup - landscape orientation", () => {
  const html = renderToString(PhoneMockup({
    children: "Landscape app",
    orientation: "landscape",
    color: "white",
  }));

  assertStringIncludes(html, "mockup-phone-landscape");
  assertStringIncludes(html, "border-white");
  assertStringIncludes(html, "Landscape app");
});

Deno.test("PhoneMockup - default values", () => {
  const html = renderToString(PhoneMockup({
    children: "Default phone",
  }));

  // Default: variant="iphone", orientation="portrait", color="black"
  assertStringIncludes(html, 'class="mockup-phone"');
  const document = parser.parseFromString(html, "text/html");
  const mockup = document?.querySelector(".mockup-phone");
  assertEquals(mockup?.className?.includes("mockup-phone-landscape"), false);
  assertEquals(mockup?.className?.includes("border-white"), false);
  assertEquals(mockup?.className?.includes("border-gray-300"), false);
  assertEquals(mockup?.className?.includes("border-yellow-400"), false);
});

Deno.test("PhoneMockup - all props combined", () => {
  const content = h("div", { class: "phone-demo" }, [
    h("nav", { class: "navbar" }, "Navigation"),
    h("main", { class: "content" }, "Main Content"),
    h("footer", { class: "footer" }, "Footer"),
  ]);

  const html = renderToString(PhoneMockup({
    children: content,
    variant: "android",
    orientation: "portrait",
    color: "silver",
    class: "custom-mockup",
  }));

  assertStringIncludes(html, 'class="mockup-phone border-gray-300 custom-mockup"');
  assertStringIncludes(html, '<nav class="navbar">Navigation</nav>');
  assertStringIncludes(html, '<main class="content">Main Content</main>');
  assertStringIncludes(html, '<footer class="footer">Footer</footer>');
});

Deno.test("PhoneMockup - empty children", () => {
  const html = renderToString(PhoneMockup({
    children: "",
  }));

  assertStringIncludes(html, "artboard artboard-demo phone-1");
  const document = parser.parseFromString(html, "text/html");
  const artboard = document?.querySelector(".artboard");
  assertEquals(artboard?.textContent, "");
});

Deno.test("PhoneMockup - nested component structure", () => {
  const html = renderToString(PhoneMockup({
    children: "Nested test",
  }));

  // Verify the nested structure: mockup-phone > camera + display > artboard
  const document = parser.parseFromString(html, "text/html");
  const mockup = document?.querySelector(".mockup-phone");
  const camera = mockup?.querySelector(".camera");
  const display = mockup?.querySelector(".display");
  const artboard = display?.querySelector(".artboard");

  assertEquals(camera !== null, true);
  assertEquals(display !== null, true);
  assertEquals(artboard !== null, true);
  assertEquals(artboard?.textContent, "Nested test");
});
