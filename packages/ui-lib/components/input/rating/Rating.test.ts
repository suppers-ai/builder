import { assertEquals, assertStringIncludes } from "jsr:@std/assert";
import { DOMParser } from "https://deno.land/x/deno_dom@v0.1.46/deno-dom-wasm.ts";
import { renderToString } from "preact-render-to-string";
import { Rating } from "./Rating.tsx";

// Mock DOMParser for testing
const parser = new DOMParser();

Deno.test("Rating - basic rendering", () => {
  const html = renderToString(Rating({}));

  assertStringIncludes(html, 'class="rating"');
  assertStringIncludes(html, 'type="radio"');
  assertStringIncludes(html, "mask-star");
});

Deno.test("Rating - with custom class", () => {
  const html = renderToString(Rating({
    class: "custom-rating",
  }));
  assertStringIncludes(html, 'class="rating custom-rating"');
});

Deno.test("Rating - size variants", () => {
  const sizes = ["xs", "sm", "md", "lg"];

  sizes.forEach((size) => {
    const html = renderToString(Rating({
      size: size as 'xs' | 'sm' | 'md' | 'lg' | 'xl',
    }));

    if (size === "md") {
      // Medium is default, no extra class
      assertStringIncludes(html, 'class="rating"');
    } else {
      assertStringIncludes(html, `rating-${size}`);
    }
  });
});

Deno.test("Rating - with value", () => {
  const html = renderToString(Rating({
    value: 3,
  }));

  const document = parser.parseFromString(html, "text/html");
  const checkedInputs = document?.querySelectorAll("input[checked]");
  assertEquals(checkedInputs?.length, 1);
});

Deno.test("Rating - with max stars", () => {
  const html = renderToString(Rating({
    max: 3,
  }));

  const document = parser.parseFromString(html, "text/html");
  const inputs = document?.querySelectorAll('input[type="radio"]');
  // 3 stars + 1 hidden input for 0 rating = 4 total
  assertEquals(inputs?.length, 4);
});

Deno.test("Rating - with half stars", () => {
  const html = renderToString(Rating({
    half: true,
    max: 2,
  }));

  assertStringIncludes(html, "rating-half");
  const document = parser.parseFromString(html, "text/html");
  const inputs = document?.querySelectorAll('input[type="radio"]');
  // 2 full stars + 2 half stars + 1 hidden input = 5 total
  assertEquals(inputs?.length, 5);
});

Deno.test("Rating - mask variants", () => {
  const masks = ["star", "star-2", "heart"];

  masks.forEach((mask) => {
    const html = renderToString(Rating({
      mask: mask as any,
    }));

    if (mask === "star") {
      assertStringIncludes(html, "mask-star");
    } else if (mask === "star-2") {
      assertStringIncludes(html, "mask-star-2");
    } else if (mask === "heart") {
      assertStringIncludes(html, "mask-heart");
    }
  });
});

Deno.test("Rating - readonly state", () => {
  const html = renderToString(Rating({
    readonly: true,
  }));

  const document = parser.parseFromString(html, "text/html");
  const inputs = document?.querySelectorAll('input[type="radio"]');
  inputs?.forEach((input) => {
    assertEquals(input.hasAttribute("readonly"), true);
  });
});

Deno.test("Rating - not readonly (default)", () => {
  const html = renderToString(Rating({}));

  const document = parser.parseFromString(html, "text/html");
  const inputs = document?.querySelectorAll('input[type="radio"]');
  inputs?.forEach((input) => {
    assertEquals(input.hasAttribute("readonly"), false);
  });
});

Deno.test("Rating - with id", () => {
  const html = renderToString(Rating({
    id: "test-rating",
  }));

  assertStringIncludes(html, 'id="test-rating"');
  assertStringIncludes(html, 'name="rating-test-rating"');
});

Deno.test("Rating - controlled mode with hoverValue", () => {
  const html = renderToString(Rating({
    value: 2,
    hoverValue: 4,
    onChange: () => {},
    onHover: () => {},
  }));

  // Should use hoverValue when provided
  const document = parser.parseFromString(html, "text/html");
  const checkedInputs = document?.querySelectorAll("input[checked]");
  assertEquals(checkedInputs?.length, 1);
});

Deno.test("Rating - hidden input for zero rating", () => {
  const html = renderToString(Rating({
    value: 0,
    max: 3,
  }));

  assertStringIncludes(html, "rating-hidden");
  const document = parser.parseFromString(html, "text/html");
  const hiddenInput = document?.querySelector(".rating-hidden");
  assertEquals(hiddenInput?.hasAttribute("checked"), true);
});

Deno.test("Rating - radio group naming", () => {
  const html1 = renderToString(Rating({
    id: "rating1",
  }));
  const html2 = renderToString(Rating({
    id: "rating2",
  }));

  assertStringIncludes(html1, 'name="rating-rating1"');
  assertStringIncludes(html2, 'name="rating-rating2"');
});

Deno.test("Rating - default values", () => {
  const html = renderToString(Rating({}));

  // Default values: size=md, value=0, max=5, readonly=false, half=false, mask=star
  const document = parser.parseFromString(html, "text/html");
  const inputs = document?.querySelectorAll('input[type="radio"]');
  assertEquals(inputs?.length, 6); // 5 stars + 1 hidden input

  assertStringIncludes(html, "mask-star");
  const hiddenInput = document?.querySelector(".rating-hidden");
  assertEquals(hiddenInput?.hasAttribute("checked"), true); // value=0
});

Deno.test("Rating - all props combined", () => {
  const html = renderToString(Rating({
    class: "custom-rating",
    size: "lg",
    value: 2.5,
    max: 4,
    readonly: false,
    half: true,
    mask: "heart",
    hoverValue: 3,
    onChange: () => {},
    onHover: () => {},
    onMouseLeave: () => {},
    id: "full-rating",
  }));

  assertStringIncludes(html, 'class="rating rating-lg rating-half custom-rating"');
  assertStringIncludes(html, 'id="full-rating"');
  assertStringIncludes(html, 'name="rating-full-rating"');
  assertStringIncludes(html, "mask-heart");

  const document = parser.parseFromString(html, "text/html");
  const inputs = document?.querySelectorAll('input[type="radio"]');
  // 4 full stars + 4 half stars + 1 hidden = 9 total
  assertEquals(inputs?.length, 9);
});

Deno.test("Rating - star generation logic", () => {
  const html = renderToString(Rating({
    max: 2,
    half: false,
  }));

  const document = parser.parseFromString(html, "text/html");
  const inputs = document?.querySelectorAll('input[type="radio"]');
  // 2 stars + 1 hidden input = 3 total
  assertEquals(inputs?.length, 3);

  const hiddenInput = document?.querySelector(".rating-hidden");
  assertEquals(hiddenInput !== null, true);
});
