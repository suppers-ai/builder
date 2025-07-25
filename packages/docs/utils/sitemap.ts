// Sitemap generation utilities
import { flatComponentsMetadata } from "@suppers/ui-lib";

interface SitemapUrl {
  loc: string;
  lastmod?: string;
  changefreq?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority?: string;
}

/**
 * Generate sitemap XML for the component library
 */
export function generateSitemap(baseUrl: string = "https://your-domain.com"): string {
  const urls: SitemapUrl[] = [
    // Main pages
    {
      loc: baseUrl,
      lastmod: new Date().toISOString().split("T")[0],
      changefreq: "weekly",
      priority: "1.0",
    },
    {
      loc: `${baseUrl}/components`,
      lastmod: new Date().toISOString().split("T")[0],
      changefreq: "weekly",
      priority: "0.9",
    },

    // Component pages
    ...flatComponentsMetadata.map((component) => ({
      loc: `${baseUrl}${component.path}`,
      lastmod: new Date().toISOString().split("T")[0],
      changefreq: "monthly" as const,
      priority: "0.8",
    })),

    // Category pages
    {
      loc: `${baseUrl}/components/action`,
      lastmod: new Date().toISOString().split("T")[0],
      changefreq: "monthly",
      priority: "0.7",
    },
    {
      loc: `${baseUrl}/components/display`,
      lastmod: new Date().toISOString().split("T")[0],
      changefreq: "monthly",
      priority: "0.7",
    },
    {
      loc: `${baseUrl}/components/navigation`,
      lastmod: new Date().toISOString().split("T")[0],
      changefreq: "monthly",
      priority: "0.7",
    },
    {
      loc: `${baseUrl}/components/input`,
      lastmod: new Date().toISOString().split("T")[0],
      changefreq: "monthly",
      priority: "0.7",
    },
    {
      loc: `${baseUrl}/components/layout`,
      lastmod: new Date().toISOString().split("T")[0],
      changefreq: "monthly",
      priority: "0.7",
    },
    {
      loc: `${baseUrl}/components/feedback`,
      lastmod: new Date().toISOString().split("T")[0],
      changefreq: "monthly",
      priority: "0.7",
    },
    {
      loc: `${baseUrl}/components/mockup`,
      lastmod: new Date().toISOString().split("T")[0],
      changefreq: "monthly",
      priority: "0.7",
    },
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${
    urls.map((url) =>
      `  <url>
    <loc>${url.loc}</loc>
    ${url.lastmod ? `<lastmod>${url.lastmod}</lastmod>` : ""}
    ${url.changefreq ? `<changefreq>${url.changefreq}</changefreq>` : ""}
    ${url.priority ? `<priority>${url.priority}</priority>` : ""}
  </url>`
    ).join("\n")
  }
</urlset>`;

  return xml;
}

/**
 * Generate robots.txt content
 */
export function generateRobotsTxt(baseUrl: string = "https://your-domain.com"): string {
  return `User-agent: *
Allow: /

# Sitemap
Sitemap: ${baseUrl}/sitemap.xml

# Crawl delay (optional)
Crawl-delay: 1

# Disallow sensitive paths (if any)
# Disallow: /admin/
# Disallow: /private/

# Allow all CSS and JS files
Allow: /*.css$
Allow: /*.js$
Allow: /*.png$
Allow: /*.jpg$
Allow: /*.gif$
Allow: /*.svg$`;
}

/**
 * Generate structured data (JSON-LD) for the homepage
 */
export function generateStructuredData(baseUrl: string = "https://your-domain.com"): string {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "Suppers Component Library",
    "description":
      "Professional Suppers component library built for Fresh 2.0 with 65+ production-ready components",
    "url": baseUrl,
    "applicationCategory": "DeveloperApplication",
    "operatingSystem": "Web Browser",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD",
    },
    "creator": {
      "@type": "Organization",
      "name": "Suppers Component Library Team",
    },
    "softwareVersion": "1.0.0",
    "programmingLanguage": ["TypeScript", "JavaScript"],
    "runtimePlatform": ["Fresh", "Deno"],
    "keywords": [
      "daisyUI",
      "Fresh",
      "Components",
      "TypeScript",
      "Preact",
      "Tailwind CSS",
      "UI Library",
      "Web Components",
      "Responsive Design",
    ],
    "screenshot": `${baseUrl}/screenshot.png`,
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "5.0",
      "ratingCount": "1",
    },
  };

  return JSON.stringify(structuredData, null, 2);
}

/**
 * Generate OpenGraph meta tags for component pages
 */
export function generateComponentOpenGraph(
  componentName: string,
  description: string,
  baseUrl: string = "https://your-domain.com",
) {
  return {
    title: `${componentName} - Suppers Component Library`,
    description: description,
    url: `${baseUrl}/components/${componentName.toLowerCase()}`,
    image: `${baseUrl}/components/${componentName.toLowerCase()}/preview.png`,
    type: "article",
    siteName: "Suppers Component Library",
  };
}

/**
 * Generate meta description for component pages
 */
export function generateComponentMetaDescription(
  componentName: string,
  description: string,
): string {
  return `${componentName} component for DaisyUI and Fresh 2.0. ${description} Includes examples, API documentation, and accessibility guidelines.`;
}

/**
 * Generate breadcrumb structured data
 */
export function generateBreadcrumbStructuredData(
  breadcrumbs: Array<{ name: string; path?: string }>,
  baseUrl: string = "https://your-domain.com",
): string {
  const breadcrumbList = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": breadcrumbs.map((crumb, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": crumb.name,
      ...(crumb.path && {
        "item": `${baseUrl}${crumb.path}`,
      }),
    })),
  };

  return JSON.stringify(breadcrumbList, null, 2);
}

/**
 * Generate component collection structured data
 */
export function generateComponentCollectionStructuredData(
  baseUrl: string = "https://your-domain.com",
): string {
  const collection = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": "Suppers Component Library",
    "description": "Complete collection of DaisyUI components built for Fresh 2.0",
    "url": `${baseUrl}/components`,
    "mainEntity": {
      "@type": "ItemList",
      "numberOfItems": flatComponentsMetadata.length,
      "itemListElement": flatComponentsMetadata.map((component, index) => ({
        "@type": "SoftwareSourceCode",
        "position": index + 1,
        "name": component.name,
        "description": component.description,
        "url": `${baseUrl}${component.path}`,
        "programmingLanguage": "TypeScript",
        "runtimePlatform": "Fresh",
        "applicationCategory": component.category,
      })),
    },
  };

  return JSON.stringify(collection, null, 2);
}
