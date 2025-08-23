import { type PageProps } from "fresh";

export default function App({ Component }: PageProps) {
  return (
    <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Ghostly Glide - A Spooky Adventure</title>
        <link rel="stylesheet" href="/styles.css" />
        <meta name="description" content="Navigate through haunted houses as a friendly ghost in this exciting 2D adventure game!" />
        <meta property="og:title" content="Ghostly Glide" />
        <meta property="og:description" content="Navigate through haunted houses as a friendly ghost!" />
        <meta property="og:type" content="website" />
      </head>
      <body class="bg-gray-900">
        <Component />
      </body>
    </html>
  );
}