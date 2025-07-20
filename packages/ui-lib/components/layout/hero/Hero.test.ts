import { assertEquals, assertStringIncludes } from "jsr:@std/assert";
import { DOMParser } from "https://deno.land/x/deno_dom@v0.1.46/deno-dom-wasm.ts";
import { renderToString } from "preact-render-to-string";
import { Hero } from "./Hero.tsx";
import { h } from "preact";

// Mock DOMParser for testing
const parser = new DOMParser();

Deno.test("Hero - basic rendering with title", () => {
  const html = renderToString(Hero({
    title: "Welcome to Our Platform",
  }));

  assertStringIncludes(html, 'class="hero min-h-[75vh] py-24 bg-base-200"');
  assertStringIncludes(html, "<h1");
  assertStringIncludes(html, "Welcome to Our Platform");
});

Deno.test("Hero - with subtitle", () => {
  const html = renderToString(Hero({
    title: "Main Title",
    subtitle: "This is a subtitle description",
  }));

  assertStringIncludes(html, "Main Title");
  assertStringIncludes(html, "<p");
  assertStringIncludes(html, "This is a subtitle description");
});

Deno.test("Hero - without subtitle", () => {
  const html = renderToString(Hero({
    title: "Title Only",
  }));

  const document = parser.parseFromString(html, "text/html");
  const subtitle = document?.querySelector("p");
  assertEquals(subtitle, null);
});

Deno.test("Hero - size variants", () => {
  const sizes = ["sm", "md", "lg", "full"];

  sizes.forEach((size) => {
    const html = renderToString(Hero({
      title: "Test Title",
      size: size as any,
    }));

    const expectedClasses = {
      sm: "min-h-[50vh] py-16",
      md: "min-h-[60vh] py-20",
      lg: "min-h-[75vh] py-24",
      full: "min-h-screen py-32",
    };

    assertStringIncludes(html, expectedClasses[size]);
  });
});

Deno.test("Hero - background variants", () => {
  const backgrounds = ["default", "gradient", "image", "video"];

  backgrounds.forEach((background) => {
    const html = renderToString(Hero({
      title: "Test Title",
      background: background as any,
    }));

    if (background === "default") {
      assertStringIncludes(html, "bg-base-200");
    } else if (background === "gradient") {
      assertStringIncludes(html, "bg-gradient-to-br from-primary to-secondary");
    } else if (background === "image") {
      assertStringIncludes(html, "bg-base-200"); // Default when no backgroundImage
    } else if (background === "video") {
      assertStringIncludes(html, "relative overflow-hidden");
    }
  });
});

Deno.test("Hero - with background image", () => {
  const html = renderToString(Hero({
    title: "Test Title",
    background: "image",
    backgroundImage: "https://example.com/hero.jpg",
  }));

  assertStringIncludes(html, "bg-cover bg-center bg-no-repeat");
  assertStringIncludes(html, "url(https://example.com/hero.jpg)");
});

Deno.test("Hero - with background video", () => {
  const html = renderToString(Hero({
    title: "Test Title",
    background: "video",
    backgroundVideo: "https://example.com/hero.mp4",
  }));

  assertStringIncludes(html, "<video");
  assertStringIncludes(html, "autoplay"); // HTML attributes are lowercase
  assertStringIncludes(html, "muted");
  assertStringIncludes(html, "loop");
  assertStringIncludes(html, "playsinline"); // HTML attributes are lowercase
  assertStringIncludes(html, 'src="https://example.com/hero.mp4"');
});

Deno.test("Hero - variant layouts", () => {
  const variants = ["default", "centered", "split", "overlay", "minimal"];

  variants.forEach((variant) => {
    const html = renderToString(Hero({
      title: "Test Title",
      variant: variant as any,
    }));

    if (variant === "centered") {
      assertStringIncludes(html, "flex flex-col items-center justify-center text-center");
    } else if (variant === "split") {
      assertStringIncludes(html, "flex flex-col lg:flex-row items-center justify-between gap-12");
    } else if (variant === "overlay") {
      assertStringIncludes(html, "relative flex flex-col items-center justify-center text-center");
    } else if (variant === "minimal") {
      assertStringIncludes(html, "py-16");
    }
  });
});

Deno.test("Hero - with primary CTA", () => {
  const html = renderToString(Hero({
    title: "Test Title",
    primaryCTA: {
      text: "Get Started",
      href: "/signup",
    },
  }));

  assertStringIncludes(html, "<a");
  assertStringIncludes(html, 'href="/signup"');
  assertStringIncludes(html, "btn btn-primary btn-lg");
  assertStringIncludes(html, "Get Started");
});

Deno.test("Hero - with secondary CTA", () => {
  const html = renderToString(Hero({
    title: "Test Title",
    secondaryCTA: {
      text: "Learn More",
      href: "/about",
    },
  }));

  assertStringIncludes(html, "btn btn-outline btn-lg");
  assertStringIncludes(html, "Learn More");
  assertStringIncludes(html, 'href="/about"');
});

Deno.test("Hero - with both CTAs", () => {
  const html = renderToString(Hero({
    title: "Test Title",
    primaryCTA: {
      text: "Primary Action",
      href: "/primary",
    },
    secondaryCTA: {
      text: "Secondary Action",
      href: "/secondary",
    },
  }));

  assertStringIncludes(html, "Primary Action");
  assertStringIncludes(html, "Secondary Action");
  assertStringIncludes(html, "btn btn-primary btn-lg");
  assertStringIncludes(html, "btn btn-outline btn-lg");
});

Deno.test("Hero - without CTAs", () => {
  const html = renderToString(Hero({
    title: "Test Title",
  }));

  const document = parser.parseFromString(html, "text/html");
  const buttons = document?.querySelectorAll(".btn");
  assertEquals(buttons?.length, 0);
});

Deno.test("Hero - with visual content", () => {
  const content = h("img", {
    src: "/hero-image.png",
    alt: "Hero Image",
    class: "w-full h-auto",
  });

  const html = renderToString(Hero({
    title: "Test Title",
    content: content,
  }));

  assertStringIncludes(html, "<img");
  assertStringIncludes(html, 'src="/hero-image.png"');
  assertStringIncludes(html, 'alt="Hero Image"');
});

Deno.test("Hero - split layout with content position", () => {
  const content = h("div", { class: "mockup-phone" }, "Phone Mockup");

  const htmlLeft = renderToString(Hero({
    title: "Test Title",
    variant: "split",
    contentPosition: "left",
    content: content,
  }));

  const htmlRight = renderToString(Hero({
    title: "Test Title",
    variant: "split",
    contentPosition: "right",
    content: content,
  }));

  assertStringIncludes(htmlLeft, "Phone Mockup");
  assertStringIncludes(htmlRight, "Phone Mockup");
});

Deno.test("Hero - overlay variant with background", () => {
  const html = renderToString(Hero({
    title: "Test Title",
    variant: "overlay",
    background: "image",
    backgroundImage: "/bg.jpg",
  }));

  assertStringIncludes(html, "bg-black/30"); // Overlay
  assertStringIncludes(html, "url(/bg.jpg)");
});

Deno.test("Hero - alignment options", () => {
  const alignments = ["left", "center", "right"];

  alignments.forEach((align) => {
    const html = renderToString(Hero({
      title: "Test Title",
      align: align as any,
    }));

    assertStringIncludes(html, `text-${align}`);
    assertStringIncludes(
      html,
      `items-${align === "left" ? "start" : align === "right" ? "end" : "center"}`,
    );
  });
});

Deno.test("Hero - with custom className", () => {
  const html = renderToString(Hero({
    title: "Test Title",
    className: "custom-hero-class",
  }));

  assertStringIncludes(html, "custom-hero-class");
});

Deno.test("Hero - default values", () => {
  const html = renderToString(Hero({
    title: "Default Hero",
  }));

  // Default: variant="default", background="default", size="lg", align="center"
  assertStringIncludes(html, "min-h-[75vh] py-24"); // lg size
  assertStringIncludes(html, "bg-base-200"); // default background
  assertStringIncludes(html, "text-center"); // center align
});

Deno.test("Hero - all props combined", () => {
  const content = h("div", { class: "hero-image" }, "Visual Content");

  const html = renderToString(Hero({
    title: "Complete Hero Example",
    subtitle: "This hero has all features enabled",
    primaryCTA: {
      text: "Start Now",
      href: "/start",
    },
    secondaryCTA: {
      text: "Learn More",
      href: "/learn",
    },
    content: content,
    variant: "split",
    background: "gradient",
    size: "full",
    align: "left",
    contentPosition: "right",
    className: "custom-hero",
  }));

  assertStringIncludes(html, "Complete Hero Example");
  assertStringIncludes(html, "This hero has all features enabled");
  assertStringIncludes(html, "Start Now");
  assertStringIncludes(html, "Learn More");
  assertStringIncludes(html, "Visual Content");
  assertStringIncludes(html, "bg-gradient-to-br from-primary to-secondary");
  assertStringIncludes(html, "min-h-screen py-32");
  assertStringIncludes(html, "custom-hero");
});
