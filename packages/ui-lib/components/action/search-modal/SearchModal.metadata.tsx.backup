import {
  ComponentCategory,
  ComponentExample,
  ComponentMetadata,
  ComponentProp,
} from "../../types.ts";

const searchModalExamples: ComponentExample[] = [
  {
    title: "Basic Search Modal",
    description: "Simple search modal with placeholder text",
    code: `<SearchModal
  isOpen={true}
  onClose={() => console.log('Closed')}
  onSearch={(query) => console.log('Search:', query)}
  placeholder="Search components..."
/>`,
    props: {
      isOpen: false,
      onClose: () => console.log('Closed'),
      onSearch: (query: string) => console.log('Search:', query),
      placeholder: "Search components...",
    },
    showCode: true,
    interactive: true,
  },
  {
    title: "Search Modal with Results",
    description: "Search modal displaying search results",
    code: `<SearchModal
  isOpen={true}
  onClose={() => {}}
  onSearch={() => {}}  
  searchResults={[
    {
      id: "1",
      title: "Button Component", 
      description: "Interactive buttons with multiple variants",
      url: "/components/action/button",
      category: "Action"
    },
    {
      id: "2", 
      title: "Input Component",
      description: "Text input fields for user data",
      url: "/components/input/input",
      category: "Input"
    }
  ]}
/>`,
    props: {
      isOpen: false,
      onClose: () => {},
      onSearch: () => {},
      searchResults: [
        {
          id: "1",
          title: "Button Component", 
          description: "Interactive buttons with multiple variants",
          url: "/components/action/button",
          category: "Action"
        },
        {
          id: "2", 
          title: "Input Component",
          description: "Text input fields for user data",
          url: "/components/input/input",
          category: "Input"
        }
      ]
    },
    showCode: true,
    interactive: true,
  },
  {
    title: "Loading Search Modal",
    description: "Search modal with loading state",
    code: `<SearchModal
  isOpen={true}
  onClose={() => {}}
  onSearch={() => {}}
  loading={true}
  placeholder="Searching..."
/>`,
    props: {
      isOpen: false,
      onClose: () => {},
      onSearch: () => {},
      loading: true,
      placeholder: "Searching...",
    },
    showCode: true,
    interactive: true,
  },
  {
    title: "Customized Search Modal",
    description: "Search modal with custom settings",
    code: `<SearchModal
  isOpen={true}
  onClose={() => {}}
  onSearch={() => {}}
  placeholder="Find documentation..."
  showKeyboardShortcut={false}
  maxResults={5}
  autoFocus={false}
/>`,
    props: {
      isOpen: false,
      onClose: () => {},
      onSearch: () => {},
      placeholder: "Find documentation...",
      showKeyboardShortcut: false,
      maxResults: 5,
      autoFocus: false,
    },
    showCode: true,
    interactive: true,
  },
];

const searchModalProps: ComponentProp[] = [
  {
    name: "isOpen",
    type: "boolean",
    description: "Controls modal visibility",
    required: true,
  },
  {
    name: "onClose",
    type: "() => void",
    description: "Function called when modal is closed",
    required: true,
  },
  {
    name: "onSearch",
    type: "(query: string) => void",
    description: "Function called when search is performed",
    required: true,
  },
  {
    name: "placeholder",
    type: "string",
    description: "Search input placeholder text",
    default: "Search components...",
  },
  {
    name: "searchResults",
    type: "SearchResult[]",
    description: "Array of search results to display",
    default: "[]",
  },
  {
    name: "loading",
    type: "boolean",
    description: "Show loading state",
    default: "false",
  },
  {
    name: "autoFocus",
    type: "boolean",
    description: "Auto-focus search input when opened",
    default: "true",
  },
  {
    name: "showKeyboardShortcut",
    type: "boolean",
    description: "Show keyboard shortcut hints",
    default: "true",
  },
  {
    name: "maxResults",
    type: "number",
    description: "Maximum number of results to display",
    default: "10",
  },
  {
    name: "className",
    type: "string",
    description: "Additional CSS classes",
  },
  {
    name: "children",
    type: "ComponentChildren",
    description: "Additional content in results area",
  },
];

export const searchModalMetadata: ComponentMetadata = {
  name: "SearchModal",
  description:
    "Full-featured search modal with keyboard navigation and customizable results display",
  category: ComponentCategory.ACTION,
  path: "/components/action/search-modal",
  tags: ["search", "modal", "find", "lookup", "keyboard", "navigation"],
  relatedComponents: ["modal", "input", "search-button", "kbd"],
  interactive: true, // Highly interactive with keyboard events and state management
  preview: (
    <div class="mockup-window border bg-base-300 scale-75">
      <div class="flex justify-center items-center px-4 py-16 bg-base-200">
        <div class="w-full max-w-md">
          <div class="flex items-center gap-3 p-4 bg-base-100 rounded-lg shadow">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            <span class="text-base-content/60">Search components...</span>
          </div>
        </div>
      </div>
    </div>
  ),
  examples: searchModalExamples,
  props: searchModalProps,
  variants: ["basic", "with-results", "loading", "customized"],
  useCases: ["Documentation search", "Component discovery", "Command palette", "Global navigation"],
  usageNotes: [
    "Includes full keyboard navigation (↑↓ to navigate, Enter to select, Esc to close)",
    "Auto-focuses search input when opened for better UX",
    "Supports SearchResult interface with id, title, description, url, category",
    "Loading state shows spinner and prevents interactions",
    "maxResults controls how many results are visible (with overflow indicator)",
    "Keyboard shortcuts are hidden on mobile for better responsive design",
    "Built on top of Modal component for consistent behavior",
    "Automatically clears search query when closed",
  ],
};
