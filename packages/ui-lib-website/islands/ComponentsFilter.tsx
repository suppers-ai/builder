import {
  Badge,
  Button,
  ComponentPreviewCard,
  Avatar,
  Toggle,
} from "@suppers/ui-lib";
import { useState, useEffect } from "preact/hooks";
import { getComponentPreviewData } from "@suppers/shared/utils/preview-generator.ts";

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

// Component to render preview from examples.md data
function ComponentPreview({ componentName }: { componentName: string }) {
  const [previewData, setPreviewData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPreview() {
      try {
        const data = await getComponentPreviewData(componentName);
        setPreviewData(data);
      } catch (error) {
        console.warn(`Failed to load preview for ${componentName}:`, error);
      } finally {
        setLoading(false);
      }
    }
    loadPreview();
  }, [componentName]);

  if (loading) {
    return <div class="text-xs opacity-50">Loading...</div>;
  }

  if (!previewData || previewData.length === 0) {
    // Fallback to hardcoded previews for components without preview data
    return getHardcodedPreview(componentName);
  }

  // Render first preview from examples.md
  const firstPreview = previewData[0];
  
  if (firstPreview.buttons) {
    return (
      <div class="flex gap-2 flex-wrap">
        {firstPreview.buttons.slice(0, 3).map((btn: any, index: number) => (
          <Button key={index} {...btn.props}>
            {btn.content}
          </Button>
        ))}
      </div>
    );
  }
  
  if (firstPreview.components) {
    return (
      <div class="flex gap-2 flex-wrap">
        {firstPreview.components.slice(0, 2).map((comp: any, index: number) => {
          // This would need component-specific rendering logic
          // For now, show a simplified preview
          return (
            <div key={index} class="text-xs bg-base-200 rounded px-2 py-1">
              {comp.children || componentName}
            </div>
          );
        })}
      </div>
    );
  }
  
  return <div class="text-xs opacity-50">Preview available</div>;
}

// Fallback hardcoded previews for components without preview data
function getHardcodedPreview(componentName: string) {
  switch (componentName) {
    case "Button":
      return (
        <div class="flex gap-2">
          <Button color="primary">Primary</Button>
          <Button variant="outline">Outline</Button>
        </div>
      );
    case "Avatar":
      return (
        <div class="flex gap-2">
          <Avatar src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.jpg" />
          <Avatar initials="AB" />
        </div>
      );
    case "Badge":
      return (
        <div class="flex gap-2">
          <Badge color="primary">New</Badge>
          <Badge color="success">Active</Badge>
          <Badge variant="outline">Badge</Badge>
        </div>
      );
    case "Toggle":
      return (
        <div class="flex gap-2">
          <Toggle checked />
          <Toggle color="primary" checked />
        </div>
      );
    default:
      return <div class="text-xs opacity-50">Preview not available</div>;
  }
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
              size="sm"
              color={selectedCategory === category.name ? category.color : undefined}
              variant={selectedCategory === category.name ? undefined : "outline"}
              onClick={() => handleCategoryChange(category.name)}
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