import { assertEquals, assertStringIncludes } from "@std/assert";
import { assertSnapshot } from "@std/testing/snapshot";
import { renderToString } from "preact-render-to-string";
import { h } from "preact";
import { Alert } from "./Alert.tsx";

Deno.test("Alert - basic rendering", () => {
  const html = renderToString(Alert({
    children: "Alert message",
  }));
  assertStringIncludes(html, "alert");
  assertStringIncludes(html, "alert-info");
  assertStringIncludes(html, "Alert message");
  assertStringIncludes(html, "ℹ️");
});

Deno.test("Alert - info color (default)", () => {
  const html = renderToString(Alert({
    color: "info",
    children: "Info alert",
  }));
  assertStringIncludes(html, "alert-info");
  assertStringIncludes(html, "ℹ️");
});

Deno.test("Alert - success color", () => {
  const html = renderToString(Alert({
    color: "success",
    children: "Success alert",
  }));
  assertStringIncludes(html, "alert-success");
  assertStringIncludes(html, "✅");
});

Deno.test("Alert - warning color", () => {
  const html = renderToString(Alert({
    color: "warning",
    children: "Warning alert",
  }));
  assertStringIncludes(html, "alert-warning");
  assertStringIncludes(html, "⚠️");
});

Deno.test("Alert - error color", () => {
  const html = renderToString(Alert({
    color: "error",
    children: "Error alert",
  }));
  assertStringIncludes(html, "alert-error");
  assertStringIncludes(html, "❌");
});

Deno.test("Alert - custom icon", () => {
  const html = renderToString(Alert({
    icon: "🔥",
    children: "Custom icon alert",
  }));
  assertStringIncludes(html, "🔥");
  assertEquals(html.includes("ℹ️"), false);
});

Deno.test("Alert - no icon", () => {
  const html = renderToString(Alert({
    icon: null,
    children: "No icon alert",
  }));
  // Should still have default icon
  assertStringIncludes(html, "ℹ️");
});

Deno.test("Alert - dismissible", () => {
  const html = renderToString(Alert({
    dismissible: true,
    children: "Dismissible alert",
  }));
  assertStringIncludes(html, "btn btn-sm btn-circle btn-ghost");
  assertStringIncludes(html, "✕");
});

Deno.test("Alert - not dismissible", () => {
  const html = renderToString(Alert({
    dismissible: false,
    children: "Non-dismissible alert",
  }));
  assertEquals(html.includes("btn btn-sm btn-circle btn-ghost"), false);
  assertEquals(html.includes("✕"), false);
});

Deno.test("Alert - with actions", () => {
  const html = renderToString(Alert({
    children: "Alert with actions",
    actions: h("div", {}, [
      h("button", { class: "btn btn-sm" }, "Action 1"),
      h("button", { class: "btn btn-sm" }, "Action 2"),
    ]),
  }));
  assertStringIncludes(html, "btn btn-sm");
  assertStringIncludes(html, "Action 1");
  assertStringIncludes(html, "Action 2");
});

Deno.test("Alert - without actions", () => {
  const html = renderToString(Alert({
    children: "Alert without actions",
  }));
  assertStringIncludes(html, "Alert without actions");
});

Deno.test("Alert - custom class", () => {
  const html = renderToString(Alert({
    class: "custom-alert-class",
    children: "Custom class alert",
  }));
  assertStringIncludes(html, "custom-alert-class");
});

Deno.test("Alert - with id", () => {
  const html = renderToString(Alert({
    id: "test-alert",
    children: "Alert with id",
  }));
  assertStringIncludes(html, 'id="test-alert"');
});

Deno.test("Alert - complex children", () => {
  const html = renderToString(Alert({
    children: h("div", {}, [
      h("h4", {}, "Alert Title"),
      h("p", {}, "Alert description with more details."),
    ]),
  }));
  assertStringIncludes(html, "Alert Title");
  assertStringIncludes(html, "Alert description with more details.");
});

Deno.test("Alert - all props combined", () => {
  const html = renderToString(Alert({
    color: "warning",
    icon: "🚨",
    dismissible: true,
    actions: h("button", { class: "btn btn-sm" }, "Fix"),
    class: "test-class",
    id: "full-alert",
    children: "Full featured alert",
  }));
  assertStringIncludes(html, "alert-warning");
  assertStringIncludes(html, "🚨");
  assertStringIncludes(html, "btn btn-sm btn-circle btn-ghost");
  assertStringIncludes(html, "✕");
  assertStringIncludes(html, "Fix");
  assertStringIncludes(html, "test-class");
  assertStringIncludes(html, 'id="full-alert"');
  assertStringIncludes(html, "Full featured alert");
});

Deno.test("Alert - success with custom icon and actions", () => {
  const html = renderToString(Alert({
    color: "success",
    icon: "🎉",
    actions: h("div", {}, [
      h("button", { class: "btn btn-sm btn-outline" }, "View"),
      h("button", { class: "btn btn-sm btn-primary" }, "Continue"),
    ]),
    children: "Operation completed successfully!",
  }));
  assertStringIncludes(html, "alert-success");
  assertStringIncludes(html, "🎉");
  assertStringIncludes(html, "btn-outline");
  assertStringIncludes(html, "btn-primary");
  assertStringIncludes(html, "View");
  assertStringIncludes(html, "Continue");
  assertStringIncludes(html, "Operation completed successfully!");
});

Deno.test("Alert - error with dismissible", () => {
  const html = renderToString(Alert({
    color: "error",
    dismissible: true,
    children: "Something went wrong. Please try again.",
  }));
  assertStringIncludes(html, "alert-error");
  assertStringIncludes(html, "❌");
  assertStringIncludes(html, "btn btn-sm btn-circle btn-ghost");
  assertStringIncludes(html, "Something went wrong. Please try again.");
});

Deno.test("Alert - warning with multiple actions", () => {
  const html = renderToString(Alert({
    color: "warning",
    actions: h("div", {}, [
      h("button", { class: "btn btn-sm btn-ghost" }, "Cancel"),
      h("button", { class: "btn btn-sm btn-warning" }, "Proceed"),
      h("button", { class: "btn btn-sm btn-outline" }, "Learn More"),
    ]),
    children: "Are you sure you want to continue?",
  }));
  assertStringIncludes(html, "alert-warning");
  assertStringIncludes(html, "⚠️");
  assertStringIncludes(html, "btn-ghost");
  assertStringIncludes(html, "btn-warning");
  assertStringIncludes(html, "btn-outline");
  assertStringIncludes(html, "Cancel");
  assertStringIncludes(html, "Proceed");
  assertStringIncludes(html, "Learn More");
});

Deno.test("Alert - JSX icon", () => {
  const html = renderToString(Alert({
    icon: h("span", { class: "icon-custom" }, "🔔"),
    children: "Alert with JSX icon",
  }));
  assertStringIncludes(html, "icon-custom");
  assertStringIncludes(html, "🔔");
});

// Snapshot tests
Deno.test("Alert - HTML snapshot basic", async (t) => {
  const html = renderToString(Alert({
    color: "info",
    children: "Basic alert message",
  }));
  await assertSnapshot(t, html);
});

Deno.test("Alert - HTML snapshot with actions", async (t) => {
  const html = renderToString(Alert({
    color: "success",
    dismissible: true,
    actions: h("div", {}, [
      h("button", { class: "btn btn-sm" }, "Action"),
    ]),
    children: "Success alert with actions",
  }));
  await assertSnapshot(t, html);
});

Deno.test("Alert - HTML snapshot complex", async (t) => {
  const html = renderToString(Alert({
    color: "warning",
    icon: "⚡",
    dismissible: true,
    actions: h("div", {}, [
      h("button", { class: "btn btn-sm btn-ghost" }, "Cancel"),
      h("button", { class: "btn btn-sm btn-warning" }, "Confirm"),
    ]),
    children: h("div", {}, [
      h("h4", { class: "font-bold" }, "Important Notice"),
      h("p", {}, "This action cannot be undone. Please confirm your choice."),
    ]),
    class: "custom-alert",
  }));
  await assertSnapshot(t, html);
});
