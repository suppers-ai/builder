import { type PageProps } from "fresh";
import { type Handlers } from "fresh";
import AppGeneratorForm from "../islands/AppGeneratorForm.tsx";
import type { ApplicationTemplate } from "../islands/MarketplaceHomepage.tsx";
import type { ApplicationSpec } from "@suppers/shared/types/application";

interface CreatePageData {
  selectedTemplate?: ApplicationTemplate;
}

export const handler: Handlers<CreatePageData> = {
  GET(req, ctx) {
    const url = new URL(req.url);
    const templateId = url.searchParams.get("template");

    // Mock templates - in a real implementation, these would be fetched from the database
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

    const selectedTemplate = templateId
      ? mockTemplates.find((t) => t.id === templateId)
      : undefined;

    return ctx.render({ selectedTemplate });
  },
};

export default function CreatePage({ data }: PageProps<CreatePageData>) {
  const handleGenerate = async (spec: ApplicationSpec) => {
    try {
      // In a real implementation, this would call the compiler service
      console.log("Generating application with spec:", spec);

      // Mock generation process
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Redirect to success page or show success message
      alert("Application generated successfully!");
      window.location.href = "/";
    } catch (error) {
      console.error("Generation failed:", error);
      alert("Generation failed. Please try again.");
    }
  };

  const handleCancel = () => {
    window.location.href = "/";
  };

  return (
    <div class="min-h-screen bg-base-100">
      <AppGeneratorForm
        selectedTemplate={data.selectedTemplate}
        onGenerate={handleGenerate}
        onCancel={handleCancel}
      />
    </div>
  );
}
