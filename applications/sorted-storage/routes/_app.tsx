import { type PageProps } from "fresh";
import { asset } from "fresh/runtime";

export default function App({ Component }: PageProps) {
  return (
    <html data-theme="light">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Sorted Storage - File Management System</title>
        <link rel="stylesheet" href={asset("/styles.css")} />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
      </head>
      <body>
        <Component />
      </body>
    </html>
  );
}