import { z } from "zod";
import { BaseComponentSchema, SizeSchema } from "../../schemas/base.ts";

export const LogoSchema = BaseComponentSchema.extend({
  alt: z.string().optional().describe("Alt text for the logo image"),
  variant: z.enum(["long", "short"]).default("long").describe("Logo variant - long (full logo) or short (icon only)"),
  href: z.string().optional().describe("Optional URL to wrap the logo in a link"),
  size: SizeSchema.default("md").describe("Size of the logo"),
});

export type LogoProps = z.infer<typeof LogoSchema>;