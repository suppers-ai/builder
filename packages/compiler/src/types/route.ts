import { z } from "zod";
import { ComponentSchema } from "./component.ts";
import { GlobalConfigSchema } from "./layout.ts";

// Data Configuration Schema
export const DataConfigSchema = z.object({
  url: z.string().optional(),
  endpoint: z.string(),
  method: z.enum(["GET", "POST", "PUT", "DELETE", "PATCH"]).default("GET"),
});

export type DataConfig = z.infer<typeof DataConfigSchema>;

// Route Override Schema
export const RouteOverrideSchema = z.object({
  head: z.object({
    meta: z.object({
      title: z.string().optional(),
      description: z.string().optional(),
    }).optional(),
  }).optional(),
});

export type RouteOverride = z.infer<typeof RouteOverrideSchema>;

// Route Schema
export const RouteSchema = z.object({
  path: z.string(),
  type: z.enum(["page"]),
  source: z.string().optional(),
  permissions: z.array(z.string()).optional(),
  override: RouteOverrideSchema.optional(),
  components: z.array(ComponentSchema).optional(),
});

export type Route = z.infer<typeof RouteSchema>;

// Data Schema (wrapper for global and routes)
export const DataSchema = z.object({
  global: GlobalConfigSchema.optional(),
  routes: z.array(RouteSchema),
});

export type Data = z.infer<typeof DataSchema>;
