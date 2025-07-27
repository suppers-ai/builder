import { ComponentMetadata, ComponentExample, ComponentCategory } from "../../types.ts";
import { Footer } from "./Footer.tsx";

const footerExamples: ComponentExample[] = [
  {
    title: "Basic Footer",
    description: "Simple footer with copyright and links",
    code: `<Footer
  title="My Company"
  description="Building amazing products since 2024"
  copyright="© 2024 My Company. All rights reserved."
/>`,
    props: {
      title: "My Company",
      description: "Building amazing products since 2024",
      copyright: "© 2024 My Company. All rights reserved."
    },
    showCode: true,
  },
  {
    title: "Footer with Logo",
    description: "Footer including company logo and branding",
    code: `<Footer
  title="MyBrand"
  description="Innovation at your fingertips"
  logo="/logo.svg"
  sections={[
    {
      title: "Company",
      links: [
        { text: "About", href: "/about" },
        { text: "Careers", href: "/careers" },
        { text: "Contact", href: "/contact" }
      ]
    }
  ]}
/>`,
    showCode: true,
  },
  {
    title: "Newsletter Footer",
    description: "Footer with newsletter signup functionality",
    code: `<Footer
  title="Stay Connected"
  description="Subscribe to our newsletter for updates"
  showNewsletter
  sections={[
    {
      title: "Quick Links",
      links: [
        { text: "Home", href: "/" },
        { text: "Services", href: "/services" },
        { text: "Blog", href: "/blog" }
      ]
    },
    {
      title: "Contact",
      links: [
        { text: "support@company.com", href: "mailto:support@company.com" },
        { text: "123 Business St.", href: "#" }
      ]
    }
  ]}
/>`,
    showCode: true,
  },
  {
    title: "Social Media Footer",
    description: "Footer with social media links and icons",
    code: `<Footer
  title="Follow Us"
  description="Stay updated with our latest news"
  social={{
    twitter: "https://twitter.com/company",
    facebook: "https://facebook.com/company",
    linkedin: "https://linkedin.com/company/company"
  }}
  sections={[
    {
      title: "Products",
      links: [
        { text: "Web App", href: "/web" },
        { text: "Mobile App", href: "/mobile" },
        { text: "API", href: "/api" }
      ]
    }
  ]}
/>`,
    showCode: true,
  },
  {
    title: "Centered Footer",
    description: "Simple centered footer layout",
    code: `<Footer
  title="Company Name"
  description="Built with ❤️ by our team"
  centered
  sections={[
    {
      title: "Legal",
      links: [
        { text: "Privacy Policy", href: "/privacy" },
        { text: "Terms of Service", href: "/terms" },
        { text: "Cookie Policy", href: "/cookies" }
      ]
    }
  ]}
/>`,
    showCode: true,
  },
  {
    title: "Grid Layout Footer",
    description: "Comprehensive footer with multiple sections",
    code: `<Footer
  title="Company"
  description="Building amazing products that make a difference"
  sections={[
    {
      title: "Products",
      links: [
        { text: "Web App", href: "/web" },
        { text: "Mobile App", href: "/mobile" },
        { text: "Desktop App", href: "/desktop" },
        { text: "API", href: "/api" }
      ]
    },
    {
      title: "Support", 
      links: [
        { text: "Help Center", href: "/help" },
        { text: "Documentation", href: "/docs" },
        { text: "Contact Us", href: "/contact" },
        { text: "Status", href: "/status" }
      ]
    },
    {
      title: "Company",
      links: [
        { text: "About", href: "/about" },
        { text: "Blog", href: "/blog" },
        { text: "Careers", href: "/careers" },
        { text: "Press", href: "/press" }
      ]
    }
  ]}
  social={{
    twitter: "#",
    facebook: "#", 
    linkedin: "#"
  }}
/>`,
    showCode: true,
  },
];

export const footerMetadata: ComponentMetadata = {
  name: "Footer",
  description: "Page footer section",
  category: ComponentCategory.LAYOUT,
  path: "/components/layout/footer",
  tags: ["footer", "bottom", "page", "links", "info", "section"],
  examples: footerExamples,
  relatedComponents: ["navbar", "hero", "divider"],
  preview: (
    <div class="w-full max-w-sm">
      <Footer
        title="My Company"
        description="Building amazing things"
        sections={[
          {
            title: "Product",
            links: [
              { text: "Features", href: "/features" },
              { text: "Pricing", href: "/pricing" },
            ],
          },
        ]}
      />
    </div>
  ),
};
