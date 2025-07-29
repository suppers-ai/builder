import { z } from "zod";
import { VariablesSchema, CompilerInfoSchema } from "./generator.ts";
import { DataSchema } from "./route.ts";

// Application Info Schema
export const ApplicationInfoSchema = z.object({
  name: z.string(),
  version: z.string(),
  description: z.string().optional(),
  id: z.string(),
});

export type ApplicationInfo = z.infer<typeof ApplicationInfoSchema>;

// Application Specification Schema (new format)
export const ApplicationSpecSchema = z.object({
  application: ApplicationInfoSchema,
  variables: VariablesSchema.optional(),
  compiler: CompilerInfoSchema,
  data: DataSchema,
});

export type ApplicationSpec = z.infer<typeof ApplicationSpecSchema>;