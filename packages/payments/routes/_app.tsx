import { PageProps } from "fresh";
import { AuthProvider } from "../islands/AuthProvider.tsx";

export default function App({ Component }: PageProps) {
  return (
    <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Payments</title>
        <link rel="stylesheet" href="/styles.css" />
      </head>
      <body>
        <AuthProvider>
          <Component />
        </AuthProvider>
      </body>
    </html>
  );
}
