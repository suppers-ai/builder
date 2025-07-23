/**
 * Stat Component Zod Schema
 * Defines props, types, validation, and documentation for the Stat component
 */

import { z } from "zod";
import { BaseComponentPropsSchema, withMetadata } from "../../schemas/base.ts";

// Stat-specific props
const StatSpecificPropsSchema = z.object({
  title: z.string()
    .optional()
    .describe("Stat title/label"),

  value: withMetadata(
    z.union([z.string(), z.number()]).describe("Main stat value to display"),
    { examples: ["42", "1,234", "$99.99"], since: "1.0.0" },
  ),

  description: z.string()
    .optional()
    .describe("Additional description text"),

  figure: z.any()
    .optional()
    .describe("Icon or image to display"),

  actions: z.any()
    .optional()
    .describe("Action buttons or controls"),

  onClick: z.function()
    .args()
    .returns(z.void())
    .optional()
    .describe("Click event handler"),

  loading: z.boolean()
    .default(false)
    .describe("Show loading state"),

  animated: withMetadata(
    z.boolean().default(false).describe("Enable value animations"),
    { examples: ["true", "false"], since: "1.0.0" },
  ),

  formatter: withMetadata(
    z.enum(["currency", "number", "percentage", "none"])
      .default("none")
      .describe("Value formatting type"),
    { examples: ["currency", "number", "percentage", "none"], since: "1.0.0" },
  ),

  currency: z.string()
    .default("USD")
    .describe("Currency code for currency formatting"),

  locale: z.string()
    .default("en-US")
    .describe("Locale for number formatting"),
});

// StatsGroup Schema
const StatsGroupSpecificPropsSchema = z.object({
  stats: z.array(StatSpecificPropsSchema).describe("Array of stat configurations"),

  autoRefresh: z.boolean()
    .default(false)
    .describe("Automatically refresh stats"),

  refreshInterval: z.number()
    .positive()
    .default(30000)
    .describe("Refresh interval in milliseconds"),

  onRefresh: z.function()
    .args()
    .returns(z.void())
    .optional()
    .describe("Callback when stats are refreshed"),

  loading: z.boolean()
    .default(false)
    .describe("Show loading state for all stats"),

  showControls: z.boolean()
    .default(false)
    .describe("Show refresh controls"),

  animated: z.boolean()
    .default(false)
    .describe("Enable animations for all stats"),
});

// Complete Stat Props Schema
export const StatPropsSchema = BaseComponentPropsSchema
  .merge(StatSpecificPropsSchema)
  .describe("Stat component for displaying key metrics and data points");

// Complete StatsGroup Props Schema
export const StatsGroupPropsSchema = BaseComponentPropsSchema
  .merge(StatsGroupSpecificPropsSchema)
  .describe("Stats group component for displaying multiple related statistics");

// Infer TypeScript types from schemas
export type StatProps = z.infer<typeof StatPropsSchema>;
export type StatsGroupProps = z.infer<typeof StatsGroupPropsSchema>;

// Export validation functions
export const validateStatProps = (props: unknown): StatProps => {
  return StatPropsSchema.parse(props);
};

export const safeValidateStatProps = (props: unknown) => {
  return StatPropsSchema.safeParse(props);
};

export const validateStatsGroupProps = (props: unknown): StatsGroupProps => {
  return StatsGroupPropsSchema.parse(props);
};

export const safeValidateStatsGroupProps = (props: unknown) => {
  return StatsGroupPropsSchema.safeParse(props);
};
