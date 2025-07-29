import { z } from "zod";
import { LayoutComponentSchema } from "./component.ts";

// Head Meta Schema
export const HeadMetaSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
});

export type HeadMeta = z.infer<typeof HeadMetaSchema>;

// Head Schema
export const HeadSchema = z.object({
  meta: HeadMetaSchema.optional(),
});

export type Head = z.infer<typeof HeadSchema>;

// Global Config Schema
export const GlobalConfigSchema = z.object({
  head: HeadSchema.optional(),
  menu: LayoutComponentSchema.optional(),
  header: LayoutComponentSchema.optional(),
  footer: LayoutComponentSchema.optional(),
});

export type GlobalConfig = z.infer<typeof GlobalConfigSchema>;