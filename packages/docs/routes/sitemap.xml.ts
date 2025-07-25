import { generateSitemap } from "../utils/sitemap.ts";

export const handler = (_req: Request): Response => {
  const sitemap = generateSitemap();

  return new Response(sitemap, {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "public, max-age=86400", // Cache for 24 hours
    },
  });
};
