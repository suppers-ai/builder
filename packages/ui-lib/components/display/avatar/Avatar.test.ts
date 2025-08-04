import { assertEquals, assertStringIncludes } from "@std/assert";
import { assertSnapshot } from "@std/testing/snapshot";
import { renderToString } from "preact-render-to-string";
import { Avatar } from "./Avatar.tsx";

Deno.test("Avatar - basic rendering with image", () => {
  const html = renderToString(Avatar({
    src: "https://example.com/avatar.jpg",
    alt: "User Avatar",
  }));
  assertStringIncludes(html, "avatar");
  assertStringIncludes(html, "rounded-full");
  assertStringIncludes(html, "https://example.com/avatar.jpg");
  assertStringIncludes(html, "User Avatar");
});

Deno.test("Avatar - placeholder without image", () => {
  const html = renderToString(Avatar({
    placeholder: "JD",
    alt: "John Doe",
  }));
  assertStringIncludes(html, "avatar");
  assertStringIncludes(html, "placeholder");
  assertStringIncludes(html, "JD");
  assertStringIncludes(html, "bg-neutral");
});

Deno.test("Avatar - initials without image", () => {
  const html = renderToString(Avatar({
    initials: "AB",
  }));
  assertStringIncludes(html, "AB");
  assertStringIncludes(html, "placeholder");
});

Deno.test("Avatar - default placeholder", () => {
  const html = renderToString(Avatar({}));
  assertStringIncludes(html, "?");
  assertStringIncludes(html, "placeholder");
});

Deno.test("Avatar - size variants", () => {
  const sizes = ["xs", "sm", "md", "lg", "xl"];

  sizes.forEach((size) => {
    const html = renderToString(Avatar({
      size: size as 'xs' | 'sm' | 'md' | 'lg' | 'xl',
      placeholder: "T",
    }));

    switch (size) {
      case "xs":
        assertStringIncludes(html, "w-6 h-6");
        assertStringIncludes(html, "text-xs");
        break;
      case "sm":
        assertStringIncludes(html, "w-8 h-8");
        assertStringIncludes(html, "text-sm");
        break;
      case "md":
        assertStringIncludes(html, "w-12 h-12");
        assertStringIncludes(html, "text-xl");
        break;
      case "lg":
        assertStringIncludes(html, "w-16 h-16");
        assertStringIncludes(html, "text-xl");
        break;
      case "xl":
        assertStringIncludes(html, "w-24 h-24");
        assertStringIncludes(html, "text-xl");
        break;
    }
  });
});

Deno.test("Avatar - with ring", () => {
  const html = renderToString(Avatar({
    src: "test.jpg",
    ring: true,
  }));
  assertStringIncludes(html, "ring ring-primary ring-offset-base-100 ring-offset-2");
});

Deno.test("Avatar - without ring", () => {
  const html = renderToString(Avatar({
    src: "test.jpg",
    ring: false,
  }));
  assertEquals(html.includes("ring ring-primary"), false);
});

Deno.test("Avatar - online status", () => {
  const html = renderToString(Avatar({
    src: "test.jpg",
    online: true,
  }));
  assertStringIncludes(html, "online");
});

Deno.test("Avatar - offline status", () => {
  const html = renderToString(Avatar({
    src: "test.jpg",
    offline: true,
  }));
  assertStringIncludes(html, "offline");
});

Deno.test("Avatar - no status indicators", () => {
  const html = renderToString(Avatar({
    src: "test.jpg",
  }));
  assertEquals(html.includes("online"), false);
  assertEquals(html.includes("offline"), false);
});

Deno.test("Avatar - custom class", () => {
  const html = renderToString(Avatar({
    placeholder: "C",
    class: "custom-avatar-class",
  }));
  assertStringIncludes(html, "custom-avatar-class");
});

Deno.test("Avatar - with id", () => {
  const html = renderToString(Avatar({
    placeholder: "I",
    id: "test-avatar",
  }));
  assertStringIncludes(html, 'id="test-avatar"');
});

Deno.test("Avatar - image takes precedence over placeholder", () => {
  const html = renderToString(Avatar({
    src: "test.jpg",
    placeholder: "T",
    alt: "Test Image",
  }));
  assertStringIncludes(html, "test.jpg");
  assertStringIncludes(html, "Test Image");
  assertEquals(html.includes("placeholder"), false);
});

Deno.test("Avatar - initials take precedence over placeholder", () => {
  const html = renderToString(Avatar({
    initials: "AB",
    placeholder: "XY",
  }));
  assertStringIncludes(html, "AB");
  assertEquals(html.includes("XY"), false);
});

Deno.test("Avatar - all status and styling props", () => {
  const html = renderToString(Avatar({
    src: "avatar.jpg",
    alt: "User",
    ring: true,
    online: true,
    size: "lg",
    class: "test-class",
    id: "full-avatar",
  }));
  assertStringIncludes(html, "avatar.jpg");
  assertStringIncludes(html, "ring ring-primary");
  assertStringIncludes(html, "online");
  assertStringIncludes(html, "w-16 h-16");
  assertStringIncludes(html, "test-class");
  assertStringIncludes(html, 'id="full-avatar"');
});

Deno.test("Avatar - placeholder with all styles", () => {
  const html = renderToString(Avatar({
    placeholder: "PH",
    ring: true,
    offline: true,
    size: "xl",
    class: "styled-placeholder",
  }));
  assertStringIncludes(html, "PH");
  assertStringIncludes(html, "placeholder");
  assertStringIncludes(html, "ring ring-primary");
  assertStringIncludes(html, "offline");
  assertStringIncludes(html, "w-24 h-24");
  assertStringIncludes(html, "styled-placeholder");
});

Deno.test("Avatar - image size classes applied correctly", () => {
  const html = renderToString(Avatar({
    src: "test.jpg",
    size: "sm",
    ring: true,
  }));
  assertStringIncludes(html, "w-8 h-8");
  assertStringIncludes(html, "ring ring-primary ring-offset-base-100 ring-offset-2");
  assertStringIncludes(html, "rounded-full");
});

// Snapshot tests
Deno.test("Avatar - HTML snapshot with image", async (t) => {
  const html = renderToString(Avatar({
    src: "https://example.com/user.jpg",
    alt: "User Avatar",
    ring: true,
    online: true,
    size: "md",
  }));
  await assertSnapshot(t, html);
});

Deno.test("Avatar - HTML snapshot with placeholder", async (t) => {
  const html = renderToString(Avatar({
    placeholder: "JD",
    offline: true,
    size: "lg",
    class: "custom-avatar",
  }));
  await assertSnapshot(t, html);
});

Deno.test("Avatar - HTML snapshot with initials", async (t) => {
  const html = renderToString(Avatar({
    initials: "AB",
    ring: true,
    size: "xl",
    id: "initials-avatar",
  }));
  await assertSnapshot(t, html);
});

Deno.test("Avatar - HTML snapshot minimal", async (t) => {
  const html = renderToString(Avatar({}));
  await assertSnapshot(t, html);
});

Deno.test("Avatar - HTML snapshot all props", async (t) => {
  const html = renderToString(Avatar({
    src: "profile.jpg",
    alt: "Profile Picture",
    ring: true,
    online: true,
    size: "lg",
    class: "profile-avatar",
    id: "user-profile-avatar",
  }));
  await assertSnapshot(t, html);
});
