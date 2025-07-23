/**
 * SearchModal Component Zod Schema
 * Defines props, types, validation, and documentation for the SearchModal component
 */

import { z } from "zod";
import { BaseComponentPropsSchema, withMetadata } from "../../schemas/base.ts";

// SearchResult Schema
const SearchResultSchema = z.object({
  id: z.string().describe("Unique result identifier"),
  title: z.string().describe("Result title"),
  description: z.string().optional().describe("Result description"),
  url: z.string().optional().describe("Result URL"),
  category: z.string().optional().describe("Result category"),
  icon: z.any().optional().describe("Result icon component"),
});

// SearchModal-specific props
const SearchModalSpecificPropsSchema = z.object({
  isOpen: withMetadata(
    z.boolean().describe("Whether modal is open"),
    { examples: ["true", "false"], since: "1.0.0" },
  ),

  onClose: z.function()
    .args()
    .returns(z.void())
    .describe("Callback when modal closes"),

  onSearch: z.function()
    .args(z.string())
    .returns(z.void())
    .describe("Callback when search is performed"),

  placeholder: z.string()
    .default("Search...")
    .describe("Search input placeholder text"),

  searchResults: z.array(SearchResultSchema)
    .optional()
    .describe("Array of search results to display"),

  loading: z.boolean()
    .default(false)
    .describe("Show loading state"),

  className: z.string()
    .optional()
    .describe("Additional CSS classes"),

  autoFocus: withMetadata(
    z.boolean().default(true).describe("Auto focus search input when opened"),
    { examples: ["true", "false"], since: "1.0.0" },
  ),

  showKeyboardShortcut: withMetadata(
    z.boolean().default(true).describe("Show keyboard shortcuts in modal"),
    { examples: ["true", "false"], since: "1.0.0" },
  ),

  maxResults: z.number()
    .positive()
    .default(10)
    .describe("Maximum number of results to display"),
});

// Complete SearchModal Props Schema
export const SearchModalPropsSchema = BaseComponentPropsSchema
  .merge(SearchModalSpecificPropsSchema)
  .describe("Modal dialog for search functionality with keyboard navigation and results display");

// Export SearchResult schema for reuse
export { SearchResultSchema };

// Infer TypeScript types from schemas
export type SearchResult = z.infer<typeof SearchResultSchema>;
export type SearchModalProps = z.infer<typeof SearchModalPropsSchema>;

// Export validation functions
export const validateSearchModalProps = (props: unknown): SearchModalProps => {
  return SearchModalPropsSchema.parse(props);
};

export const safeValidateSearchModalProps = (props: unknown) => {
  return SearchModalPropsSchema.safeParse(props);
};

export const validateSearchResult = (result: unknown): SearchResult => {
  return SearchResultSchema.parse(result);
};

export const safeValidateSearchResult = (result: unknown) => {
  return SearchResultSchema.safeParse(result);
};
