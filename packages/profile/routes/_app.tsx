import { type PageProps } from "fresh";
import { generateEarlyThemeScript } from "@suppers/shared/utils";

export default function App({ Component, state }: PageProps) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Suppers - Build, Monetize, Scale</title>
        <link rel="stylesheet" href="/styles.css" />

        {/* Early theme application to prevent flicker */}
        <script
          dangerouslySetInnerHTML={{
            __html: generateEarlyThemeScript(),
          }}
        />
      </head>
      <body class="theme-transition">
        <Component />
      </body>
    </html>
  );
}
