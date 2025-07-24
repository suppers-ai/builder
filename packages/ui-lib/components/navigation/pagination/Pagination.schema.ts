/**
 * Pagination Component Zod Schema
 * Defines props, types, validation, and documentation for the Pagination component
 */

import { z } from "zod";
import {
  BaseComponentPropsSchema,
  withMetadata,
} from "../../schemas/base.ts";

// Pagination-specific props
const PaginationSpecificPropsSchema = z.object({
  currentPage: withMetadata(
    z.number()
      .int()
      .positive()
      .describe("Current active page number (1-based)"),
    { examples: ["1", "5", "10"], since: "1.0.0" },
  ),
  
  totalPages: z.number()
    .int()
    .positive()
    .describe("Total number of pages available"),
    
  size: z.enum(["xs", "sm", "md", "lg"])
    .default("md")
    .describe("Size of pagination buttons"),
    
  showFirstLast: z.boolean()
    .default(true)
    .describe("Whether to show first/last page buttons"),
    
  showPrevNext: z.boolean()
    .default(true)
    .describe("Whether to show previous/next page buttons"),
    
  maxVisiblePages: z.number()
    .int()
    .positive()
    .default(5)
    .describe("Maximum number of page buttons to display"),
    
  // Event handlers
  onPageChange: z.function()
    .args(z.number().int().positive())
    .returns(z.void())
    .optional()
    .describe("Callback when any page is selected"),
    
  onFirstPage: z.function()
    .args()
    .returns(z.void())
    .optional()
    .describe("Callback when first page button is clicked"),
    
  onLastPage: z.function()
    .args()
    .returns(z.void())
    .optional()
    .describe("Callback when last page button is clicked"),
    
  onNextPage: z.function()
    .args()
    .returns(z.void())
    .optional()
    .describe("Callback when next page button is clicked"),
    
  onPrevPage: z.function()
    .args()
    .returns(z.void())
    .optional()
    .describe("Callback when previous page button is clicked"),
})
.refine(
  (data) => data.currentPage <= data.totalPages,
  {
    message: "currentPage must not exceed totalPages",
    path: ["currentPage"],
  }
)
.refine(
  (data) => data.maxVisiblePages <= data.totalPages,
  {
    message: "maxVisiblePages should not exceed totalPages for optimal display",
    path: ["maxVisiblePages"],
  }
);

// Complete Pagination Props Schema
export const PaginationPropsSchema = BaseComponentPropsSchema
  .merge(PaginationSpecificPropsSchema)
  .describe("Pagination control with configurable buttons, callbacks, and responsive page display");

// Infer TypeScript types from schemas
export type PaginationProps = z.infer<typeof PaginationPropsSchema>;

// Export validation functions
export const validatePaginationProps = (props: unknown): PaginationProps => {
  return PaginationPropsSchema.parse(props);
};

export const safeValidatePaginationProps = (props: unknown) => {
  return PaginationPropsSchema.safeParse(props);
};

// Utility validation functions
export const validatePageRange = (currentPage: number, totalPages: number): boolean => {
  return currentPage >= 1 && currentPage <= totalPages && totalPages > 0;
};

export const validatePaginationState = (props: {
  currentPage: number;
  totalPages: number;
  maxVisiblePages?: number;
}) => {
  const result = PaginationSpecificPropsSchema.pick({
    currentPage: true,
    totalPages: true,
    maxVisiblePages: true,
  }).safeParse(props);
  
  return result.success;
};