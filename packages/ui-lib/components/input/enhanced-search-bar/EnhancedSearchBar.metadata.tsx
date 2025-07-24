import { EnhancedSearchBar } from "./EnhancedSearchBar.tsx";

export const componentMetadata = {
  component: EnhancedSearchBar,
  category: "Input",
  name: "EnhancedSearchBar",
  description: "Advanced search bar component with filters, debounced search, and SSR support",
  props: {
    placeholder: {
      type: "string",
      default: '"Search..."',
      description: "Placeholder text for the search input"
    },
    onSearch: {
      type: "(query: string, filters: Record<string, string>) => void",
      required: true,
      description: "Callback function called when search query or filters change"
    },
    filters: {
      type: "SearchFilter[]",
      default: "[]",
      description: "Array of filter objects with key, label, and options"
    },
    debounceMs: {
      type: "number",
      default: "300",
      description: "Milliseconds to debounce search input"
    },
    className: {
      type: "string",
      default: '""',
      description: "Additional CSS classes"
    },
    showClearButton: {
      type: "boolean", 
      default: "true",
      description: "Whether to show the clear button when there's content"
    }
  },
  examples: [
    {
      name: "Basic Search Bar",
      code: `<EnhancedSearchBar 
  onSearch={(query, filters) => console.log(query, filters)} 
/>`,
      props: {}
    },
    {
      name: "Search Bar with Filters",
      code: `<EnhancedSearchBar
  onSearch={(query, filters) => console.log(query, filters)}
  filters={[
    {
      key: "status",
      label: "Status", 
      options: [
        { value: "active", label: "Active" },
        { value: "inactive", label: "Inactive" }
      ]
    }
  ]}
/>`,
      props: {}
    }
  ]
};