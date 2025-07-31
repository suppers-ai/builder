import { useSignal } from "@preact/signals";
import { useEffect } from "preact/hooks";
import { Button, Card, Hero } from "@suppers/ui-lib";
import type { Tables } from "@suppers/shared/generated/database-types";

// Application template interface based on design document
export interface ApplicationTemplate {
  id: string;
  name: string;
  description: string;
  category: "business" | "portfolio" | "blog" | "ecommerce" | "dashboard";
  preview: {
    image: string;
    demoUrl?: string;
  };
  features: string[];
  complexity: "beginner" | "intermediate" | "advanced";
  estimatedTime: string;
}

interface MarketplaceHomepageProps {
  templates?: ApplicationTemplate[];
  recentApps?: Tables<"applications">[];
}

export default function MarketplaceHomepage({
  templates = [],
  recentApps = [],
}: MarketplaceHomepageProps) {
  const selectedTemplate = useSignal<ApplicationTemplate | null>(null);
  const isLoading = useSignal(false);

  // Mock templates for now - these would come from the database/API
  const mockTemplates: ApplicationTemplate[] = [
    {
      id: "business-landing",
      name: "Business Landing Page",
      description:
        "Professional landing page template with hero section, features, and contact form",
      category: "business",
      preview: {
        image: "/templates/business-landing.png",
        demoUrl: "https://demo.example.com/business",
      },
      features: ["Responsive Design", "Contact Form", "SEO Optimized", "Fast Loading"],
      complexity: "beginner",
      estimatedTime: "5 minutes",
    },
    {
      id: "portfolio-creative",
      name: "Creative Portfolio",
      description: "Showcase your work with this modern portfolio template",
      category: "portfolio",
      preview: {
        image: "/templates/portfolio-creative.png",
        demoUrl: "https://demo.example.com/portfolio",
      },
      features: ["Gallery", "Project Showcase", "About Section", "Contact"],
      complexity: "intermediate",
      estimatedTime: "8 minutes",
    },
    {
      id: "blog-minimal",
      name: "Minimal Blog",
      description: "Clean and simple blog template for content creators",
      category: "blog",
      preview: {
        image: "/templates/blog-minimal.png",
        demoUrl: "https://demo.example.com/blog",
      },
      features: ["Article Management", "Categories", "Search", "Comments"],
      complexity: "intermediate",
      estimatedTime: "10 minutes",
    },
    {
      id: "ecommerce-store",
      name: "E-commerce Store",
      description: "Full-featured online store with product catalog and checkout",
      category: "ecommerce",
      preview: {
        image: "/templates/ecommerce-store.png",
        demoUrl: "https://demo.example.com/store",
      },
      features: ["Product Catalog", "Shopping Cart", "Payment Integration", "Admin Panel"],
      complexity: "advanced",
      estimatedTime: "15 minutes",
    },
    {
      id: "dashboard-admin",
      name: "Admin Dashboard",
      description: "Comprehensive admin dashboard with charts and data management",
      category: "dashboard",
      preview: {
        image: "/templates/dashboard-admin.png",
        demoUrl: "https://demo.example.com/dashboard",
      },
      features: ["Data Visualization", "User Management", "Analytics", "Reports"],
      complexity: "advanced",
      estimatedTime: "12 minutes",
    },
  ];

  const displayTemplates = templates.length > 0 ? templates : mockTemplates;

  const handleCreateNew = () => {
    window.location.href = "/create";
  };

  const handleSelectTemplate = (template: ApplicationTemplate) => {
    selectedTemplate.value = template;
    // Navigate to create page with template pre-selected
    window.location.href = `/create?template=${template.id}`;
  };

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

  return (
    <div class="min-h-screen">
      {/* Hero Section */}
      <Hero
        title="🚀 Application Marketplace"
        subtitle="Create, customize, and deploy applications with ease using our visual builder and template library."
        primaryCTA={{
          text: "Create New App",
          onClick: handleCreateNew,
        }}
        secondaryCTA={{
          text: "Browse Templates",
          href: "#templates",
        }}
        class="min-h-screen bg-gradient-to-br from-primary/20 via-secondary/10 to-accent/20"
        variant="centered"
        size="full"
      />

      {/* Recent Applications Section */}
      {recentApps.length > 0 && (
        <section class="py-16 bg-base-100">
          <div class="container mx-auto px-4">
            <div class="flex justify-between items-center mb-8">
              <h2 class="text-3xl font-bold text-base-content">
                Recent Applications
              </h2>
              <Button
                as="a"
                href="/apps"
                variant="outline"
                color="primary"
              >
                View All
              </Button>
            </div>

            <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recentApps.slice(0, 6).map((app) => (
                <Card key={app.id} class="hover:shadow-lg transition-shadow duration-300">
                  <div class="p-6">
                    <div class="flex justify-between items-start mb-4">
                      <h3 class="text-xl font-semibold text-base-content truncate">
                        {app.name}
                      </h3>
                      <div
                        class={`badge ${
                          app.status === "published"
                            ? "badge-success"
                            : app.status === "draft"
                            ? "badge-warning"
                            : app.status === "pending"
                            ? "badge-info"
                            : "badge-neutral"
                        }`}
                      >
                        {app.status}
                      </div>
                    </div>

                    {app.description && (
                      <p class="text-base-content/70 text-sm mb-4 line-clamp-2">
                        {app.description}
                      </p>
                    )}

                    <div class="flex justify-between items-center text-xs text-base-content/60">
                      <span>Updated {new Date(app.updated_at).toLocaleDateString()}</span>
                      <Button
                        as="a"
                        href={`/apps/${app.id}`}
                        size="sm"
                        variant="outline"
                      >
                        View
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Templates Gallery Section */}
      <section id="templates" class="py-16 bg-base-200">
        <div class="container mx-auto px-4">
          <div class="text-center mb-12">
            <h2 class="text-3xl font-bold text-base-content mb-4">
              Application Templates
            </h2>
            <p class="text-xl text-base-content/80 max-w-3xl mx-auto">
              Choose from our curated collection of templates to jumpstart your application
              development.
            </p>
          </div>

          <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {displayTemplates.map((template) => (
              <Card
                key={template.id}
                class="hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:-translate-y-1"
                onClick={() => handleSelectTemplate(template)}
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
                  <div
                    class={`badge ${getCategoryColor(template.category)} absolute top-4 right-4`}
                  >
                    {template.category}
                  </div>
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
                      <span key={feature} class="badge badge-outline badge-sm">
                        {feature}
                      </span>
                    ))}
                    {template.features.length > 3 && (
                      <span class="badge badge-outline badge-sm">
                        +{template.features.length - 3} more
                      </span>
                    )}
                  </div>

                  <div class="flex justify-between items-center">
                    <span class="text-xs text-base-content/60">
                      ⏱️ {template.estimatedTime}
                    </span>
                    <div class="flex gap-2">
                      {template.preview.demoUrl && (
                        <Button
                          as="a"
                          href={template.preview.demoUrl}
                          target="_blank"
                          size="sm"
                          variant="outline"
                          onClick={(e) => e.stopPropagation()}
                        >
                          Demo
                        </Button>
                      )}
                      <Button
                        size="sm"
                        color="primary"
                      >
                        Use Template
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Create Custom App Card */}
          <div class="mt-8 flex justify-center">
            <Card
              class="max-w-md hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:-translate-y-1 border-2 border-dashed border-primary/30"
              onClick={handleCreateNew}
            >
              <div class="p-8 text-center">
                <div class="text-6xl mb-4 opacity-60">➕</div>
                <h3 class="text-xl font-semibold text-base-content mb-2">
                  Start from Scratch
                </h3>
                <p class="text-base-content/70 text-sm mb-4">
                  Create a custom application with your own specifications and requirements.
                </p>
                <Button color="primary" size="lg">
                  Create Custom App
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section class="py-16 bg-base-100">
        <div class="container mx-auto px-4">
          <div class="text-center mb-12">
            <h2 class="text-3xl font-bold text-base-content mb-4">
              Why Choose Our Marketplace?
            </h2>
            <p class="text-xl text-base-content/80 max-w-3xl mx-auto">
              Built for developers, designed for creators. Generate applications with our powerful
              compiler and intuitive interface.
            </p>
          </div>

          <div class="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <Card class="text-center p-8 hover:shadow-xl transition-all duration-300">
              <div class="text-6xl mb-6">🎨</div>
              <h3 class="text-2xl font-bold mb-4 text-primary">Visual Builder</h3>
              <p class="text-base-content/70 leading-relaxed">
                Create applications with our intuitive visual interface. No complex command-line
                tools required - just point, click, and build.
              </p>
            </Card>

            <Card class="text-center p-8 hover:shadow-xl transition-all duration-300">
              <div class="text-6xl mb-6">⚡</div>
              <h3 class="text-2xl font-bold mb-4 text-secondary">Fast Generation</h3>
              <p class="text-base-content/70 leading-relaxed">
                Lightning-fast application generation with our optimized compiler. From concept to
                deployment in minutes, not hours.
              </p>
            </Card>

            <Card class="text-center p-8 hover:shadow-xl transition-all duration-300">
              <div class="text-6xl mb-6">📦</div>
              <h3 class="text-2xl font-bold mb-4 text-accent">Template Library</h3>
              <p class="text-base-content/70 leading-relaxed">
                Choose from a rich library of templates and components. Start with proven patterns
                and customize to your needs.
              </p>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
