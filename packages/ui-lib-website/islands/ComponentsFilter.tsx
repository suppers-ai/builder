import {
    Badge,
    Button,
    ComponentPreviewCard,
  } from "@suppers/ui-lib";
  import type { ButtonProps } from "@suppers/ui-lib";
  import { useState } from "preact/hooks";
  import { flatComponentsMetadata } from "../../ui-lib/components/metadata.tsx";
  
  interface ComponentMeta {
    name: string;
    description: string;
    path: string;
    category: string;
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
  
  // Component to render preview from metadata files
  function ComponentPreview({ componentName }: { componentName: string }) {
    // Find the component metadata
    const componentMetadata = flatComponentsMetadata.find(comp => comp.name === componentName);
    
    if (componentMetadata && componentMetadata.preview) {
      // Use the preview from metadata
      return componentMetadata.preview;
    }
    
    // Fallback if no metadata preview is found
    return <div class="text-xs opacity-50">Preview not available</div>;
  }
  
  
  export default function ComponentsFilterInteractive({ components, categories, initialCategory = "All" }: ComponentsFilterProps) {
    const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  
    // Filter components based on selected category
    const filteredComponents = selectedCategory === "All"
      ? components
      : components.filter((component) => component.category === selectedCategory);
  
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
          {filteredComponents.map((component) => (
            <ComponentPreviewCard
              key={component.name}
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