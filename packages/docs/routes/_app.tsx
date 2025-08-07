import { type PageProps } from "fresh";
import { asset } from "$fresh/runtime";

export default function App({ Component, state }: PageProps) {
  const Comp = Component as any;
  const title = (state as any)?.title || "Suppers Component Library - Fresh 2.0";

  return (
    <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>{title}</title>

        {/* SEO Meta Tags */}
        <meta
          name="description"
          content="Professional Suppers component library built for Fresh 2.0. 65+ production-ready components with TypeScript support, responsive design, and accessibility features."
        />
        <meta
          name="keywords"
          content="daisyUI, Fresh, components, TypeScript, Preact, Tailwind CSS, UI library, web components, responsive design"
        />
        <meta name="author" content="Suppers Component Library" />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://your-domain.com/" />

        {/* Open Graph Meta Tags */}
        <meta property="og:title" content="Suppers Component Library - Fresh 2.0" />
        <meta
          property="og:description"
          content="Professional Suppers component library with 65+ components built for Fresh 2.0"
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://your-domain.com/" />
        <meta property="og:image" content="https://your-domain.com/og-image.png" />
        <meta property="og:site_name" content="Suppers Component Library" />

        {/* Twitter Card Meta Tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Suppers Component Library - Fresh 2.0" />
        <meta
          name="twitter:description"
          content="Professional Suppers component library with 65+ components built for Fresh 2.0"
        />
        <meta name="twitter:image" content="https://your-domain.com/twitter-image.png" />

        {/* Favicon and Icons */}
        {/* Theme-aware favicon: defaults to light icon, updated via script */}
        <link
          id="site-favicon"
          rel="icon"
          type="image/x-icon"
          href="https://cdn.suppers.ai/favicons/favicon_light.ico"
        />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="manifest" href="/site.webmanifest" />

        {/* Performance Optimization */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />

        {/* Custom CSS files */}
        <link rel="stylesheet" href={asset("/styles.css")} />

        {/* Theme initialization script – sets theme and swaps favicons accordingly */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function () {
                const lightFavicon = "https://cdn.suppers.ai/favicons/favicon_light.ico";
                const darkFavicon = "https://cdn.suppers.ai/favicons/favicon_dark.ico";

                function setFavicon(theme) {
                  var link = document.getElementById('site-favicon');
                  if (!link) return;
                  link.setAttribute('href', theme === 'dark' ? darkFavicon : lightFavicon);
                }

                function getSystemTheme() {
                  return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                }

                try {
                  const savedTheme = localStorage.getItem('theme');
                  const currentTheme = savedTheme || getSystemTheme();
                  document.documentElement.setAttribute('data-theme', currentTheme);
                  setFavicon(currentTheme);
                  
                  console.log('System theme:', getSystemTheme());
                  console.log('Saved theme:', savedTheme);
                  console.log('Using theme:', currentTheme);

                  // Listen for system theme changes
                  if (window.matchMedia) {
                    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function(e) {
                      if (!localStorage.getItem('theme')) {
                        const systemTheme = e.matches ? 'dark' : 'light';
                        document.documentElement.setAttribute('data-theme', systemTheme);
                        setFavicon(systemTheme);
                      }
                    });
                  }

                  // Observe future theme changes
                  new MutationObserver(function (m) {
                    m.forEach(function (record) {
                      if (record.attributeName === 'data-theme') {
                        setFavicon(document.documentElement.getAttribute('data-theme'));
                      }
                    });
                  }).observe(document.documentElement, { attributes: true });
                } catch (e) {
                  document.documentElement.setAttribute('data-theme', 'light');
                  setFavicon('light');
                }
              })();
            `,
          }}
        />
      </head>
      <body class="theme-transition">
        <Comp />
      </body>
    </html>
  );
}
