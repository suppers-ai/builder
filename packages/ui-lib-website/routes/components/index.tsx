import { Breadcrumbs } from "@suppers/ui-lib";
import { PageProps } from "fresh";
import ComponentsFilterInteractive from "../../islands/ComponentsFilter.tsx";

// Import metadata using the new organized structure
import {
  flatComponentsMetadata,
  actionComponentsMetadata,
  displayComponentsMetadata,
  feedbackComponentsMetadata,
  inputComponentsMetadata,
  layoutComponentsMetadata,
  mockupComponentsMetadata,
  navigationComponentsMetadata,
} from "../../../ui-lib/components/metadata.tsx";

interface Component {
  name: string;
  description: string;
  path: string;
  category: string;
  categoryColor: string;
  preview: any;
  tags: string[];
}

const components: Component[] = flatComponentsMetadata;

console.log("Test metadata components loaded:", components.length);

const categories = [
  { name: "All", count: components.length, color: "neutral" },
  { name: "Actions", count: actionComponentsMetadata.length, color: "primary" },
  { name: "Display", count: displayComponentsMetadata.length, color: "secondary" },
  { name: "Navigation", count: navigationComponentsMetadata.length, color: "accent" },
  { name: "Input", count: inputComponentsMetadata.length, color: "info" },
  { name: "Layout", count: layoutComponentsMetadata.length, color: "success" },
  { name: "Feedback", count: feedbackComponentsMetadata.length, color: "warning" },
  { name: "Mockup", count: mockupComponentsMetadata.length, color: "error" },
];

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
          {/* TEST: Interactive Components Filter using metadata - handles all filtering client-side */}
          <ComponentsFilterInteractive
            components={components.map(({ preview, ...comp }) => comp)}
            categories={categories}
            initialCategory={selectedCategory}
          />
        </div>
      </div>
    </>
  );
}
