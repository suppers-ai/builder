import { type PageProps } from "fresh";

export default function App({ Component }: PageProps) {
  // Inject environment variables for browser
  const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
  const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") || "";

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Suppers Store - Authentication Hub</title>
        <link rel="stylesheet" href="/styles.css" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              globalThis.SUPABASE_URL = "${supabaseUrl}";
              globalThis.SUPABASE_ANON_KEY = "${supabaseAnonKey}";
            `,
          }}
        />
      </head>
      <body>
        <Component />
      </body>
    </html>
  );
}
