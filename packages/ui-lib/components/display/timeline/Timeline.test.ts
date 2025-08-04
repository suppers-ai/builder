import { assertEquals, assertStringIncludes } from "@std/assert";
import { assertSnapshot } from "@std/testing/snapshot";
import { renderToString } from "preact-render-to-string";
import { Timeline } from "./Timeline.tsx";

Deno.test("Timeline - basic rendering", () => {
  const html = renderToString(Timeline({
    items: [{ title: "Timeline content" }],
  }));
  assertStringIncludes(html, "timeline");
  assertStringIncludes(html, "Timeline content");
});

Deno.test("Timeline - with items", () => {
  const items = [
    {
      title: "Project Started",
      content: "Initial project setup and planning",
      startContent: "Jan 1, 2024",
    },
    {
      title: "Development Phase",
      content: "Core features development",
      startContent: "Feb 15, 2024",
    },
    {
      title: "Launch",
      content: "Product launched successfully",
      startContent: "Mar 30, 2024",
    },
  ];

  const html = renderToString(Timeline({
    items,
  }));
  assertStringIncludes(html, "timeline");
  assertStringIncludes(html, "Project Started");
  assertStringIncludes(html, "Development Phase");
  assertStringIncludes(html, "Launch");
  assertStringIncludes(html, "Jan 1, 2024");
});

Deno.test("Timeline - vertical orientation", () => {
  const html = renderToString(Timeline({
    items: [{ title: "Content" }],
    variant: "vertical",
  }));
  assertStringIncludes(html, "timeline-vertical");
});

Deno.test("Timeline - horizontal orientation", () => {
  const html = renderToString(Timeline({
    items: [{ title: "Content" }],
    variant: "horizontal",
  }));
  assertStringIncludes(html, "timeline-horizontal");
});

Deno.test("Timeline - compact layout", () => {
  const html = renderToString(Timeline({
    items: [{ title: "Content" }],
    size: "sm",
  }));
  assertStringIncludes(html, "timeline-sm");
});

Deno.test("Timeline - with connectors", () => {
  const html = renderToString(Timeline({
    items: [{ title: "Content" }],
    showConnectors: true,
  }));
  assertStringIncludes(html, "timeline");
});

Deno.test("Timeline - with custom class", () => {
  const html = renderToString(Timeline({
    items: [{ title: "Content" }],
    class: "custom-timeline",
  }));
  assertStringIncludes(html, "custom-timeline");
});

Deno.test("Timeline - with alternating sides", () => {
  const html = renderToString(Timeline({
    items: [{ title: "Content" }, { title: "Content 2" }],
  }));
  assertStringIncludes(html, "timeline");
});

Deno.test("Timeline - with icons", () => {
  const items = [
    {
      title: "Start",
      description: "Beginning",
      icon: "▶️",
    },
    {
      title: "Progress",
      description: "In progress",
      icon: "⚡",
    },
  ];

  const html = renderToString(Timeline({
    items,
  }));
  assertStringIncludes(html, "▶️");
  assertStringIncludes(html, "⚡");
});

Deno.test("Timeline - HTML snapshot", async (t) => {
  const items = [
    {
      title: "Design Phase",
      description: "UI/UX design and wireframing",
      date: "Week 1",
      icon: "🎨",
    },
    {
      title: "Development",
      description: "Frontend and backend implementation",
      date: "Week 2-4",
      icon: "💻",
    },
    {
      title: "Testing",
      description: "Quality assurance and bug fixes",
      date: "Week 5",
      icon: "🧪",
    },
  ];

  const html = renderToString(Timeline({
    items,
    orientation: "vertical",
  }));
  await assertSnapshot(t, html);
});

Deno.test("Timeline - HTML snapshot horizontal", async (t) => {
  const html = renderToString(Timeline({
    items: [
      { title: "Start", date: "Day 1" },
      { title: "Middle", date: "Day 2" },
      { title: "End", date: "Day 3" },
    ],
    orientation: "horizontal",
    compact: true,
    snap: true,
  }));
  await assertSnapshot(t, html);
});
