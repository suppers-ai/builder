import { type PageProps } from "fresh";
import TemplateGallery from "../islands/TemplateGallery.tsx";
import type { ApplicationTemplate } from "../islands/MarketplaceHomepage.tsx";

export default function TemplatesPage(props: PageProps) {
  // Mock templates - in a real implementation, these would be fetched from the database
  const mockTemplates: ApplicationTemplate[] = [
    {
      id: "business-landing",
      name: "Business Landing Page",
      description: "Professional landing page template with hero section, features, and contact form. Perfect for showcasing your business and converting visitors into customers.",
      category: "business",
      preview: {
        image: "/templates/business-landing.png",
        demoUrl: "https://demo.example.com/business"
      },
      features: ["Responsive Design", "Contact Form", "SEO Optimized", "Fast Loading", "Analytics Ready"],
      complexity: "beginner",
      estimatedTime: "5 minutes"
    },
    {
      id: "portfolio-creative",
      name: "Creative Portfolio",
      description: "Showcase your work with this modern portfolio template. Features a clean design with project galleries and smooth animations.",
      category: "portfolio",
      preview: {
        image: "/templates/portfolio-creative.png",
        demoUrl: "https://demo.example.com/portfolio"
      },
      features: ["Gallery", "Project Showcase", "About Section", "Contact", "Smooth Animations", "Mobile Optimized"],
      complexity: "intermediate",
      estimatedTime: "8 minutes"
    },
    {
      id: "blog-minimal",
      name: "Minimal Blog",
      description: "Clean and simple blog template for content creators. Focus on readability and user experience with modern typography.",
      category: "blog",
      preview: {
        image: "/templates/blog-minimal.png",
        demoUrl: "https://demo.example.com/blog"
      },
      features: ["Article Management", "Categories", "Search", "Comments", "RSS Feed", "Social Sharing"],
      complexity: "intermediate",
      estimatedTime: "10 minutes"
    },
    {
      id: "ecommerce-store",
      name: "E-commerce Store",
      description: "Full-featured online store with product catalog and checkout. Includes inventory management and payment processing.",
      category: "ecommerce",
      preview: {
        image: "/templates/ecommerce-store.png",
        demoUrl: "https://demo.example.com/store"
      },
      features: ["Product Catalog", "Shopping Cart", "Payment Integration", "Admin Panel", "Inventory Management", "Order Tracking"],
      complexity: "advanced",
      estimatedTime: "15 minutes"
    },
    {
      id: "dashboard-admin",
      name: "Admin Dashboard",
      description: "Comprehensive admin dashboard with charts and data management. Perfect for managing applications and analyzing data.",
      category: "dashboard",
      preview: {
        image: "/templates/dashboard-admin.png",
        demoUrl: "https://demo.example.com/dashboard"
      },
      features: ["Data Visualization", "User Management", "Analytics", "Reports", "Real-time Updates", "Export Tools"],
      complexity: "advanced",
      estimatedTime: "12 minutes"
    },
    {
      id: "portfolio-photographer",
      name: "Photography Portfolio",
      description: "Stunning portfolio template designed specifically for photographers. Features full-screen galleries and elegant layouts.",
      category: "portfolio",
      preview: {
        image: "/templates/portfolio-photographer.png",
        demoUrl: "https://demo.example.com/photo-portfolio"
      },
      features: ["Full-screen Gallery", "Lightbox", "Client Galleries", "Booking System", "Print Shop Integration"],
      complexity: "intermediate",
      estimatedTime: "7 minutes"
    },
    {
      id: "blog-magazine",
      name: "Magazine Blog",
      description: "Feature-rich magazine-style blog template with multiple layouts and advanced content organization.",
      category: "blog",
      preview: {
        image: "/templates/blog-magazine.png",
        demoUrl: "https://demo.example.com/magazine"
      },
      features: ["Multiple Layouts", "Featured Posts", "Newsletter", "Author Profiles", "Advanced Search", "Content Scheduling"],
      complexity: "advanced",
      estimatedTime: "13 minutes"
    },
    {
      id: "business-saas",
      name: "SaaS Landing Page",
      description: "Modern SaaS landing page with pricing tables, feature comparisons, and conversion-optimized design.",
      category: "business",
      preview: {
        image: "/templates/business-saas.png",
        demoUrl: "https://demo.example.com/saas"
      },
      features: ["Pricing Tables", "Feature Comparison", "Testimonials", "Free Trial", "Integration Showcase", "FAQ Section"],
      complexity: "intermediate",
      estimatedTime: "9 minutes"
    },
    {
      id: "ecommerce-marketplace",
      name: "Multi-vendor Marketplace",
      description: "Advanced marketplace template supporting multiple vendors with comprehensive seller and buyer management.",
      category: "ecommerce",
      preview: {
        image: "/templates/ecommerce-marketplace.png",
        demoUrl: "https://demo.example.com/marketplace"
      },
      features: ["Multi-vendor Support", "Seller Dashboard", "Commission Management", "Review System", "Advanced Search", "Dispute Resolution"],
      complexity: "advanced",
      estimatedTime: "20 minutes"
    },
    {
      id: "dashboard-analytics",
      name: "Analytics Dashboard",
      description: "Specialized analytics dashboard with advanced charting and data visualization capabilities.",
      category: "dashboard",
      preview: {
        image: "/templates/dashboard-analytics.png",
        demoUrl: "https://demo.example.com/analytics"
      },
      features: ["Advanced Charts", "Custom Metrics", "Data Export", "Scheduled Reports", "Team Collaboration", "API Integration"],
      complexity: "advanced",
      estimatedTime: "14 minutes"
    }
  ];

  const handleSelectTemplate = (template: ApplicationTemplate) => {
    // Navigate to create page with template pre-selected
    window.location.href = `/create?template=${template.id}`;
  };

  return (
    <div class="min-h-screen bg-base-100">
      <TemplateGallery 
        templates={mockTemplates}
        onSelectTemplate={handleSelectTemplate}
      />
    </div>
  );
}