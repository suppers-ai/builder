import { assertEquals, assertStringIncludes } from "jsr:@std/assert";
import { DOMParser } from "https://deno.land/x/deno_dom@v0.1.46/deno-dom-wasm.ts";
import { renderToString } from "preact-render-to-string";
import { Toast } from "./Toast.tsx";
import { h } from "preact";

// Mock DOMParser for testing
const parser = new DOMParser();

Deno.test("Toast - basic rendering", () => {
  const html = renderToString(Toast({
    message: "Test message",
  }));

  assertStringIncludes(html, 'class="alert alert-info"');
  assertStringIncludes(html, "<span>Test message</span>");
});

Deno.test("Toast - with custom class", () => {
  const html = renderToString(Toast({
    message: "Test message",
    class: "custom-toast",
  }));
  assertStringIncludes(html, 'class="alert alert-info custom-toast"');
});

Deno.test("Toast - type variants", () => {
  const types = ["info", "success", "warning", "error"];

  types.forEach((type) => {
    const html = renderToString(Toast({
      message: "Test message",
      type: type as any,
    }));
    assertStringIncludes(html, `alert-${type}`);
  });
});

Deno.test("Toast - with default info icon", () => {
  const html = renderToString(Toast({
    message: "Info message",
    type: "info",
  }));

  assertStringIncludes(html, '<svg xmlns="http://www.w3.org/2000/svg"');
  assertStringIncludes(html, "stroke-current shrink-0 w-6 h-6");
  assertStringIncludes(html, "M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z");
});

Deno.test("Toast - with success icon", () => {
  const html = renderToString(Toast({
    message: "Success message",
    type: "success",
  }));

  assertStringIncludes(html, "alert-success");
  assertStringIncludes(html, "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z");
});

Deno.test("Toast - with warning icon", () => {
  const html = renderToString(Toast({
    message: "Warning message",
    type: "warning",
  }));

  assertStringIncludes(html, "alert-warning");
  assertStringIncludes(
    html,
    "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.168 16.5c-.77.833.192 2.5 1.732 2.5z",
  );
});

Deno.test("Toast - with error icon", () => {
  const html = renderToString(Toast({
    message: "Error message",
    type: "error",
  }));

  assertStringIncludes(html, "alert-error");
  assertStringIncludes(
    html,
    "M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z",
  );
});

Deno.test("Toast - with custom icon", () => {
  const customIcon = h("div", { class: "custom-icon" }, "🎉");
  const html = renderToString(Toast({
    message: "Custom message",
    icon: customIcon,
  }));

  assertStringIncludes(html, '<div class="custom-icon">🎉</div>');
  assertStringIncludes(html, "<span>Custom message</span>");
});

Deno.test("Toast - dismissible (default)", () => {
  const html = renderToString(Toast({
    message: "Dismissible message",
  }));

  assertStringIncludes(html, '<button class="btn btn-sm btn-circle btn-ghost">');
  assertStringIncludes(html, "M6 18L18 6M6 6l12 12"); // Close icon path
});

Deno.test("Toast - not dismissible", () => {
  const html = renderToString(Toast({
    message: "Non-dismissible message",
    dismissible: false,
  }));

  const document = parser.parseFromString(html, "text/html");
  const dismissButton = document?.querySelector("button");
  assertEquals(dismissButton, null);
});

Deno.test("Toast - with id", () => {
  const html = renderToString(Toast({
    message: "Test message",
    id: "test-toast",
  }));
  assertStringIncludes(html, 'id="test-toast"');
});

Deno.test("Toast - all props combined", () => {
  const customIcon = h("span", { class: "custom-icon" }, "⚠️");
  const html = renderToString(Toast({
    class: "custom-toast",
    message: "Complete toast example",
    type: "warning",
    position: "bottom-center",
    duration: 5000,
    dismissible: true,
    icon: customIcon,
    id: "full-toast",
  }));

  assertStringIncludes(html, 'class="alert alert-warning custom-toast"');
  assertStringIncludes(html, 'id="full-toast"');
  assertStringIncludes(html, '<span class="custom-icon">⚠️</span>');
  assertStringIncludes(html, "<span>Complete toast example</span>");
  assertStringIncludes(html, '<button class="btn btn-sm btn-circle btn-ghost">');
});

Deno.test("Toast - message rendering", () => {
  const longMessage =
    "This is a very long toast message that should be displayed properly in the component.";
  const html = renderToString(Toast({
    message: longMessage,
  }));

  assertStringIncludes(html, `<span>${longMessage}</span>`);
});

Deno.test("Toast - default values", () => {
  const html = renderToString(Toast({
    message: "Default toast",
  }));

  assertStringIncludes(html, "alert-info"); // Default type
  const document = parser.parseFromString(html, "text/html");
  const dismissButton = document?.querySelector("button");
  assertEquals(dismissButton !== null, true); // Default dismissible = true
});

Deno.test("Toast - position prop ignored in display component", () => {
  // Position is used by positioning system, not in the component classes
  const html = renderToString(Toast({
    message: "Positioned toast",
    position: "bottom-center",
  }));

  assertStringIncludes(html, "<span>Positioned toast</span>");
  // Position doesn't affect the alert classes
  assertStringIncludes(html, 'class="alert alert-info"');
});

Deno.test("Toast - structure validation", () => {
  const html = renderToString(Toast({
    message: "Structure test",
    type: "success",
    dismissible: true,
  }));

  const document = parser.parseFromString(html, "text/html");
  const alert = document?.querySelector(".alert");
  assertEquals(alert !== null, true);

  const icon = document?.querySelector("svg");
  assertEquals(icon !== null, true);

  const message = document?.querySelector("span");
  assertEquals(message?.textContent, "Structure test");

  const button = document?.querySelector("button");
  assertEquals(button !== null, true);
});
