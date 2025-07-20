import { assertEquals, assertStringIncludes } from "https://deno.land/std@0.224.0/assert/mod.ts";
import { assertSnapshot } from "https://deno.land/std@0.224.0/testing/snapshot.ts";
import { renderToString } from "preact-render-to-string";
import { h } from "preact";
import { Modal } from "./Modal.tsx";

Deno.test("Modal - basic rendering when closed", () => {
  const html = renderToString(Modal({
    children: "Test Modal Content",
    open: false,
  }));
  assertEquals(html, "");
});

Deno.test("Modal - basic rendering when open", () => {
  const html = renderToString(Modal({
    children: "Test Modal Content",
    open: true,
  }));
  assertStringIncludes(html, "modal");
  assertStringIncludes(html, "modal-open");
  assertStringIncludes(html, "modal-box");
  assertStringIncludes(html, "Test Modal Content");
});

Deno.test("Modal - with title", () => {
  const html = renderToString(Modal({
    children: "Content",
    open: true,
    title: "Modal Title",
  }));
  assertStringIncludes(html, "Modal Title");
  assertStringIncludes(html, "font-bold text-lg mb-4");
});

Deno.test("Modal - without title", () => {
  const html = renderToString(Modal({
    children: "Content",
    open: true,
  }));
  assertEquals(html.includes("font-bold text-lg mb-4"), false);
});

Deno.test("Modal - with backdrop", () => {
  const html = renderToString(Modal({
    children: "Content",
    open: true,
    backdrop: true,
  }));
  assertStringIncludes(html, "modal-backdrop");
});

Deno.test("Modal - without backdrop", () => {
  const html = renderToString(Modal({
    children: "Content",
    open: true,
    backdrop: false,
  }));
  assertEquals(html.includes("modal-backdrop"), false);
});

Deno.test("Modal - responsive sizing", () => {
  const html = renderToString(Modal({
    children: "Content",
    open: true,
    responsive: true,
  }));
  assertStringIncludes(html, "w-11/12 max-w-5xl");
});

Deno.test("Modal - non-responsive sizing", () => {
  const html = renderToString(Modal({
    children: "Content",
    open: true,
    responsive: false,
  }));
  assertEquals(html.includes("w-11/12 max-w-5xl"), false);
});

Deno.test("Modal - custom class", () => {
  const html = renderToString(Modal({
    children: "Content",
    open: true,
    class: "custom-modal-class",
  }));
  assertStringIncludes(html, "custom-modal-class");
});

Deno.test("Modal - with id", () => {
  const html = renderToString(Modal({
    children: "Content",
    open: true,
    id: "test-modal",
  }));
  assertStringIncludes(html, 'id="test-modal"');
});

Deno.test("Modal - complex children", () => {
  const html = renderToString(Modal({
    children: h("div", {}, [
      h("p", {}, "Modal paragraph"),
      h("button", { class: "btn" }, "Action"),
    ]),
    open: true,
    title: "Complex Modal",
  }));
  assertStringIncludes(html, "Modal paragraph");
  assertStringIncludes(html, "btn");
  assertStringIncludes(html, "Complex Modal");
});

Deno.test("Modal - all props combined", () => {
  const html = renderToString(Modal({
    children: "Full featured modal",
    open: true,
    title: "Full Modal",
    backdrop: true,
    responsive: true,
    class: "test-class",
    id: "full-modal",
  }));
  assertStringIncludes(html, "modal-open");
  assertStringIncludes(html, "Full Modal");
  assertStringIncludes(html, "modal-backdrop");
  assertStringIncludes(html, "w-11/12 max-w-5xl");
  assertStringIncludes(html, "test-class");
  assertStringIncludes(html, 'id="full-modal"');
});

// Snapshot tests
Deno.test("Modal - HTML snapshot when open", async (t) => {
  const html = renderToString(Modal({
    children: "Snapshot test content",
    open: true,
    title: "Snapshot Modal",
    backdrop: true,
  }));
  await assertSnapshot(t, html);
});

Deno.test("Modal - HTML snapshot when closed", async (t) => {
  const html = renderToString(Modal({
    children: "This should not render",
    open: false,
    title: "Hidden Modal",
  }));
  await assertSnapshot(t, html);
});

Deno.test("Modal - HTML snapshot complex", async (t) => {
  const html = renderToString(Modal({
    children: h("div", { class: "space-y-4" }, [
      h("p", { class: "text-base-content" }, "Modal description goes here."),
      h("div", { class: "modal-action" }, [
        h("button", { class: "btn" }, "Cancel"),
        h("button", { class: "btn btn-primary" }, "Save"),
      ]),
    ]),
    open: true,
    title: "Action Modal",
    responsive: true,
    backdrop: true,
    class: "custom-modal",
  }));
  await assertSnapshot(t, html);
});
