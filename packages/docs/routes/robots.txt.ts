import { generateRobotsTxt } from "../utils/sitemap.ts";

export const handler = (_req: Request): Response => {
  const robots = generateRobotsTxt();

  return new Response(robots, {
    headers: {
      "Content-Type": "text/plain",
      "Cache-Control": "public, max-age=86400", // Cache for 24 hours
    },
  });
};
