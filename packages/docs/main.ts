#!/usr/bin/env deno run -A
import { loadSync } from "@std/dotenv";
import { dirname, fromFileUrl } from "@std/path/mod.ts";
import { App, staticFiles } from "fresh";

// Ensure the working directory is the same directory as this file
Deno.chdir(dirname(fromFileUrl(import.meta.url)));

// Load environment variables from .env.local, .env files
loadSync({
  envPath: ".env.local",
  defaultsPath: ".env",
  export: true,
});

export const app = new App()
  .use(staticFiles())
  .fsRoutes();

// Helper function to render JSX to HTML Response
// function renderPage(component: any, req?: Request, params = {}) {
//   const url = req ? new URL(req.url) : new URL("http://localhost:8002/");
//   const pageProps = {
//     url,
//     params,
//     state: {},
//   };
  
//   // Create a simple wrapper that just renders the component
//   const SimpleWrapper = () => component(pageProps);
//   const html = render(AppLayout({ Component: SimpleWrapper, ...pageProps }));
  
//   return new Response(`<!DOCTYPE html>${html}`, {
//     headers: { "content-type": "text/html; charset=utf-8" },
//   });
// }

// Add routes manually
// app.get("/", (req) => renderPage(IndexPage, req));
// app.get("/robots.txt", robotsRoute.default);
// app.get("/sitemap.xml", sitemapRoute.default);
// app.get("/components", (req) => renderPage(ComponentsIndexPage, req));
// app.get("/components/:category/:name", (req) => {
//   const { category, name } = req.params;
//   return renderPage(ComponentsCategoryPage, req, { category, name });
// });

if (import.meta.main) {
  await app.listen();
}
