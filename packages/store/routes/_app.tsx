import { type PageProps } from "fresh";
import SimpleNavbar from "../islands/SimpleNavbar.tsx";

export default function App({ Component, route }: PageProps) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Suppers Store - Application Marketplace</title>
        <link rel="stylesheet" href="/styles.css" />
        {/* Theme initialization script - runs before body renders to prevent flash */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
            (function() {
              try {
                // First check localStorage for immediate theme application
                let theme = localStorage.getItem('theme');
                
                // If we have authentication tokens, we'll update to user's theme after page loads
                // For now, just use localStorage or default to prevent flash
                if (!theme) {
                  theme = 'light';
                }
                
                document.documentElement.setAttribute('data-theme', theme);
                console.log('🎨 Initial theme set:', theme);
              } catch (e) {
                document.documentElement.setAttribute('data-theme', 'light');
                console.log('🎨 Fallback theme set: light');
              }
            })();
          `,
          }}
        />
      </head>
      <body>
        <div class="min-h-screen bg-base-100">
          {/* Top Navigation */}
          <SimpleNavbar currentPath={route} />

          {/* Main Content */}
          <main class="w-full">
            <Component />
          </main>
        </div>
      </body>
    </html>
  );
}
