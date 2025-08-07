import { type PageProps } from "fresh";

export default function App({ Component, state }: PageProps) {
  return (
    <html lang="en" data-theme="light">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Suppers App - SSO Authentication Service</title>
        <link rel="stylesheet" href="/styles.css" />
      </head>
      <body class="theme-transition">
        <Component />
      </body>
    </html>
  );
}
