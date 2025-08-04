import { z } from "zod";

export const SearchFilterSchema = z.object({
  key: z.string(),
  label: z.string(),
  options: z.array(z.object({
    value: z.string(),
    label: z.string(),
  })),
});

export const EnhancedSearchBarSchema = z.object({
  placeholder: z.string().optional().default("Search..."),
  filters: z.array(SearchFilterSchema).optional().default([]),
  debounceMs: z.number().optional().default(300),
  className: z.string().optional().default(""),
  showClearButton: z.boolean().optional().default(true),
});
