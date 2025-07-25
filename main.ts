// Root-level entry for Deno Deploy
// Simply re-export everything from the actual application entry that resides in
// packages/ui-lib-website so that the builder can find an `app` export.

export * from "./packages/ui-lib-website/main.ts"; 