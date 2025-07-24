import { Badge, Button, ComponentPreviewCard } from "@suppers/ui-lib";
import type { ButtonProps } from "@suppers/ui-lib";
import { ComponentCategory } from "@suppers/ui-lib/components/types.ts";
import { useEffect, useState } from "preact/hooks";
import { flatComponentsMetadata } from "../../ui-lib/components/metadata.tsx";
import components from "../routes/components/index.tsx";

interface ComponentMeta {
  name: string;
  description: string;
  path: string;
  category: ComponentCategory;
  categoryColor: string;
  tags: string[];
}

interface Category {
  name: string;
  count: number;
  color: "neutral" | "primary" | "secondary" | "accent" | "info" | "success" | "warning" | "error";
}

interface ComponentsFilterProps {
  components: ComponentMeta[];
  categories: Category[];
  initialCategory?: string;
}

// Helper function to provide default Button props
function getDefaultButtonProps(overrides: Partial<ButtonProps> = {}) {
  return {
    size: "sm" as const,
    type: "button" as const,
    active: false,
    loading: false,
    disabled: false,
    wide: false,
    square: false,
    glass: false,
    noAnimation: false,
    circle: false,
    ...overrides,
  };
}

// Component to render preview from metadata files with error boundary
function ComponentPreview({ componentName }: { componentName: string }) {
  const [hasError, setHasError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Reset error state when component name changes
    setHasError(false);
    setIsLoaded(false);

    // Small delay to prevent rapid re-renders
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 50);

    return () => clearTimeout(timer);
  }, [componentName]);

  if (hasError) {
    return <div class="text-xs opacity-50 text-error">Preview error</div>;
  }

  if (!isLoaded) {
    return <div class="text-xs opacity-50">Loading preview...</div>;
  }

  try {
    // Find the component metadata
    const componentMetadata = flatComponentsMetadata.find((comp) => comp.name === componentName);

    if (componentMetadata && componentMetadata.preview) {
      // Wrap the preview in a safe container with strict constraints
      return (
        <div
          class=""
          style="max-height: 150px"
          onError={() => setHasError(true)}
        >
          <div class="flex items-center justify-center bg-base-200/50">
            {componentMetadata.preview}
          </div>
        </div>
      );
    }
  } catch (error) {
    console.warn(`Error rendering preview for ${componentName}:`, error);
    setHasError(true);
    return <div class="text-xs opacity-50 text-error">Preview error</div>;
  }

  // Fallback if no metadata preview is found
  return <div class="text-xs opacity-50">Preview not available</div>;
}

export default function ComponentsFilterInteractive(
  { components, categories, initialCategory = "All" }: ComponentsFilterProps,
) {
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);

  // Map category display names to enum values
  const categoryNameToEnum = (categoryName: string): ComponentCategory | null => {
    switch (categoryName) {
      case "Actions": return ComponentCategory.ACTION;
      case "Display": return ComponentCategory.DISPLAY;
      case "Input": return ComponentCategory.INPUT;
      case "Layout": return ComponentCategory.LAYOUT;
      case "Navigation": return ComponentCategory.NAVIGATION;
      case "Feedback": return ComponentCategory.FEEDBACK;
      case "Mockup": return ComponentCategory.MOCKUP;
      default: return null;
    }
  };

  // Filter components based on selected category
  const filteredComponents = selectedCategory === "All"
    ? components
    : components.filter((component) => {
        const enumValue = categoryNameToEnum(selectedCategory);
        return enumValue && component.category === enumValue;
      });

  const handleCategoryChange = (categoryName: string) => {
    setSelectedCategory(categoryName);
  };

  return (
    <>
      {/* Category Filters */}
      <div class="mb-8">
        <div class="flex flex-wrap gap-2">
          {categories.map((category) => (
            <Button
              key={category.name}
              {...getDefaultButtonProps({
                color: selectedCategory === category.name ? category.color : undefined,
                variant: selectedCategory === category.name ? undefined : "outline",
                onClick: () => handleCategoryChange(category.name),
              })}
            >
              {category.name}
              <Badge size="sm" class="ml-2">
                {category.name === "All" ? components.length : category.count}
              </Badge>
            </Button>
          ))}
        </div>
      </div>

      {/* Results Header */}
      <div class="flex justify-between items-center mb-6">
        <div>
          <h2 class="text-xl font-semibold">
            {filteredComponents.length} Components
            {selectedCategory !== "All" && (
              <span class="text-base text-base-content/60 ml-2">
                in {selectedCategory}
              </span>
            )}
          </h2>
        </div>
      </div>

      {/* Components Grid */}
      <div class="card-grid-responsive">
        {filteredComponents.map((component, index) => (
          <ComponentPreviewCard
            key={`${component.name}-${component.category}-${index}`}
            name={component.name}
            description={component.description}
            path={component.path}
            category={component.category}
            preview={<ComponentPreview componentName={component.name} />}
            color={component.categoryColor}
          />
        ))}
      </div>
    </>
  );
}
