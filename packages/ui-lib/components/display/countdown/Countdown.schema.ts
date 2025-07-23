/**
 * Countdown Component Zod Schema
 * Defines props, types, validation, and documentation for the Countdown component
 */

import { z } from "zod";
import { BaseComponentPropsSchema, DaisyUISizeSchema, withMetadata } from "../../schemas/base.ts";

// TimeLeft Schema
const TimeLeftSchema = z.object({
  days: z.number().nonnegative().describe("Days remaining"),
  hours: z.number().min(0).max(23).describe("Hours remaining"),
  minutes: z.number().min(0).max(59).describe("Minutes remaining"),
  seconds: z.number().min(0).max(59).describe("Seconds remaining"),
  totalSeconds: z.number().nonnegative().describe("Total seconds remaining"),
});

// Countdown-specific props
const CountdownSpecificPropsSchema = z.object({
  targetDate: withMetadata(
    z.union([z.string(), z.date()]).optional().describe("Target date/time for countdown"),
    { examples: ["2024-12-31T23:59:59", "new Date('2024-12-31')"], since: "1.0.0" },
  ),

  showLabels: withMetadata(
    z.boolean().default(true).describe("Show time unit labels"),
    { examples: ["true", "false"], since: "1.0.0" },
  ),

  showDays: z.boolean()
    .default(true)
    .describe("Show days in countdown"),

  showHours: z.boolean()
    .default(true)
    .describe("Show hours in countdown"),

  showMinutes: z.boolean()
    .default(true)
    .describe("Show minutes in countdown"),

  showSeconds: z.boolean()
    .default(true)
    .describe("Show seconds in countdown"),

  size: DaisyUISizeSchema.default("md").describe("Countdown display size"),

  timeLeft: TimeLeftSchema
    .optional()
    .describe("Controlled mode: current time remaining"),

  onComplete: z.function()
    .args()
    .returns(z.void())
    .optional()
    .describe("Callback when countdown reaches zero"),

  onTick: z.function()
    .args(TimeLeftSchema)
    .returns(z.void())
    .optional()
    .describe("Callback on each countdown tick"),
});

// Complete Countdown Props Schema
export const CountdownPropsSchema = BaseComponentPropsSchema
  .merge(CountdownSpecificPropsSchema)
  .describe("Countdown timer component for displaying time remaining until a target date");

// Export TimeLeft schema for reuse
export { TimeLeftSchema };

// Infer TypeScript types from schemas
export type TimeLeft = z.infer<typeof TimeLeftSchema>;
export type CountdownProps = z.infer<typeof CountdownPropsSchema>;

// Export validation functions
export const validateCountdownProps = (props: unknown): CountdownProps => {
  return CountdownPropsSchema.parse(props);
};

export const safeValidateCountdownProps = (props: unknown) => {
  return CountdownPropsSchema.safeParse(props);
};

export const validateTimeLeft = (timeLeft: unknown): TimeLeft => {
  return TimeLeftSchema.parse(timeLeft);
};

export const safeValidateTimeLeft = (timeLeft: unknown) => {
  return TimeLeftSchema.safeParse(timeLeft);
};
