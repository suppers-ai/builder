import { type PageProps } from "$fresh/runtime";

export default function App({ Component }: PageProps) {
  // Inject environment variables for browser
  const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
  const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") || "";

  return (
    <html lang="en" data-theme="light">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Suppers App - SSO Authentication Service</title>
        <link rel="stylesheet" href="/styles.css" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              globalThis.SUPABASE_URL = "${supabaseUrl}";
              globalThis.SUPABASE_ANON_KEY = "${supabaseAnonKey}";
              
              // Theme initialization
              (function () {
                function getSystemTheme() {
                  return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                }

                try {
                  const savedTheme = localStorage.getItem('theme');
                  const currentTheme = savedTheme || getSystemTheme();
                  document.documentElement.setAttribute('data-theme', currentTheme);
                  
                  // Listen for system theme changes
                  if (window.matchMedia) {
                    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function(e) {
                      if (!localStorage.getItem('theme')) {
                        const systemTheme = e.matches ? 'dark' : 'light';
                        document.documentElement.setAttribute('data-theme', systemTheme);
                      }
                    });
                  }
                } catch (e) {
                  document.documentElement.setAttribute('data-theme', 'light');
                }
              })();
            `,
          }}
        />
      </head>
      <body class="theme-transition">
        <Component />
      </body>
    </html>
  );
}