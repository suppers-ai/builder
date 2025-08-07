import { Context } from "fresh";
import { generateRobotsTxt } from "../utils/sitemap.ts";

export const handler = (ctx: Context<any>): Response => {
  const robots = generateRobotsTxt();

  return new Response(robots, {
    headers: {
      "Content-Type": "text/plain",
      "Cache-Control": "public, max-age=86400", // Cache for 24 hours
    },
  });
};
