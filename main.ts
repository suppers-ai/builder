// Root-level entry that re-exports the Fresh `app` for Deno Deploy *and*
// starts the server automatically when this file is executed locally.

import * as ui from "./packages/ui-lib-website/main.ts";

// Re-export the application object for Deno Deploy warm-up.
export const app = ui.app;

// When you run `deno run main.ts` locally, start the listener so you can
// verify the build output. Deploy’s builder just imports this file, so
// `import.meta.main` will be false in production and the server will not
// attempt to listen twice.
if (import.meta.main) {
  await ui.app.listen({ port: 8000 });
} 