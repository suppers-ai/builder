import { computed, useSignal } from "@preact/signals";
import { Badge, Button, Card, Input, Modal, Select } from "@suppers/ui-lib";
import type { ApplicationTemplate } from "./MarketplaceHomepage.tsx";

interface TemplateGalleryProps {
  templates: ApplicationTemplate[];
  onSelectTemplate: (template: ApplicationTemplate) => void;
}

export default function TemplateGallery({
  templates,
  onSelectTemplate,
}: TemplateGalleryProps) {
  const selectedCategory = useSignal<string>("all");
  const selectedComplexity = useSignal<string>("all");
  const searchQuery = useSignal<string>("");
  const previewTemplate = useSignal<ApplicationTemplate | null>(null);

  // Get unique categories and complexities
  const categories = computed(() => {
    const cats = Array.from(new Set(templates.map((t) => t.category)));
    return ["all", ...cats];
  });

  const complexities = computed(() => {
    const comps = Array.from(new Set(templates.map((t) => t.complexity)));
    return ["all", ...comps];
  });

  // Convert to Select options
  const categoryOptions = computed(() => 
    categories.value.map(category => ({
      value: category,
      label: category === "all" 
        ? "All Categories" 
        : category.charAt(0).toUpperCase() + category.slice(1)
    }))
  );

  const complexityOptions = computed(() => 
    complexities.value.map(complexity => ({
      value: complexity,
      label: complexity === "all" 
        ? "All Levels" 
        : complexity.charAt(0).toUpperCase() + complexity.slice(1)
    }))
  );

  // Filter templates based on selected filters and search
  const filteredTemplates = computed(() => {
    return templates.filter((template) => {
      const matchesCategory = selectedCategory.value === "all" ||
        template.category === selectedCategory.value;

      const matchesComplexity = selectedComplexity.value === "all" ||
        template.complexity === selectedComplexity.value;

      const matchesSearch = searchQuery.value === "" ||
        template.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
        template.description.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
        template.features.some((feature) =>
          feature.toLowerCase().includes(searchQuery.value.toLowerCase())
        );

      return matchesCategory && matchesComplexity && matchesSearch;
    });
  });

  const getCategoryColor = (category: string) => {
    const colors = {
      business: "badge-primary",
      portfolio: "badge-secondary",
      blog: "badge-accent",
      ecommerce: "badge-success",
      dashboard: "badge-warning",
    };
    return colors[category as keyof typeof colors] || "badge-neutral";
  };

  const getComplexityColor = (complexity: string) => {
    const colors = {
      beginner: "text-success",
      intermediate: "text-warning",
      advanced: "text-error",
    };
    return colors[complexity as keyof typeof colors] || "text-neutral";
  };

  const handlePreviewTemplate = (template: ApplicationTemplate) => {
    previewTemplate.value = template;
  };

  const closePreview = () => {
    previewTemplate.value = null;
  };

  const handleUseTemplate = (template: ApplicationTemplate) => {
    closePreview();
    onSelectTemplate(template);
  };

  return (
    <div class="py-16 bg-base-100">
      <div class="container mx-auto px-4">
        {/* Header */}
        <div class="text-center mb-12">
          <h1 class="text-4xl font-bold text-base-content mb-4">
            Application Templates
          </h1>
          <p class="text-xl text-base-content/80 max-w-3xl mx-auto">
            Browse our curated collection of application templates. Filter by category, complexity,
            or search for specific features.
          </p>
        </div>

        {/* Filters */}
        <div class="mb-8">
          <Card class="p-6">
            <div class="grid md:grid-cols-4 gap-4 items-end">
              {/* Search */}
              <div class="md:col-span-2">
                <label class="label">
                  <span class="label-text">Search templates</span>
                </label>
                <Input
                  type="text"
                  placeholder="Search by name, description, or features..."
                  value={searchQuery.value}
                  onInput={(e) => searchQuery.value = (e.target as HTMLInputElement).value}
                  class="w-full"
                />
              </div>

              {/* Category Filter */}
              <div>
                <label class="label">
                  <span class="label-text">Category</span>
                </label>
                <Select
                  value={selectedCategory.value}
                  options={categoryOptions.value}
                  onChange={(e) => selectedCategory.value = (e.target as HTMLSelectElement).value}
                  bordered
                  class="w-full"
                />
              </div>

              {/* Complexity Filter */}
              <div>
                <label class="label">
                  <span class="label-text">Complexity</span>
                </label>
                <Select
                  value={selectedComplexity.value}
                  options={complexityOptions.value}
                  onChange={(e) => selectedComplexity.value = (e.target as HTMLSelectElement).value}
                  bordered
                  class="w-full"
                />
              </div>
            </div>

            {/* Active Filters */}
            <div class="flex flex-wrap gap-2 mt-4">
              {selectedCategory.value !== "all" && (
                <Badge
                  color="primary"
                  class="cursor-pointer"
                  onClick={() => selectedCategory.value = "all"}
                >
                  {selectedCategory.value} ✕
                </Badge>
              )}
              {selectedComplexity.value !== "all" && (
                <Badge
                  color="secondary"
                  class="cursor-pointer"
                  onClick={() => selectedComplexity.value = "all"}
                >
                  {selectedComplexity.value} ✕
                </Badge>
              )}
              {searchQuery.value && (
                <Badge
                  color="accent"
                  class="cursor-pointer"
                  onClick={() => searchQuery.value = ""}
                >
                  "{searchQuery.value}" ✕
                </Badge>
              )}
            </div>
          </Card>
        </div>

        {/* Results Count */}
        <div class="mb-6">
          <p class="text-base-content/70">
            Showing {filteredTemplates.value.length} of {templates.length} templates
          </p>
        </div>

        {/* Templates Grid */}
        {filteredTemplates.value.length > 0
          ? (
            <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredTemplates.value.map((template) => (
                <Card
                  key={template.id}
                  class="hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:-translate-y-1"
                >
                  <div class="relative">
                    {/* Template Preview Image */}
                    <div class="h-48 bg-gradient-to-br from-base-300 to-base-100 rounded-t-lg flex items-center justify-center">
                      <div class="text-6xl opacity-50">
                        {template.category === "business" && "🏢"}
                        {template.category === "portfolio" && "🎨"}
                        {template.category === "blog" && "📝"}
                        {template.category === "ecommerce" && "🛒"}
                        {template.category === "dashboard" && "📊"}
                      </div>
                    </div>

                    {/* Category Badge */}
                    <Badge class={`${getCategoryColor(template.category)} absolute top-4 right-4`}>
                      {template.category}
                    </Badge>
                  </div>

                  <div class="p-6">
                    <div class="flex justify-between items-start mb-3">
                      <h3 class="text-xl font-semibold text-base-content">
                        {template.name}
                      </h3>
                      <div class={`text-sm font-medium ${getComplexityColor(template.complexity)}`}>
                        {template.complexity}
                      </div>
                    </div>

                    <p class="text-base-content/70 text-sm mb-4 line-clamp-2">
                      {template.description}
                    </p>

                    {/* Features */}
                    <div class="flex flex-wrap gap-1 mb-4">
                      {template.features.slice(0, 3).map((feature) => (
                        <Badge key={feature} variant="outline" size="sm">
                          {feature}
                        </Badge>
                      ))}
                      {template.features.length > 3 && (
                        <Badge variant="outline" size="sm">
                          +{template.features.length - 3} more
                        </Badge>
                      )}
                    </div>

                    <div class="flex justify-between items-center">
                      <span class="text-xs text-base-content/60">
                        ⏱️ {template.estimatedTime}
                      </span>
                      <div class="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handlePreviewTemplate(template)}
                        >
                          Preview
                        </Button>
                        <Button
                          size="sm"
                          color="primary"
                          onClick={() => onSelectTemplate(template)}
                        >
                          Use Template
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )
          : (
            <div class="text-center py-16">
              <div class="text-6xl mb-4 opacity-50">🔍</div>
              <h3 class="text-2xl font-semibold text-base-content mb-2">
                No templates found
              </h3>
              <p class="text-base-content/70 mb-6">
                Try adjusting your filters or search terms to find more templates.
              </p>
              <Button
                onClick={() => {
                  selectedCategory.value = "all";
                  selectedComplexity.value = "all";
                  searchQuery.value = "";
                }}
              >
                Clear All Filters
              </Button>
            </div>
          )}

        {/* Template Preview Modal */}
        {previewTemplate.value && (
          <Modal
            isOpen={true}
            onClose={closePreview}
            title={previewTemplate.value.name}
            size="lg"
          >
            <div class="space-y-6">
              {/* Template Preview */}
              <div class="h-64 bg-gradient-to-br from-base-300 to-base-100 rounded-lg flex items-center justify-center">
                <div class="text-8xl opacity-50">
                  {previewTemplate.value.category === "business" && "🏢"}
                  {previewTemplate.value.category === "portfolio" && "🎨"}
                  {previewTemplate.value.category === "blog" && "📝"}
                  {previewTemplate.value.category === "ecommerce" && "🛒"}
                  {previewTemplate.value.category === "dashboard" && "📊"}
                </div>
              </div>

              {/* Template Info */}
              <div class="space-y-4">
                <div class="flex justify-between items-start">
                  <div>
                    <h3 class="text-2xl font-bold text-base-content mb-2">
                      {previewTemplate.value.name}
                    </h3>
                    <div class="flex gap-2 items-center">
                      <Badge class={getCategoryColor(previewTemplate.value.category)}>
                        {previewTemplate.value.category}
                      </Badge>
                      <span
                        class={`text-sm font-medium ${
                          getComplexityColor(previewTemplate.value.complexity)
                        }`}
                      >
                        {previewTemplate.value.complexity}
                      </span>
                      <span class="text-sm text-base-content/60">
                        ⏱️ {previewTemplate.value.estimatedTime}
                      </span>
                    </div>
                  </div>
                </div>

                <p class="text-base-content/80">
                  {previewTemplate.value.description}
                </p>

                {/* Features List */}
                <div>
                  <h4 class="font-semibold text-base-content mb-2">Features:</h4>
                  <div class="flex flex-wrap gap-2">
                    {previewTemplate.value.features.map((feature) => (
                      <Badge key={feature} variant="outline">
                        {feature}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div class="flex justify-end gap-3 pt-4 border-t">
                {previewTemplate.value.preview.demoUrl && (
                  <Button
                    as="a"
                    href={previewTemplate.value.preview.demoUrl}
                    target="_blank"
                    variant="outline"
                  >
                    View Demo
                  </Button>
                )}
                <Button
                  color="primary"
                  onClick={() => handleUseTemplate(previewTemplate.value!)}
                >
                  Use This Template
                </Button>
              </div>
            </div>
          </Modal>
        )}
      </div>
    </div>
  );
}
