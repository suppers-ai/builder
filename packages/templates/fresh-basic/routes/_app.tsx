import { type PageProps } from "fresh";
import { AuthClientProvider } from "@suppers/ui-lib/shared/providers/AuthClientProvider.tsx";
import { getPackageUrl } from "@suppers/shared/constants/ports.ts";

export default function App({ Component }: PageProps) {
  const Comp = Component as any;
  return (
    <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Fresh Basic App</title>
        <link rel="stylesheet" href="/styles.css" />
      </head>
      <body>
        <AuthClientProvider
          storeUrl={getPackageUrl("PROFILE")}
          clientId="fresh-basic-app"
          redirectUri={typeof window !== "undefined"
            ? globalThis.location.origin + "/auth/callback"
            : ""}
        >
          <Comp />
        </AuthClientProvider>
      </body>
    </html>
  );
}
