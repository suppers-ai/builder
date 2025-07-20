import {
  Badge,
  Button,
  ComponentPreviewCard,
  Avatar,
  Toggle,
} from "@suppers/ui-lib";
import { useState } from "preact/hooks";

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

// Create preview JSX based on component name
function getComponentPreview(componentName: string) {
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
      return <div class="text-xs opacity-50">Preview</div>;
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
            preview={getComponentPreview(component.name)}
            color={component.categoryColor}
          />
        ))}
      </div>
    </>
  );
}