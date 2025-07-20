import { type PageProps } from "fresh";
import { asset } from "$fresh/runtime";

// Mock AuthProvider for development environment
function MockAuthProvider({ children }: { children: any }) {
  return children;
}

export default function App({ Component, state }: PageProps) {
  const Comp = Component as any;
  const title = (state as any)?.title || "DaisyUI Component Library - Fresh 2.0";

  return (
    <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>{title}</title>

        {/* SEO Meta Tags */}
        <meta
          name="description"
          content="Professional DaisyUI component library built for Fresh 2.0. 65+ production-ready components with TypeScript support, responsive design, and accessibility features."
        />
        <meta
          name="keywords"
          content="DaisyUI, Fresh, components, TypeScript, Preact, Tailwind CSS, UI library, web components, responsive design"
        />
        <meta name="author" content="DaisyUI Component Library" />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://your-domain.com/" />

        {/* Open Graph Meta Tags */}
        <meta property="og:title" content="DaisyUI Component Library - Fresh 2.0" />
        <meta
          property="og:description"
          content="Professional DaisyUI component library with 65+ components built for Fresh 2.0"
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://your-domain.com/" />
        <meta property="og:image" content="https://your-domain.com/og-image.png" />
        <meta property="og:site_name" content="DaisyUI Component Library" />

        {/* Twitter Card Meta Tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="DaisyUI Component Library - Fresh 2.0" />
        <meta
          name="twitter:description"
          content="Professional DaisyUI component library with 65+ components built for Fresh 2.0"
        />
        <meta name="twitter:image" content="https://your-domain.com/twitter-image.png" />

        {/* Favicon and Icons */}
        <link rel="icon" type="image/x-icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="manifest" href="/site.webmanifest" />

        {/* Performance Optimization */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        
        {/* Custom CSS files */}
        <link rel="stylesheet" href={asset("/styles.css")} />
        <link rel="stylesheet" href={asset("/theme-transitions.css")} />
        <link rel="stylesheet" href={asset("/spacing-system.css")} />
        <link rel="stylesheet" href={asset("/page-transitions.css")} />
        <link rel="stylesheet" href={asset("/responsive-design.css")} />
        <link rel="stylesheet" href={asset("/performance-optimizations.css")} />

        {/* Theme initialization script - runs before page render to prevent flash */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const savedTheme = localStorage.getItem('theme') || 'light';
                  document.documentElement.setAttribute('data-theme', savedTheme);
                } catch (e) {
                  // Fallback to light theme if localStorage is not available
                  document.documentElement.setAttribute('data-theme', 'light');
                }
              })();
            `,
          }}
        />
      </head>
      <body class="theme-transition">
        <MockAuthProvider>
          <Comp />
        </MockAuthProvider>
      </body>
    </html>
  );
}
