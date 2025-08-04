import { assertEquals, assertStringIncludes } from "@std/assert";
import { assertSnapshot } from "@std/testing/snapshot";
import { renderToString } from "preact-render-to-string";
import { Table } from "./Table.tsx";

Deno.test("Table - basic rendering", () => {
  const html = renderToString(Table({
    columns: [{ key: "name", title: "Name" }],
    data: [{ name: "Table content" }],
  }));
  assertStringIncludes(html, "table");
  assertStringIncludes(html, "Table content");
});

Deno.test("Table - with headers and data", () => {
  const columns = [
    { key: "name", title: "Name" },
    { key: "age", title: "Age" },
    { key: "email", title: "Email" },
  ];
  const data = [
    { name: "John Doe", age: "30", email: "john@example.com" },
    { name: "Jane Smith", age: "25", email: "jane@example.com" },
  ];

  const html = renderToString(Table({
    columns,
    data,
  }));
  assertStringIncludes(html, "table");
  assertStringIncludes(html, "Name");
  assertStringIncludes(html, "Age");
  assertStringIncludes(html, "Email");
  assertStringIncludes(html, "John Doe");
  assertStringIncludes(html, "jane@example.com");
});

Deno.test("Table - zebra striping", () => {
  const html = renderToString(Table({
    columns: [{ key: "name", title: "Name" }],
    data: [{ name: "Content" }],
    zebra: true,
  }));
  assertStringIncludes(html, "table-zebra");
});

Deno.test("Table - compact size", () => {
  const html = renderToString(Table({
    columns: [{ key: "name", title: "Name" }],
    data: [{ name: "Content" }],
    compact: true,
  }));
  assertStringIncludes(html, "table-xs");
});

Deno.test("Table - hover behavior", () => {
  const html = renderToString(Table({
    columns: [{ key: "name", title: "Name" }],
    data: [{ name: "Content" }],
    hover: true,
  }));
  assertStringIncludes(html, "table-hover");
});

Deno.test("Table - loading state", () => {
  const html = renderToString(Table({
    columns: [{ key: "name", title: "Name" }],
    data: [],
    loading: true,
  }));
  assertStringIncludes(html, "skeleton");
});

Deno.test("Table - empty state", () => {
  const html = renderToString(Table({
    columns: [{ key: "name", title: "Name" }],
    data: [],
    emptyMessage: "No data",
  }));
  assertStringIncludes(html, "No data");
});

Deno.test("Table - with pin rows", () => {
  const html = renderToString(Table({
    columns: [{ key: "name", title: "Name" }],
    data: [{ name: "Content" }],
    pinRows: true,
  }));
  assertStringIncludes(html, "table-pin-rows");
});

Deno.test("Table - with pin columns", () => {
  const html = renderToString(Table({
    columns: [{ key: "name", title: "Name" }],
    data: [{ name: "Content" }],
    pinCols: true,
  }));
  assertStringIncludes(html, "table-pin-cols");
});

Deno.test("Table - with custom class", () => {
  const html = renderToString(Table({
    columns: [{ key: "name", title: "Name" }],
    data: [{ name: "Content" }],
    class: "custom-table",
  }));
  assertStringIncludes(html, "custom-table");
});

Deno.test("Table - responsive", () => {
  const html = renderToString(Table({
    columns: [{ key: "name", title: "Name" }],
    data: [{ name: "Content" }],
  }));
  assertStringIncludes(html, "overflow-x-auto");
});

Deno.test("Table - HTML snapshot", async (t) => {
  const columns = [
    { key: "product", title: "Product" },
    { key: "price", title: "Price" },
    { key: "stock", title: "Stock" },
  ];
  const data = [
    { product: "Widget A", price: "$10.99", stock: "15" },
    { product: "Widget B", price: "$25.50", stock: "8" },
    { product: "Widget C", price: "$5.00", stock: "32" },
  ];

  const html = renderToString(Table({
    columns,
    data,
    zebra: true,
  }));
  await assertSnapshot(t, html);
});

Deno.test("Table - HTML snapshot compact", async (t) => {
  const html = renderToString(Table({
    columns: [
      { key: "id", title: "ID" },
      { key: "status", title: "Status" },
    ],
    data: [
      { id: "001", status: "Active" },
      { id: "002", status: "Inactive" },
    ],
    compact: true,
    pinRows: true,
  }));
  await assertSnapshot(t, html);
});
