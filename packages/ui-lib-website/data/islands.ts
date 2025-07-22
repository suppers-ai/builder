import { SearchableComponent } from "../utils/search.ts";

export interface IslandPattern extends SearchableComponent {
  id: string;
  complexity: "basic" | "medium" | "advanced";
  baseComponent: string; // ui-lib component used as base
  interactivityType: string; // e.g., "state-management", "form-handling", "api-integration"
  example: {
    staticComponent: string; // JSX for static version
    islandComponent: string; // JSX for island version
    explanation: string;
  };
  codeFiles: {
    filename: string;
    content: string;
    language: 'tsx' | 'ts';
  }[];
  hooks: string[]; // React hooks used
  dependencies?: string[]; // Additional dependencies if needed
}

export interface IslandTutorial {
  title: string;
  description: string;
  steps: {
    title: string;
    content: string;
    code?: string;
  }[];
}

export interface IslandExampleData {
  patterns: {
    basic: IslandPattern[];
    medium: IslandPattern[];
    advanced: IslandPattern[];
  };
  categories: {
    name: string;
    description: string;
    patterns: string[]; // pattern IDs
  }[];
  tutorials: IslandTutorial[];
}

// Island Pattern Examples - Educational content showing how to create islands from ui-lib components
export const islandPatterns: IslandExampleData = {
  patterns: {
    basic: [
      {
        id: "button-with-state",
        name: "Button with State",
        description: "Transform a static Button component into an interactive island with click handling",
        category: "Actions",
        tags: ["button", "state", "onClick", "basic"],
        path: "/islands/patterns/button-with-state",
        keywords: ["button", "click", "state", "interactive"],
        complexity: "basic",
        baseComponent: "Button",
        interactivityType: "state-management",
        example: {
          staticComponent: `<Button>Click me</Button>`,
          islandComponent: `<ButtonWithState />`,
          explanation: "Convert a static button to track click count using useState hook. This demonstrates the fundamental pattern of adding client-side state to a ui-lib component."
        },
        codeFiles: [
          {
            filename: "ButtonWithState.tsx",
            language: "tsx",
            content: `import { useState } from "preact/hooks";
import { Button } from "@suppers/ui-lib";

export default function ButtonWithState() {
  const [count, setCount] = useState(0);
  
  return (
    <Button onClick={() => setCount(count + 1)}>
      Clicked {count} times
    </Button>
  );
}`
          },
          {
            filename: "ButtonWithVariants.tsx",
            language: "tsx",
            content: `import { useState } from "preact/hooks";
import { Button } from "@suppers/ui-lib";

export default function ButtonWithVariants() {
  const [isLoading, setIsLoading] = useState(false);
  const [variant, setVariant] = useState<"primary" | "secondary" | "outline">("primary");
  
  const handleClick = async () => {
    setIsLoading(true);
    // Simulate async operation
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsLoading(false);
    
    // Cycle through variants
    const variants = ["primary", "secondary", "outline"] as const;
    const currentIndex = variants.indexOf(variant);
    const nextIndex = (currentIndex + 1) % variants.length;
    setVariant(variants[nextIndex]);
  };
  
  return (
    <Button 
      variant={variant}
      onClick={handleClick}
      disabled={isLoading}
    >
      {isLoading ? "Loading..." : \`Click me (\${variant})\`}
    </Button>
  );
}`
          },
          {
            filename: "ButtonGroup.tsx",
            language: "tsx",
            content: `import { useState } from "preact/hooks";
import { Button } from "@suppers/ui-lib";

export default function ButtonGroup() {
  const [activeButton, setActiveButton] = useState<string | null>(null);
  const [clickCounts, setClickCounts] = useState<Record<string, number>>({});
  
  const handleButtonClick = (buttonId: string) => {
    setActiveButton(buttonId);
    setClickCounts(prev => ({
      ...prev,
      [buttonId]: (prev[buttonId] || 0) + 1
    }));
  };
  
  const buttons = [
    { id: "save", label: "Save", variant: "primary" as const },
    { id: "cancel", label: "Cancel", variant: "outline" as const },
    { id: "delete", label: "Delete", variant: "error" as const }
  ];
  
  return (
    <div class="flex gap-2 flex-wrap">
      {buttons.map(({ id, label, variant }) => (
        <Button
          key={id}
          variant={variant}
          onClick={() => handleButtonClick(id)}
          class={activeButton === id ? "ring-2 ring-offset-2" : ""}
        >
          {label} {clickCounts[id] ? \`(\${clickCounts[id]})\` : ""}
        </Button>
      ))}
      {activeButton && (
        <div class="text-sm text-base-content/70 mt-2">
          Last clicked: {activeButton}
        </div>
      )}
    </div>
  );
}`
          }
        ],
        hooks: ["useState"]
      },
      {
        id: "theme-toggle",
        name: "Theme Toggle",
        description: "Create a theme switching button with localStorage persistence",
        category: "Actions", 
        tags: ["theme", "toggle", "localStorage", "persistence"],
        path: "/islands/patterns/theme-toggle",
        keywords: ["theme", "dark", "light", "toggle"],
        complexity: "basic",
        baseComponent: "ThemeController",
        interactivityType: "state-management",
        example: {
          staticComponent: `<ThemeController 
  currentTheme="light" 
  themes={["light", "dark"]} 
  variant="dropdown" 
/>`,
          islandComponent: `<ThemeControllerIsland />`,
          explanation: "Transform a static ThemeController into an interactive island with localStorage persistence, error handling, and client-side hydration. This pattern shows how to add state management and persistence to any ui-lib component."
        },
        codeFiles: [
          {
            filename: "ThemeToggle.tsx",
            language: "tsx",
            content: `import { useState, useEffect } from "preact/hooks";
import { Button } from "@suppers/ui-lib";

export default function ThemeToggle() {
  const [theme, setTheme] = useState("light");
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    try {
      const saved = localStorage.getItem("theme") || "light";
      setTheme(saved);
      document.documentElement.setAttribute("data-theme", saved);
    } catch (error) {
      console.warn("Failed to load theme from localStorage:", error);
      setTheme("light");
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  const toggleTheme = () => {
    try {
      const newTheme = theme === "light" ? "dark" : "light";
      setTheme(newTheme);
      localStorage.setItem("theme", newTheme);
      document.documentElement.setAttribute("data-theme", newTheme);
    } catch (error) {
      console.error("Failed to save theme to localStorage:", error);
    }
  };
  
  if (isLoading) {
    return <Button disabled>Loading...</Button>;
  }
  
  return (
    <Button onClick={toggleTheme}>
      {theme === "light" ? "🌙 Dark" : "☀️ Light"}
    </Button>
  );
}`
          },
          {
            filename: "ThemeControllerIsland.tsx",
            language: "tsx",
            content: `import { useState, useEffect } from "preact/hooks";
import { ThemeController } from "@suppers/ui-lib";

export default function ThemeControllerIsland() {
  const [currentTheme, setCurrentTheme] = useState("light");
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    setIsClient(true);
    try {
      const saved = localStorage.getItem("theme") || "light";
      setCurrentTheme(saved);
      document.documentElement.setAttribute("data-theme", saved);
    } catch (error) {
      console.warn("Failed to load theme from localStorage:", error);
    }
  }, []);
  
  const handleThemeChange = (newTheme: string) => {
    try {
      setCurrentTheme(newTheme);
      localStorage.setItem("theme", newTheme);
      document.documentElement.setAttribute("data-theme", newTheme);
    } catch (error) {
      console.error("Failed to save theme:", error);
    }
  };
  
  if (!isClient) {
    return <div class="skeleton h-10 w-32"></div>;
  }
  
  return (
    <ThemeController
      currentTheme={currentTheme}
      onThemeChange={handleThemeChange}
      themes={["light", "dark", "cupcake", "bumblebee", "emerald", "corporate"]}
      variant="dropdown"
      showLabel={true}
    />
  );
}`
          },
          {
            filename: "AdvancedThemeToggle.tsx",
            language: "tsx",
            content: `import { useState, useEffect } from "preact/hooks";
import { Button, Dropdown } from "@suppers/ui-lib";

type Theme = "light" | "dark" | "auto";

export default function AdvancedThemeToggle() {
  const [theme, setTheme] = useState<Theme>("auto");
  const [systemTheme, setSystemTheme] = useState<"light" | "dark">("light");
  const [isClient, setIsClient] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    setIsClient(true);
    
    try {
      // Get saved theme or default to auto
      const saved = (localStorage.getItem("theme") as Theme) || "auto";
      const validThemes: Theme[] = ["light", "dark", "auto"];
      setTheme(validThemes.includes(saved) ? saved : "auto");
      
      // Detect system theme
      if (window.matchMedia) {
        const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
        setSystemTheme(mediaQuery.matches ? "dark" : "light");
        
        // Listen for system theme changes
        const handleChange = (e: MediaQueryListEvent) => {
          setSystemTheme(e.matches ? "dark" : "light");
        };
        
        mediaQuery.addEventListener("change", handleChange);
        return () => mediaQuery.removeEventListener("change", handleChange);
      }
    } catch (err) {
      console.warn("Failed to initialize theme toggle:", err);
      setError("Theme detection unavailable");
      setTheme("light");
    }
  }, []);
  
  useEffect(() => {
    if (!isClient) return;
    
    try {
      // Apply theme to document
      const effectiveTheme = theme === "auto" ? systemTheme : theme;
      document.documentElement.setAttribute("data-theme", effectiveTheme);
    } catch (err) {
      console.error("Failed to apply theme:", err);
    }
  }, [theme, systemTheme, isClient]);
  
  const handleThemeChange = (newTheme: Theme) => {
    try {
      setTheme(newTheme);
      localStorage.setItem("theme", newTheme);
      setError(null);
    } catch (err) {
      console.error("Failed to save theme:", err);
      setError("Failed to save theme preference");
    }
  };
  
  const getThemeIcon = () => {
    switch (theme) {
      case "light": return "☀️";
      case "dark": return "🌙";
      case "auto": return "🔄";
      default: return "🔄";
    }
  };
  
  const themes: { value: Theme; label: string; icon: string }[] = [
    { value: "light", label: "Light", icon: "☀️" },
    { value: "dark", label: "Dark", icon: "🌙" },
    { value: "auto", label: "Auto", icon: "🔄" }
  ];
  
  if (!isClient) {
    return <div class="skeleton h-10 w-32"></div>;
  }
  
  return (
    <div class="space-y-2">
      <Dropdown>
        <Button variant="outline">
          {getThemeIcon()} {theme.charAt(0).toUpperCase() + theme.slice(1)}
        </Button>
        <ul class="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52">
          {themes.map(({ value, label, icon }) => (
            <li key={value}>
              <button
                onClick={() => handleThemeChange(value)}
                class={theme === value ? "active" : ""}
              >
                {icon} {label}
                {value === "auto" && (
                  <span class="text-xs opacity-70">
                    ({systemTheme})
                  </span>
                )}
              </button>
            </li>
          ))}
        </ul>
      </Dropdown>
      {error && (
        <div class="text-error text-xs">{error}</div>
      )}
    </div>
  );
}`
          },
          {
            filename: "ThemeProvider.tsx",
            language: "tsx",
            content: `import { createContext } from "preact";
import { useState, useEffect, useContext } from "preact/hooks";
import { ComponentChildren } from "preact";

type Theme = "light" | "dark" | "auto";

interface ThemeContextValue {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  effectiveTheme: "light" | "dark";
  error: string | null;
  isLoading: boolean;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}

interface ThemeProviderProps {
  children: ComponentChildren;
  defaultTheme?: Theme;
}

export function ThemeProvider({ children, defaultTheme = "auto" }: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(defaultTheme);
  const [systemTheme, setSystemTheme] = useState<"light" | "dark">("light");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    try {
      // Load saved theme with validation
      const saved = localStorage.getItem("theme");
      const validThemes: Theme[] = ["light", "dark", "auto"];
      const savedTheme = saved && validThemes.includes(saved as Theme) 
        ? (saved as Theme) 
        : defaultTheme;
      
      setTheme(savedTheme);
      
      // Detect system theme preference
      if (window.matchMedia) {
        const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
        setSystemTheme(mediaQuery.matches ? "dark" : "light");
        
        // Listen for system theme changes
        const handleChange = (e: MediaQueryListEvent) => {
          try {
            setSystemTheme(e.matches ? "dark" : "light");
          } catch (err) {
            console.warn("Failed to update system theme:", err);
          }
        };
        
        mediaQuery.addEventListener("change", handleChange);
        
        // Cleanup listener on unmount
        return () => {
          try {
            mediaQuery.removeEventListener("change", handleChange);
          } catch (err) {
            console.warn("Failed to remove theme listener:", err);
          }
        };
      } else {
        setError("System theme detection not supported");
      }
    } catch (err) {
      console.error("Failed to initialize theme provider:", err);
      setError("Theme initialization failed");
      setTheme("light"); // Fallback to light theme
    } finally {
      setIsLoading(false);
    }
  }, [defaultTheme]);
  
  const effectiveTheme = theme === "auto" ? systemTheme : theme;
  
  useEffect(() => {
    if (isLoading) return;
    
    try {
      document.documentElement.setAttribute("data-theme", effectiveTheme);
    } catch (err) {
      console.error("Failed to apply theme to document:", err);
      setError("Failed to apply theme");
    }
  }, [effectiveTheme, isLoading]);
  
  const handleSetTheme = (newTheme: Theme) => {
    try {
      const validThemes: Theme[] = ["light", "dark", "auto"];
      if (!validThemes.includes(newTheme)) {
        throw new Error(\`Invalid theme: \${newTheme}\`);
      }
      
      setTheme(newTheme);
      localStorage.setItem("theme", newTheme);
      setError(null); // Clear any previous errors
    } catch (err) {
      console.error("Failed to set theme:", err);
      setError("Failed to save theme preference");
    }
  };
  
  return (
    <ThemeContext.Provider value={{
      theme,
      setTheme: handleSetTheme,
      effectiveTheme,
      error,
      isLoading
    }}>
      {children}
    </ThemeContext.Provider>
  );
}

// Example usage component
export function ThemeProviderExample() {
  const { theme, setTheme, effectiveTheme, error, isLoading } = useTheme();
  
  if (isLoading) {
    return <div class="skeleton h-8 w-32"></div>;
  }
  
  return (
    <div class="space-y-4">
      <div class="flex gap-2">
        <button 
          class="btn btn-sm"
          onClick={() => setTheme("light")}
          disabled={theme === "light"}
        >
          ☀️ Light
        </button>
        <button 
          class="btn btn-sm"
          onClick={() => setTheme("dark")}
          disabled={theme === "dark"}
        >
          🌙 Dark
        </button>
        <button 
          class="btn btn-sm"
          onClick={() => setTheme("auto")}
          disabled={theme === "auto"}
        >
          🔄 Auto
        </button>
      </div>
      
      <div class="text-sm">
        <div>Current: {theme}</div>
        <div>Effective: {effectiveTheme}</div>
      </div>
      
      {error && (
        <div class="alert alert-error">
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}`
          }
        ],
        hooks: ["useState", "useEffect"]
      }
    ],
    medium: [
      {
        id: "search-interface",
        name: "Search Interface",
        description: "Combine Input and Button components to create a functional search interface",
        category: "Input",
        tags: ["search", "input", "filtering", "form"],
        path: "/islands/patterns/search-interface",
        keywords: ["search", "filter", "input", "form"],
        complexity: "medium",
        baseComponent: "Input + Button",
        interactivityType: "form-handling",
        example: {
          staticComponent: `<Input placeholder="Search..." />
<Button>Search</Button>`,
          islandComponent: `<SearchInterface />`,
          explanation: "Create a working search with state management and filtering"
        },
        codeFiles: [
          {
            filename: "SearchInterface.tsx",
            language: "tsx", 
            content: `import { useState } from "preact/hooks";
import { Input, Button, Card } from "@suppers/ui-lib";

interface SearchInterfaceProps {
  items: string[];
}

export default function SearchInterface({ items }: SearchInterfaceProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState(items);
  
  const handleSearch = () => {
    const filtered = items.filter(item => 
      item.toLowerCase().includes(query.toLowerCase())
    );
    setResults(filtered);
  };
  
  return (
    <div class="space-y-4">
      <div class="flex gap-2">
        <Input 
          value={query}
          onInput={(e) => setQuery(e.currentTarget.value)}
          placeholder="Search items..."
          class="flex-1"
        />
        <Button onClick={handleSearch}>Search</Button>
      </div>
      
      <div class="space-y-2">
        {results.map((item, index) => (
          <Card key={index} class="p-3">
            {item}
          </Card>
        ))}
      </div>
    </div>
  );
}`
          }
        ],
        hooks: ["useState"]
      }
    ],
    advanced: [
      {
        id: "data-table",
        name: "Interactive Data Table",
        description: "Transform Table component into a fully interactive data grid with sorting and pagination",
        category: "Display",
        tags: ["table", "sorting", "pagination", "data"],
        path: "/islands/patterns/data-table",
        keywords: ["table", "data", "sort", "pagination"],
        complexity: "advanced",
        baseComponent: "Table",
        interactivityType: "data-management",
        example: {
          staticComponent: `<Table>
  <thead>...</thead>
  <tbody>...</tbody>
</Table>`,
          islandComponent: `<InteractiveDataTable />`,
          explanation: "Add sorting, filtering, and pagination to a static table"
        },
        codeFiles: [
          {
            filename: "InteractiveDataTable.tsx",
            language: "tsx",
            content: `import { useState, useMemo } from "preact/hooks";
import { Table, Button, Input } from "@suppers/ui-lib";

interface DataItem {
  id: number;
  name: string;
  email: string;
  role: string;
}

interface InteractiveDataTableProps {
  data: DataItem[];
}

export default function InteractiveDataTable({ data }: InteractiveDataTableProps) {
  const [sortField, setSortField] = useState<keyof DataItem>("name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [filter, setFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  
  const filteredAndSortedData = useMemo(() => {
    let result = data.filter(item =>
      Object.values(item).some(value =>
        value.toString().toLowerCase().includes(filter.toLowerCase())
      )
    );
    
    result.sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];
      const modifier = sortDirection === "asc" ? 1 : -1;
      return aVal < bVal ? -modifier : aVal > bVal ? modifier : 0;
    });
    
    return result;
  }, [data, sortField, sortDirection, filter]);
  
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredAndSortedData.slice(start, start + itemsPerPage);
  }, [filteredAndSortedData, currentPage]);
  
  const totalPages = Math.ceil(filteredAndSortedData.length / itemsPerPage);
  
  const handleSort = (field: keyof DataItem) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };
  
  return (
    <div class="space-y-4">
      <Input
        placeholder="Filter data..."
        value={filter}
        onInput={(e) => setFilter(e.currentTarget.value)}
      />
      
      <Table>
        <thead>
          <tr>
            <th>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => handleSort("name")}
              >
                Name {sortField === "name" && (sortDirection === "asc" ? "↑" : "↓")}
              </Button>
            </th>
            <th>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => handleSort("email")}
              >
                Email {sortField === "email" && (sortDirection === "asc" ? "↑" : "↓")}
              </Button>
            </th>
            <th>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => handleSort("role")}
              >
                Role {sortField === "role" && (sortDirection === "asc" ? "↑" : "↓")}
              </Button>
            </th>
          </tr>
        </thead>
        <tbody>
          {paginatedData.map((item) => (
            <tr key={item.id}>
              <td>{item.name}</td>
              <td>{item.email}</td>
              <td>{item.role}</td>
            </tr>
          ))}
        </tbody>
      </Table>
      
      <div class="flex justify-between items-center">
        <span>
          Showing {paginatedData.length} of {filteredAndSortedData.length} items
        </span>
        <div class="flex gap-2">
          <Button 
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(currentPage - 1)}
          >
            Previous
          </Button>
          <span class="px-3 py-2">
            Page {currentPage} of {totalPages}
          </span>
          <Button 
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(currentPage + 1)}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}`
          }
        ],
        hooks: ["useState", "useMemo"]
      }
    ]
  },
  categories: [
    {
      name: "State Management",
      description: "Patterns for managing component state and user interactions",
      patterns: ["button-with-state", "theme-toggle"]
    },
    {
      name: "Form Handling", 
      description: "Interactive forms and input processing patterns",
      patterns: ["search-interface"]
    },
    {
      name: "Data Management",
      description: "Complex data manipulation and display patterns", 
      patterns: ["data-table"]
    }
  ],
  tutorials: [
    {
      title: "Creating Your First Island",
      description: "Step-by-step guide to converting a static component into an interactive island",
      steps: [
        {
          title: "Start with a Static Component",
          content: "Begin with any ui-lib component that you want to make interactive",
          code: `import { Button } from "@suppers/ui-lib";

export function StaticButton() {
  return <Button>Click me</Button>;
}`
        },
        {
          title: "Move to Islands Directory",
          content: "Create a new file in your /islands/ directory. Islands are automatically hydrated on the client.",
          code: `// islands/InteractiveButton.tsx
import { Button } from "@suppers/ui-lib";

export default function InteractiveButton() {
  return <Button>Click me</Button>;
}`
        },
        {
          title: "Add State and Interactivity",
          content: "Import hooks from preact/hooks and add interactive behavior",
          code: `import { useState } from "preact/hooks";
import { Button } from "@suppers/ui-lib";

export default function InteractiveButton() {
  const [count, setCount] = useState(0);
  
  return (
    <Button onClick={() => setCount(count + 1)}>
      Clicked {count} times
    </Button>
  );
}`
        },
        {
          title: "Use in Your Route",
          content: "Import and use your island in any route component",
          code: `// routes/example.tsx
import InteractiveButton from "../islands/InteractiveButton.tsx";

export default function ExamplePage() {
  return (
    <div>
      <h1>My Page</h1>
      <InteractiveButton />
    </div>
  );
}`
        }
      ]
    }
  ]
};

// Utility functions for working with island patterns
const allPatterns = [
  ...islandPatterns.patterns.basic,
  ...islandPatterns.patterns.medium,
  ...islandPatterns.patterns.advanced
];

export const getIslandsByCategory = (category: string) => {
  return allPatterns.filter((pattern) => pattern.category.toLowerCase() === category.toLowerCase());
};

export const getIslandByPath = (path: string) => {
  return allPatterns.find((pattern) => pattern.path === path);
};

export const getAllIslandCategories = () => {
  const categories = new Set(allPatterns.map((pattern) => pattern.category));
  return Array.from(categories);
};

export const getIslandCount = () => allPatterns.length;

export const getIslandCategoryCount = (category: string) => {
  return allPatterns.filter((pattern) => pattern.category.toLowerCase() === category.toLowerCase())
    .length;
};

export const getIslandsByInteractivity = (level: "basic" | "medium" | "advanced") => {
  return islandPatterns.patterns[level];
};

export const getIslandsWithHook = (hook: string) => {
  return allPatterns.filter((pattern) => pattern.hooks?.includes(hook));
};
