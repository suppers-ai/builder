import { Breadcrumbs } from "@suppers/ui-lib";
import { PageProps } from "fresh";

// Import metadata using the new organized structure
import {
  componentsMetadata,
  flatComponentsMetadata,
} from "../../../ui-lib/components/metadata.tsx";
import ComponentsFilterInteractive from "../../islands/ComponentsFilter.tsx";

const allComponents = flatComponentsMetadata;

// Create a serializable version of components data (excluding functions and JSX)
const serializableComponents = flatComponentsMetadata.map((comp) => ({
  name: comp.name,
  description: comp.description,
  path: comp.path,
  category: comp.category,
  tags: comp.tags || [],
  // Exclude: preview, schema, examples, and other non-serializable properties
}));

const categories = [
  { name: "All", count: allComponents.length, color: "neutral" as const },
  { name: "Actions", count: componentsMetadata.action.length, color: "primary" as const },
  { name: "Display", count: componentsMetadata.display.length, color: "secondary" as const },
  { name: "Navigation", count: componentsMetadata.navigation.length, color: "accent" as const },
  { name: "Input", count: componentsMetadata.input.length, color: "info" as const },
  { name: "Layout", count: componentsMetadata.layout.length, color: "success" as const },
  { name: "Feedback", count: componentsMetadata.feedback.length, color: "warning" as const },
  { name: "Mockup", count: componentsMetadata.mockup.length, color: "error" as const },
];

console.log("Test metadata components loaded:", allComponents.length);

export default function ComponentsPage({ url }: PageProps) {
  // Get category filter from URL parameters
  const selectedCategory = url.searchParams.get("category") || "All";
  return (
    <>
      {/* Page Header */}
      <header class="bg-gradient-to-r from-primary/5 to-secondary/5 border-b border-base-300">
        <div class="px-4 lg:px-6 pt-20 pb-8">
          <div class="max-w-4xl">
            <h1 class="text-3xl lg:text-4xl font-bold text-base-content mb-2">
              Component Library
            </h1>
            <p class="text-lg text-base-content/70 max-w-2xl">
              Explore our comprehensive collection of DaisyUI components built for Fresh 2.0
            </p>
          </div>
        </div>
      </header>

      {/* Breadcrumbs */}
      <nav class="bg-base-200/50 border-b border-base-300">
        <div class="px-4 lg:px-6 py-3">
          <Breadcrumbs
            size="sm"
            items={[
              { label: "Home", href: "/" },
              { label: "Components", active: true },
            ]}
          />
        </div>
      </nav>
  
      <div class="px-4 lg:px-6 py-8">
        <div class="max-w-7xl mx-auto">
          {/* Interactive Components Filter using serializable metadata */}
          <ComponentsFilterInteractive
            components={serializableComponents.map((comp) => ({
              ...comp,
              categoryColor: comp.category,
            }))}
            categories={categories}
            initialCategory={selectedCategory}
          />
        </div>
      </div>
    </>
  );
}
