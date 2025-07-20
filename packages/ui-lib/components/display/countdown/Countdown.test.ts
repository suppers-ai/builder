import { assertEquals, assertStringIncludes } from "https://deno.land/std@0.224.0/assert/mod.ts";
import { assertSnapshot } from "https://deno.land/std@0.224.0/testing/snapshot.ts";
import { renderToString } from "preact-render-to-string";
import { Countdown } from "./Countdown.tsx";

Deno.test("Countdown - basic rendering", () => {
  const html = renderToString(Countdown({
    timeLeft: { days: 1, hours: 2, minutes: 3, seconds: 42, totalSeconds: 94742 },
  }));
  assertStringIncludes(html, "flex gap-2");
  assertStringIncludes(html, "font-mono");
  assertStringIncludes(html, "42");
});

Deno.test("Countdown - with days", () => {
  const html = renderToString(Countdown({
    timeLeft: { days: 5, hours: 12, minutes: 30, seconds: 45, totalSeconds: 518445 },
  }));
  assertStringIncludes(html, "flex gap-2");
  assertStringIncludes(html, "05");
  assertStringIncludes(html, "12");
  assertStringIncludes(html, "30");
  assertStringIncludes(html, "45");
});

Deno.test("Countdown - with labels", () => {
  const html = renderToString(Countdown({
    timeLeft: { days: 0, hours: 24, minutes: 0, seconds: 0, totalSeconds: 86400 },
    showLabels: true,
  }));
  assertStringIncludes(html, "flex gap-2");
  assertStringIncludes(html, "hours");
});

Deno.test("Countdown - large size", () => {
  const html = renderToString(Countdown({
    timeLeft: { days: 0, hours: 1, minutes: 0, seconds: 0, totalSeconds: 3600 },
    size: "lg",
  }));
  assertStringIncludes(html, "text-4xl");
});

Deno.test("Countdown - medium size", () => {
  const html = renderToString(Countdown({
    timeLeft: { days: 0, hours: 0, minutes: 30, seconds: 0, totalSeconds: 1800 },
    size: "md",
  }));
  assertStringIncludes(html, "text-2xl");
});

Deno.test("Countdown - small size", () => {
  const html = renderToString(Countdown({
    timeLeft: { days: 0, hours: 0, minutes: 0, seconds: 15, totalSeconds: 15 },
    size: "sm",
  }));
  assertStringIncludes(html, "text-sm");
});

Deno.test("Countdown - with custom class", () => {
  const html = renderToString(Countdown({
    timeLeft: { days: 0, hours: 0, minutes: 0, seconds: 99, totalSeconds: 99 },
    class: "custom-countdown",
  }));
  assertStringIncludes(html, "custom-countdown");
});

Deno.test("Countdown - bordered style", () => {
  const html = renderToString(Countdown({
    timeLeft: { days: 0, hours: 0, minutes: 1, seconds: 28, totalSeconds: 88 },
    class: "border",
  }));
  assertStringIncludes(html, "border");
});

Deno.test("Countdown - with background", () => {
  const html = renderToString(Countdown({
    timeLeft: { days: 0, hours: 0, minutes: 1, seconds: 17, totalSeconds: 77 },
    class: "bg-neutral",
  }));
  assertStringIncludes(html, "bg-neutral");
});

Deno.test("Countdown - HTML snapshot", async (t) => {
  const html = renderToString(Countdown({
    timeLeft: { days: 0, hours: 0, minutes: 42, seconds: 0, totalSeconds: 2520 },
    showLabels: true,
  }));
  await assertSnapshot(t, html);
});

Deno.test("Countdown - HTML snapshot full format", async (t) => {
  const html = renderToString(Countdown({
    timeLeft: { days: 7, hours: 23, minutes: 59, seconds: 30, totalSeconds: 690570 },
    showLabels: true,
    size: "lg",
    class: "border",
  }));
  await assertSnapshot(t, html);
});
