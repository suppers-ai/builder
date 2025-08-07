import { type PageProps } from "fresh";
import SimpleNavbar from "../islands/SimpleNavbar.tsx";

export default function App({ Component, url }: PageProps) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Suppers Store - Application Marketplace</title>
        <link rel="stylesheet" href="/styles.css" />
      </head>
      <body>
        <div class="min-h-screen bg-base-100">
          {/* Top Navigation */}
          <SimpleNavbar currentPath={url.pathname} />

          {/* Main Content */}
          <main class="w-full">
            <Component />
          </main>
        </div>
      </body>
    </html>
  );
}
