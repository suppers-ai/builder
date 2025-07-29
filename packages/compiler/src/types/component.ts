import { z } from "zod";

// Component Schema (recursive)
export const ComponentSchema: z.ZodType<ComponentDefinition> = z.lazy(() =>
  z.object({
    id: z.string(),
    props: z.record(z.unknown()).optional(),
    components: z.array(ComponentSchema).optional(),
  })
);

export interface ComponentDefinition {
  id: string;
  props?: Record<string, unknown>;
  components?: ComponentDefinition[];
}

// Layout Component Schema
export const LayoutComponentSchema = z.object({
  component: ComponentSchema,
});

export type LayoutComponent = z.infer<typeof LayoutComponentSchema>;