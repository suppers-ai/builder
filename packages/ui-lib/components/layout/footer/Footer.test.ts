import { assertEquals, assertStringIncludes } from "https://deno.land/std@0.224.0/assert/mod.ts";
import { renderToString } from "preact-render-to-string";
import { Footer } from "./Footer.tsx";

Deno.test("Footer - basic rendering", () => {
  const html = renderToString(Footer({}));
  assertStringIncludes(html, "footer");
  assertStringIncludes(html, "bg-neutral text-neutral-content");
  assertStringIncludes(html, "p-6 md:p-10");
});

Deno.test("Footer - variant minimal", () => {
  const html = renderToString(Footer({
    variant: "minimal",
    copyright: "© 2024 Company",
  }));
  assertStringIncludes(html, "footer");
  assertStringIncludes(html, "max-w-7xl mx-auto w-full");
  assertStringIncludes(html, "flex flex-col md:flex-row items-center justify-between gap-4");
  assertStringIncludes(html, "© 2024 Company");
});

Deno.test("Footer - variant default", () => {
  const html = renderToString(Footer({
    variant: "default",
    copyright: "© 2024 Company",
  }));
  assertStringIncludes(html, "footer");
  assertStringIncludes(html, "border-t border-base-300 pt-4");
  assertStringIncludes(html, "© 2024 Company");
});

Deno.test("Footer - layout variants", () => {
  const layouts = ["default", "grid", "centered", "compact"];
  const layoutClasses = [
    "footer",
    "footer footer-grid grid-flow-col",
    "footer footer-center",
    "footer footer-compact",
  ];

  layouts.forEach((layout, index) => {
    const html = renderToString(Footer({
      layout: layout as any,
    }));
    assertStringIncludes(html, layoutClasses[index]);
  });
});

Deno.test("Footer - background variants", () => {
  const backgrounds = ["default", "neutral", "primary", "secondary", "accent", "dark"];
  const backgroundClasses = [
    "bg-base-200 text-base-content",
    "bg-neutral text-neutral-content",
    "bg-primary text-primary-content",
    "bg-secondary text-secondary-content",
    "bg-accent text-accent-content",
    "bg-base-300 text-base-content",
  ];

  backgrounds.forEach((background, index) => {
    const html = renderToString(Footer({
      background: background as any,
    }));
    assertStringIncludes(html, backgroundClasses[index]);
  });
});

Deno.test("Footer - size variants", () => {
  const sizes = ["sm", "md", "lg"];
  const sizeClasses = ["p-4", "p-6 md:p-10", "p-8 md:p-16"];

  sizes.forEach((size, index) => {
    const html = renderToString(Footer({
      size: size as any,
    }));
    assertStringIncludes(html, sizeClasses[index]);
  });
});

Deno.test("Footer - with logo string", () => {
  const html = renderToString(Footer({
    logo: "My Company",
  }));
  assertStringIncludes(html, "grid-flow-row");
  assertStringIncludes(html, "text-2xl font-bold");
  assertStringIncludes(html, "My Company");
});

Deno.test("Footer - with sections", () => {
  const html = renderToString(Footer({
    sections: [
      {
        title: "Services",
        links: [
          { text: "Web Design", href: "/web-design" },
          { text: "Development", href: "/development" },
        ],
      },
      {
        title: "Company",
        links: [
          { text: "About", href: "/about" },
          { text: "Contact", href: "/contact" },
        ],
      },
    ],
  }));
  assertStringIncludes(html, "footer-title");
  assertStringIncludes(html, "Services");
  assertStringIncludes(html, "Company");
  assertStringIncludes(html, "Web Design");
  assertStringIncludes(html, "Development");
  assertStringIncludes(html, "About");
  assertStringIncludes(html, "Contact");
  assertStringIncludes(html, 'href="/web-design"');
  assertStringIncludes(html, 'href="/development"');
  assertStringIncludes(html, 'href="/about"');
  assertStringIncludes(html, 'href="/contact"');
});

Deno.test("Footer - with external links", () => {
  const html = renderToString(Footer({
    sections: [
      {
        title: "External",
        links: [
          { text: "Google", href: "https://google.com", external: true },
          { text: "GitHub", href: "https://github.com", external: true },
        ],
      },
    ],
  }));
  assertStringIncludes(html, 'target="_blank"');
  assertStringIncludes(html, 'rel="noopener noreferrer"');
  assertStringIncludes(html, "Google");
  assertStringIncludes(html, "GitHub");
});

Deno.test("Footer - with disabled links", () => {
  const html = renderToString(Footer({
    sections: [
      {
        title: "Links",
        links: [
          { text: "Active", href: "/active" },
          { text: "Disabled", href: "/disabled", disabled: true },
        ],
      },
    ],
  }));
  assertStringIncludes(html, "Active");
  assertStringIncludes(html, "Disabled");
  assertStringIncludes(html, "text-base-content/50 pointer-events-none");
});

Deno.test("Footer - with social links", () => {
  const html = renderToString(Footer({
    socialLinks: [
      { platform: "Twitter", href: "https://twitter.com", icon: "🐦" },
      { platform: "Facebook", href: "https://facebook.com", icon: "📘" },
    ],
  }));
  assertStringIncludes(html, "grid-flow-col gap-4 md:place-self-center md:justify-self-end");
  assertStringIncludes(html, 'href="https://twitter.com"');
  assertStringIncludes(html, 'href="https://facebook.com"');
  assertStringIncludes(html, 'aria-label="Twitter"');
  assertStringIncludes(html, 'aria-label="Facebook"');
  assertStringIncludes(html, "🐦");
  assertStringIncludes(html, "📘");
});

Deno.test("Footer - with newsletter", () => {
  const html = renderToString(Footer({
    newsletter: {
      title: "Stay Updated",
      description: "Get the latest news",
      placeholder: "Enter email",
      buttonText: "Subscribe",
    },
  }));
  assertStringIncludes(html, "Stay Updated");
  assertStringIncludes(html, "Get the latest news");
  assertStringIncludes(html, 'placeholder="Enter email"');
  assertStringIncludes(html, "Subscribe");
  assertStringIncludes(html, "form-control w-80");
  assertStringIncludes(html, "input input-bordered join-item");
  assertStringIncludes(html, "btn btn-primary join-item");
});

Deno.test("Footer - newsletter with defaults", () => {
  const html = renderToString(Footer({
    newsletter: {},
  }));
  assertStringIncludes(html, "Newsletter");
  assertStringIncludes(html, 'placeholder="Enter your email"');
  assertStringIncludes(html, "Subscribe");
});

Deno.test("Footer - with copyright", () => {
  const html = renderToString(Footer({
    copyright: "© 2024 My Company. All rights reserved.",
  }));
  assertStringIncludes(html, "© 2024 My Company. All rights reserved.");
  assertStringIncludes(html, "text-sm text-base-content/70");
});

Deno.test("Footer - divider enabled", () => {
  const html = renderToString(Footer({
    divider: true,
    copyright: "© 2024 Company",
  }));
  assertStringIncludes(html, "border-t border-base-300 pt-4");
  assertStringIncludes(html, "© 2024 Company");
});

Deno.test("Footer - divider disabled", () => {
  const html = renderToString(Footer({
    divider: false,
    copyright: "© 2024 Company",
  }));
  assertEquals(html.includes("border-t border-base-300 pt-4"), false);
});

Deno.test("Footer - custom className", () => {
  const html = renderToString(Footer({
    className: "custom-footer",
  }));
  assertStringIncludes(html, "custom-footer");
});

Deno.test("Footer - all props combined", () => {
  const html = renderToString(Footer({
    variant: "default",
    layout: "grid",
    background: "primary",
    size: "lg",
    logo: "Company Logo",
    sections: [
      {
        title: "Services",
        links: [
          { text: "Service 1", href: "/service1" },
        ],
      },
    ],
    socialLinks: [
      { platform: "Twitter", href: "https://twitter.com", icon: "🐦" },
    ],
    newsletter: {
      title: "Newsletter",
      description: "Subscribe for updates",
    },
    copyright: "© 2024 Company",
    divider: true,
    className: "test-class",
  }));
  assertStringIncludes(html, "footer footer-grid grid-flow-col");
  assertStringIncludes(html, "bg-primary text-primary-content");
  assertStringIncludes(html, "p-8 md:p-16");
  assertStringIncludes(html, "Company Logo");
  assertStringIncludes(html, "Services");
  assertStringIncludes(html, "Service 1");
  assertStringIncludes(html, "Newsletter");
  assertStringIncludes(html, "Subscribe for updates");
  assertStringIncludes(html, "🐦");
  assertStringIncludes(html, "© 2024 Company");
  assertStringIncludes(html, "border-t border-base-300 pt-4");
  assertStringIncludes(html, "test-class");
});

Deno.test("Footer - minimal with logo and social", () => {
  const html = renderToString(Footer({
    variant: "minimal",
    logo: "Brand",
    copyright: "© 2024 Brand",
    socialLinks: [
      { platform: "Twitter", href: "https://twitter.com", icon: "🐦" },
    ],
  }));
  assertStringIncludes(html, "text-xl font-bold");
  assertStringIncludes(html, "Brand");
  assertStringIncludes(html, "© 2024 Brand");
  assertStringIncludes(html, "🐦");
  assertStringIncludes(html, "flex gap-4");
});

Deno.test("Footer - with id", () => {
  const html = renderToString(Footer({
    id: "main-footer",
    copyright: "© 2024 Company",
  }));
  assertStringIncludes(html, 'id="main-footer"');
  assertStringIncludes(html, "© 2024 Company");
});

Deno.test("Footer - empty sections", () => {
  const html = renderToString(Footer({
    sections: [],
  }));
  assertStringIncludes(html, "footer");
  assertEquals(html.includes("footer-title"), false);
});

Deno.test("Footer - empty social links", () => {
  const html = renderToString(Footer({
    socialLinks: [],
  }));
  assertStringIncludes(html, "footer");
  assertEquals(html.includes("grid-flow-col gap-4"), false);
});

Deno.test("Footer - default values", () => {
  const html = renderToString(Footer({}));
  // Check defaults: variant=default, layout=default, background=neutral, size=md, divider=true
  assertStringIncludes(html, "footer");
  assertStringIncludes(html, "bg-neutral text-neutral-content");
  assertStringIncludes(html, "p-6 md:p-10");
  assertEquals(html.includes("max-w-7xl mx-auto"), false); // Not minimal variant
});
