// Social Media Preview Card Generator

interface SocialCardData {
  title: string;
  description: string;
  image?: string;
  url: string;
  type: "website" | "article" | "product";
  author?: string;
  siteName: string;
  theme: "light" | "dark";
}

interface PlatformSpecs {
  name: string;
  imageSize: { width: number; height: number };
  titleLimit: number;
  descriptionLimit: number;
  aspectRatio: string;
}

export class SocialMediaCardGenerator {
  private platforms: PlatformSpecs[] = [
    {
      name: "Twitter/X",
      imageSize: { width: 1200, height: 630 },
      titleLimit: 70,
      descriptionLimit: 200,
      aspectRatio: "1.91:1",
    },
    {
      name: "Facebook",
      imageSize: { width: 1200, height: 630 },
      titleLimit: 100,
      descriptionLimit: 300,
      aspectRatio: "1.91:1",
    },
    {
      name: "LinkedIn",
      imageSize: { width: 1200, height: 627 },
      titleLimit: 150,
      descriptionLimit: 300,
      aspectRatio: "1.91:1",
    },
    {
      name: "Discord",
      imageSize: { width: 1200, height: 630 },
      titleLimit: 100,
      descriptionLimit: 200,
      aspectRatio: "1.91:1",
    },
    {
      name: "GitHub",
      imageSize: { width: 1280, height: 640 },
      titleLimit: 120,
      descriptionLimit: 250,
      aspectRatio: "2:1",
    },
  ];

  // Generate Open Graph meta tags
  generateOpenGraphTags(data: SocialCardData): string {
    return `<!-- Open Graph meta tags -->
<meta property="og:title" content="${this.truncateText(data.title, 100)}" />
<meta property="og:description" content="${this.truncateText(data.description, 300)}" />
<meta property="og:type" content="${data.type}" />
<meta property="og:url" content="${data.url}" />
<meta property="og:site_name" content="${data.siteName}" />
${data.image ? `<meta property="og:image" content="${data.image}" />` : ""}
${data.image ? `<meta property="og:image:width" content="1200" />` : ""}
${data.image ? `<meta property="og:image:height" content="630" />` : ""}
<meta property="og:image:alt" content="${data.title} - ${data.siteName}" />

<!-- Twitter Card meta tags -->
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="${this.truncateText(data.title, 70)}" />
<meta name="twitter:description" content="${this.truncateText(data.description, 200)}" />
${data.image ? `<meta name="twitter:image" content="${data.image}" />` : ""}
${data.author ? `<meta name="twitter:creator" content="${data.author}" />` : ""}

<!-- LinkedIn meta tags -->
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="627" />

<!-- Additional SEO meta tags -->
<meta name="description" content="${this.truncateText(data.description, 160)}" />
<meta name="robots" content="index, follow" />
<link rel="canonical" href="${data.url}" />`;
  }

  // Generate Twitter Card meta tags
  generateTwitterCardTags(data: SocialCardData): string {
    return `<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:site" content="@yourtwitterhandle">
<meta name="twitter:creator" content="${data.author || "@yourtwitterhandle"}">
<meta name="twitter:title" content="${this.truncateText(data.title, 70)}">
<meta name="twitter:description" content="${this.truncateText(data.description, 200)}">
${data.image ? `<meta name="twitter:image" content="${data.image}">` : ""}
<meta name="twitter:image:alt" content="${data.title} preview">`;
  }

  // Generate structured data (JSON-LD)
  generateStructuredData(data: SocialCardData): string {
    const structuredData = {
      "@context": "https://schema.org",
      "@type": data.type === "article" ? "Article" : "WebPage",
      "headline": data.title,
      "description": data.description,
      "url": data.url,
      "publisher": {
        "@type": "Organization",
        "name": data.siteName,
        "logo": {
          "@type": "ImageObject",
          "url": `${new URL(data.url).origin}/logo.png`,
        },
      },
      ...(data.image && {
        "image": {
          "@type": "ImageObject",
          "url": data.image,
          "width": 1200,
          "height": 630,
        },
      }),
      ...(data.author && {
        "author": {
          "@type": "Person",
          "name": data.author,
        },
      }),
      "datePublished": new Date().toISOString(),
      "dateModified": new Date().toISOString(),
    };

    return `<script type="application/ld+json">
${JSON.stringify(structuredData, null, 2)}
</script>`;
  }

  // Generate SVG preview card
  generateSVGCard(data: SocialCardData, platform: string = "Twitter/X"): string {
    const spec = this.platforms.find((p) => p.name === platform) || this.platforms[0];
    const { width, height } = spec.imageSize;

    const isDark = data.theme === "dark";
    const bgColor = isDark ? "#1f2937" : "#ffffff";
    const textColor = isDark ? "#ffffff" : "#1f2937";
    const accentColor = isDark ? "#3b82f6" : "#2563eb";
    const secondaryColor = isDark ? "#9ca3af" : "#6b7280";

    return `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
  <!-- Background -->
  <rect width="100%" height="100%" fill="${bgColor}"/>
  
  <!-- Background Pattern -->
  <defs>
    <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
      <path d="M 60 0 L 0 0 0 60" fill="none" stroke="${
      isDark ? "#374151" : "#f3f4f6"
    }" stroke-width="1" opacity="0.5"/>
    </pattern>
    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${accentColor};stop-opacity:0.1" />
      <stop offset="100%" style="stop-color:${accentColor};stop-opacity:0.3" />
    </linearGradient>
  </defs>
  
  <rect width="100%" height="100%" fill="url(#grid)"/>
  <rect width="100%" height="100%" fill="url(#gradient)"/>
  
  <!-- Brand Area -->
  <g transform="translate(80, 80)">
    <!-- Logo/Icon -->
    <circle cx="40" cy="40" r="30" fill="${accentColor}" opacity="0.2"/>
    <circle cx="40" cy="40" r="20" fill="${accentColor}"/>
    <text x="40" y="48" text-anchor="middle" fill="white" font-family="system-ui" font-size="16" font-weight="bold">UI</text>
    
    <!-- Site Name -->
    <text x="90" y="35" fill="${textColor}" font-family="system-ui" font-size="20" font-weight="600">
      ${data.siteName}
    </text>
    <text x="90" y="55" fill="${secondaryColor}" font-family="system-ui" font-size="14">
      DaisyUI Component Library
    </text>
  </g>
  
  <!-- Main Content -->
  <g transform="translate(80, 200)">
    <!-- Title -->
    <text x="0" y="0" fill="${textColor}" font-family="system-ui" font-size="48" font-weight="bold">
      <tspan x="0" dy="0">${this.wrapText(data.title, 25)[0] || ""}</tspan>
      ${
      this.wrapText(data.title, 25)[1]
        ? `<tspan x="0" dy="60">${this.wrapText(data.title, 25)[1]}</tspan>`
        : ""
    }
    </text>
    
    <!-- Description -->
    <text x="0" y="140" fill="${secondaryColor}" font-family="system-ui" font-size="24" font-weight="400">
      <tspan x="0" dy="0">${this.wrapText(data.description, 50)[0] || ""}</tspan>
      ${
      this.wrapText(data.description, 50)[1]
        ? `<tspan x="0" dy="35">${this.wrapText(data.description, 50)[1]}</tspan>`
        : ""
    }
      ${
      this.wrapText(data.description, 50)[2]
        ? `<tspan x="0" dy="35">${this.wrapText(data.description, 50)[2]}</tspan>`
        : ""
    }
    </text>
  </g>
  
  <!-- Component Preview -->
  <g transform="translate(${width - 400}, 150)">
    <rect x="0" y="0" width="300" height="200" rx="12" fill="${
      isDark ? "#374151" : "#f9fafb"
    }" stroke="${isDark ? "#4b5563" : "#e5e7eb"}" stroke-width="2"/>
    
    <!-- Mock Button Components -->
    <rect x="20" y="30" width="80" height="35" rx="6" fill="${accentColor}"/>
    <text x="60" y="50" text-anchor="middle" fill="white" font-family="system-ui" font-size="12" font-weight="500">Primary</text>
    
    <rect x="110" y="30" width="80" height="35" rx="6" fill="none" stroke="${accentColor}" stroke-width="2"/>
    <text x="150" y="50" text-anchor="middle" fill="${accentColor}" font-family="system-ui" font-size="12" font-weight="500">Outline</text>
    
    <rect x="200" y="30" width="80" height="35" rx="6" fill="${isDark ? "#22c55e" : "#16a34a"}"/>
    <text x="240" y="50" text-anchor="middle" fill="white" font-family="system-ui" font-size="12" font-weight="500">Success</text>
    
    <!-- Mock Card -->
    <rect x="20" y="80" width="260" height="100" rx="8" fill="${bgColor}" stroke="${
      isDark ? "#4b5563" : "#e5e7eb"
    }" stroke-width="1"/>
    <rect x="30" y="90" width="120" height="8" rx="4" fill="${secondaryColor}" opacity="0.6"/>
    <rect x="30" y="105" width="200" height="6" rx="3" fill="${secondaryColor}" opacity="0.4"/>
    <rect x="30" y="118" width="160" height="6" rx="3" fill="${secondaryColor}" opacity="0.4"/>
    
    <rect x="30" y="140" width="60" height="25" rx="4" fill="${accentColor}" opacity="0.8"/>
    <rect x="100" y="140" width="60" height="25" rx="4" fill="none" stroke="${secondaryColor}" stroke-width="1"/>
  </g>
  
  <!-- Stats/Badges -->
  <g transform="translate(80, ${height - 120})">
    <rect x="0" y="0" width="100" height="30" rx="15" fill="${accentColor}" opacity="0.1"/>
    <text x="50" y="20" text-anchor="middle" fill="${accentColor}" font-family="system-ui" font-size="12" font-weight="600">65+ Components</text>
    
    <rect x="120" y="0" width="120" height="30" rx="15" fill="${
      isDark ? "#22c55e" : "#16a34a"
    }" opacity="0.1"/>
    <text x="180" y="20" text-anchor="middle" fill="${
      isDark ? "#22c55e" : "#16a34a"
    }" font-family="system-ui" font-size="12" font-weight="600">TypeScript Ready</text>
    
    <rect x="260" y="0" width="100" height="30" rx="15" fill="${
      isDark ? "#f59e0b" : "#d97706"
    }" opacity="0.1"/>
    <text x="310" y="20" text-anchor="middle" fill="${
      isDark ? "#f59e0b" : "#d97706"
    }" font-family="system-ui" font-size="12" font-weight="600">Fresh 2.0</text>
  </g>
  
  <!-- Bottom Accent -->
  <rect x="0" y="${height - 8}" width="100%" height="8" fill="${accentColor}" opacity="0.6"/>
</svg>`;
  }

  // Generate HTML for card preview
  generateCardPreviewHTML(data: SocialCardData): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Social Card Preview - ${data.title}</title>
  ${this.generateOpenGraphTags(data)}
  ${this.generateStructuredData(data)}
  <style>
    body {
      font-family: system-ui, -apple-system, sans-serif;
      margin: 0;
      padding: 20px;
      background: #f5f5f5;
    }
    .preview-container {
      max-width: 800px;
      margin: 0 auto;
      background: white;
      border-radius: 12px;
      padding: 20px;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    }
    .card-preview {
      border: 2px solid #e5e7eb;
      border-radius: 8px;
      overflow: hidden;
      margin: 20px 0;
    }
    .card-image {
      width: 100%;
      height: auto;
      display: block;
    }
    .platform-tabs {
      display: flex;
      gap: 10px;
      margin-bottom: 20px;
    }
    .tab {
      padding: 8px 16px;
      border: 1px solid #d1d5db;
      border-radius: 6px;
      background: white;
      cursor: pointer;
      font-size: 14px;
    }
    .tab.active {
      background: #3b82f6;
      color: white;
      border-color: #3b82f6;
    }
    .meta-info {
      background: #f9fafb;
      padding: 15px;
      border-radius: 6px;
      margin-top: 20px;
      font-size: 14px;
    }
    .meta-info h3 {
      margin: 0 0 10px 0;
      color: #374151;
    }
    .meta-info code {
      background: #e5e7eb;
      padding: 2px 4px;
      border-radius: 3px;
      font-family: monospace;
    }
  </style>
</head>
<body>
  <div class="preview-container">
    <h1>Social Media Card Preview</h1>
    <p><strong>Title:</strong> ${data.title}</p>
    <p><strong>Description:</strong> ${data.description}</p>
    
    <div class="platform-tabs">
      <button class="tab active" onclick="showPlatform('twitter')">Twitter/X</button>
      <button class="tab" onclick="showPlatform('facebook')">Facebook</button>
      <button class="tab" onclick="showPlatform('linkedin')">LinkedIn</button>
      <button class="tab" onclick="showPlatform('github')">GitHub</button>
    </div>
    
    <div class="card-preview" id="cardPreview">
      ${this.generateSVGCard(data, "Twitter/X")}
    </div>
    
    <div class="meta-info">
      <h3>Meta Tags</h3>
      <p>Open Graph and Twitter Card meta tags are included in the page head.</p>
      <p><strong>Image Size:</strong> <code>1200x630</code> (recommended for most platforms)</p>
      <p><strong>Title Length:</strong> <code>${data.title.length}/70</code> characters (Twitter limit)</p>
      <p><strong>Description Length:</strong> <code>${data.description.length}/200</code> characters (Twitter limit)</p>
    </div>
  </div>
  
  <script>
    function showPlatform(platform) {
      // Remove active class from all tabs
      document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
      
      // Add active class to clicked tab
      event.target.classList.add('active');
      
      // Update card preview based on platform
      const cardData = {
        title: '${data.title}',
        description: '${data.description}',
        siteName: '${data.siteName}',
        url: '${data.url}',
        theme: '${data.theme}',
        type: '${data.type}'
      };
      
      // This would update the SVG card for the selected platform
      console.log('Switching to platform:', platform);
    }
  </script>
</body>
</html>`;
  }

  // Utility function to truncate text
  private truncateText(text: string, limit: number): string {
    if (text.length <= limit) return text;
    return text.substring(0, limit - 3) + "...";
  }

  // Utility function to wrap text for SVG
  private wrapText(text: string, limit: number): string[] {
    const words = text.split(" ");
    const lines: string[] = [];
    let currentLine = "";

    for (const word of words) {
      if ((currentLine + word).length <= limit) {
        currentLine += (currentLine ? " " : "") + word;
      } else {
        if (currentLine) lines.push(currentLine);
        currentLine = word;
      }
    }

    if (currentLine) lines.push(currentLine);
    return lines.slice(0, 3); // Max 3 lines
  }

  // Generate all social card assets
  generateAllAssets(data: SocialCardData): {
    openGraph: string;
    twitterCard: string;
    structuredData: string;
    svgCards: { [platform: string]: string };
    previewHTML: string;
  } {
    const svgCards: { [platform: string]: string } = {};

    this.platforms.forEach((platform) => {
      svgCards[platform.name] = this.generateSVGCard(data, platform.name);
    });

    return {
      openGraph: this.generateOpenGraphTags(data),
      twitterCard: this.generateTwitterCardTags(data),
      structuredData: this.generateStructuredData(data),
      svgCards,
      previewHTML: this.generateCardPreviewHTML(data),
    };
  }
}

// Pre-defined card data for the component library
export const componentLibraryCards = {
  homepage: {
    title: "DaisyUI Components for Fresh 2.0",
    description:
      "Professional, accessible, and TypeScript-ready components. 65+ components with perfect theming and Fresh 2.0 integration.",
    url: "https://your-domain.com",
    type: "website" as const,
    siteName: "DaisyUI Fresh Components",
    theme: "light" as const,
  },
  components: {
    title: "Browse 65+ DaisyUI Components",
    description:
      "Explore our complete collection of DaisyUI components built for Fresh 2.0. Actions, Display, Navigation, Forms, and more.",
    url: "https://your-domain.com/components",
    type: "website" as const,
    siteName: "DaisyUI Fresh Components",
    theme: "light" as const,
  },
  documentation: {
    title: "Getting Started with DaisyUI Fresh Components",
    description:
      "Complete installation guide and documentation for the most comprehensive DaisyUI component library for Fresh 2.0.",
    url: "https://your-domain.com/docs",
    type: "article" as const,
    siteName: "DaisyUI Fresh Components",
    theme: "light" as const,
  },
};

// Usage example
export function generateAllSocialCards(): void {
  const generator = new SocialMediaCardGenerator();

  Object.entries(componentLibraryCards).forEach(([key, cardData]) => {
    const assets = generator.generateAllAssets(cardData);

    console.log(`\n=== ${key.toUpperCase()} Social Cards ===`);
    console.log("Open Graph tags generated ✓");
    console.log("Twitter Card tags generated ✓");
    console.log("Structured data generated ✓");
    console.log(`SVG cards generated for ${Object.keys(assets.svgCards).length} platforms ✓`);
    console.log("Preview HTML generated ✓");
  });
}

// Auto-run when imported
if (typeof window !== "undefined") {
  console.log("Social Media Card Generator loaded");
  console.log("Use generateAllSocialCards() to create all social media assets");
}
