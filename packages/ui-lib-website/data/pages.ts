import { SearchableComponent } from "../utils/search.ts";

export interface PageTemplate extends SearchableComponent {
  id: string;
  category: 'landing' | 'dashboard' | 'form' | 'admin' | 'auth' | 'content';
  components: string[]; // ui-lib components used
  layout: {
    structure: string; // Description of layout structure
    responsive: boolean;
    sections: string[]; // Header, main, footer, etc.
  };
  features: string[]; // Key features demonstrated
  codeFiles: {
    filename: string;
    content: string;
    language: 'tsx' | 'ts' | 'css';
  }[];
  liveExample?: string; // URL to working example if available
}

export interface PageGuide {
  title: string;
  description: string;
  sections: {
    title: string;
    content: string;
    examples?: string[];
  }[];
}

export interface PageTemplateData {
  templates: {
    landing: PageTemplate[];
    dashboard: PageTemplate[];
    form: PageTemplate[];
    admin: PageTemplate[];
    auth: PageTemplate[];
    content: PageTemplate[];
  };
  guides: PageGuide[];
}

export const pageTemplates: PageTemplateData = {
  templates: {
    landing: [
      {
        id: "hero-landing",
        name: "Hero Landing Page",
        description: "Modern landing page with hero section, features grid, and call-to-action",
        category: "landing",
        tags: ["hero", "landing", "marketing", "features"],
        path: "/pages/templates/hero-landing",
        keywords: ["hero", "landing", "marketing", "cta"],
        components: ["HeroSection", "Card", "Button", "Badge", "Stats"],
        layout: {
          structure: "Header + Hero + Features Grid + Stats + Footer",
          responsive: true,
          sections: ["header", "hero", "features", "stats", "footer"]
        },
        features: ["hero-banner", "feature-showcase", "social-proof", "responsive-design"],
        codeFiles: [
          {
            filename: "HeroLandingPage.tsx",
            language: "tsx",
            content: `import { HeroSection, Card, Button, Badge, Stats } from "@suppers/ui-lib";

export default function HeroLandingPage() {
  return (
    <div class="min-h-screen">
      {/* Hero Section */}
      <HeroSection
        title="Build Amazing Apps"
        subtitle="Create beautiful, responsive applications with our comprehensive UI library"
        primaryAction={<Button size="lg">Get Started</Button>}
        secondaryAction={<Button variant="outline" size="lg">Learn More</Button>}
        backgroundImage="/hero-bg.jpg"
      />
      
      {/* Features Grid */}
      <section class="py-16 px-4">
        <div class="max-w-6xl mx-auto">
          <h2 class="text-3xl font-bold text-center mb-12">Why Choose Our Library?</h2>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card class="p-6 text-center">
              <Badge color="primary" class="mb-4">Fast</Badge>
              <h3 class="text-xl font-semibold mb-2">Lightning Speed</h3>
              <p>Optimized components for maximum performance</p>
            </Card>
            <Card class="p-6 text-center">
              <Badge color="secondary" class="mb-4">Modern</Badge>
              <h3 class="text-xl font-semibold mb-2">Latest Tech</h3>
              <p>Built with Fresh 2.0 and modern web standards</p>
            </Card>
            <Card class="p-6 text-center">
              <Badge color="accent" class="mb-4">Flexible</Badge>
              <h3 class="text-xl font-semibold mb-2">Customizable</h3>
              <p>Easily themed and adapted to your brand</p>
            </Card>
          </div>
        </div>
      </section>
      
      {/* Stats Section */}
      <section class="py-16 bg-base-200">
        <div class="max-w-4xl mx-auto px-4">
          <Stats class="grid-cols-1 md:grid-cols-3">
            <div class="stat">
              <div class="stat-value">50+</div>
              <div class="stat-title">Components</div>
            </div>
            <div class="stat">
              <div class="stat-value">1000+</div>
              <div class="stat-title">Downloads</div>
            </div>
            <div class="stat">
              <div class="stat-value">99%</div>
              <div class="stat-title">Satisfaction</div>
            </div>
          </Stats>
        </div>
      </section>
    </div>
  );
}`
          }
        ]
      },
      {
        id: "product-showcase",
        name: "Product Showcase",
        description: "Product-focused landing page with carousel, testimonials, and pricing",
        category: "landing",
        tags: ["product", "showcase", "carousel", "pricing"],
        path: "/pages/templates/product-showcase",
        keywords: ["product", "showcase", "carousel", "testimonials"],
        components: ["Carousel", "Card", "Button", "Avatar", "Badge", "Pricing"],
        layout: {
          structure: "Header + Product Carousel + Testimonials + Pricing + Footer",
          responsive: true,
          sections: ["header", "carousel", "testimonials", "pricing", "footer"]
        },
        features: ["product-gallery", "customer-testimonials", "pricing-tiers", "social-proof"],
        codeFiles: [
          {
            filename: "ProductShowcasePage.tsx",
            language: "tsx",
            content: `import { Carousel, Card, Button, Avatar, Badge } from "@suppers/ui-lib";

export default function ProductShowcasePage() {
  const products = [
    { id: 1, name: "Premium Plan", image: "/product1.jpg" },
    { id: 2, name: "Business Plan", image: "/product2.jpg" },
    { id: 3, name: "Enterprise Plan", image: "/product3.jpg" }
  ];
  
  const testimonials = [
    { name: "John Doe", role: "CEO", company: "TechCorp", avatar: "/avatar1.jpg", quote: "Amazing product!" },
    { name: "Jane Smith", role: "Designer", company: "DesignCo", avatar: "/avatar2.jpg", quote: "Love the UI!" }
  ];
  
  return (
    <div class="min-h-screen">
      {/* Product Carousel */}
      <section class="py-16">
        <div class="max-w-4xl mx-auto px-4">
          <h1 class="text-4xl font-bold text-center mb-12">Our Products</h1>
          <Carousel>
            {products.map(product => (
              <div key={product.id} class="carousel-item w-full">
                <Card class="w-full">
                  <img src={product.image} alt={product.name} class="w-full h-64 object-cover" />
                  <div class="card-body">
                    <h2 class="card-title">{product.name}</h2>
                    <Button class="btn-primary">Learn More</Button>
                  </div>
                </Card>
              </div>
            ))}
          </Carousel>
        </div>
      </section>
      
      {/* Testimonials */}
      <section class="py-16 bg-base-200">
        <div class="max-w-6xl mx-auto px-4">
          <h2 class="text-3xl font-bold text-center mb-12">What Our Customers Say</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} class="p-6">
                <div class="flex items-center mb-4">
                  <Avatar src={testimonial.avatar} size="md" class="mr-4" />
                  <div>
                    <h3 class="font-semibold">{testimonial.name}</h3>
                    <p class="text-sm opacity-70">{testimonial.role} at {testimonial.company}</p>
                  </div>
                </div>
                <p class="italic">"{testimonial.quote}"</p>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}`
          }
        ]
      }
    ],
    dashboard: [
      {
        id: "admin-dashboard",
        name: "Admin Dashboard",
        description: "Comprehensive admin interface with sidebar navigation, stats, and data tables",
        category: "dashboard",
        tags: ["admin", "dashboard", "sidebar", "stats"],
        path: "/pages/templates/admin-dashboard",
        keywords: ["admin", "dashboard", "management", "analytics"],
        components: ["Sidebar", "Stats", "Table", "Card", "Button", "Badge", "Avatar"],
        layout: {
          structure: "Sidebar + Main Content (Stats + Tables + Charts)",
          responsive: true,
          sections: ["sidebar", "header", "stats", "content", "tables"]
        },
        features: ["user-management", "analytics", "data-tables", "responsive-sidebar"],
        codeFiles: [
          {
            filename: "AdminDashboard.tsx",
            language: "tsx",
            content: `import { Sidebar, Stats, Table, Card, Button, Badge, Avatar } from "@suppers/ui-lib";

export default function AdminDashboard() {
  const users = [
    { id: 1, name: "John Doe", email: "john@example.com", role: "Admin", status: "Active" },
    { id: 2, name: "Jane Smith", email: "jane@example.com", role: "User", status: "Inactive" }
  ];
  
  return (
    <div class="flex min-h-screen">
      {/* Sidebar */}
      <Sidebar class="w-64 bg-base-200">
        <div class="p-4">
          <h1 class="text-xl font-bold">Admin Panel</h1>
        </div>
        <ul class="menu">
          <li><a href="#dashboard">Dashboard</a></li>
          <li><a href="#users">Users</a></li>
          <li><a href="#settings">Settings</a></li>
        </ul>
      </Sidebar>
      
      {/* Main Content */}
      <div class="flex-1 p-6">
        {/* Stats Overview */}
        <div class="mb-8">
          <h2 class="text-2xl font-bold mb-4">Dashboard Overview</h2>
          <Stats class="grid-cols-1 md:grid-cols-4 gap-4">
            <div class="stat bg-base-100">
              <div class="stat-value text-primary">1,234</div>
              <div class="stat-title">Total Users</div>
              <div class="stat-desc">↗︎ 12% increase</div>
            </div>
            <div class="stat bg-base-100">
              <div class="stat-value text-secondary">567</div>
              <div class="stat-title">Active Sessions</div>
              <div class="stat-desc">↗︎ 8% increase</div>
            </div>
            <div class="stat bg-base-100">
              <div class="stat-value text-accent">89</div>
              <div class="stat-title">New Signups</div>
              <div class="stat-desc">↘︎ 3% decrease</div>
            </div>
            <div class="stat bg-base-100">
              <div class="stat-value text-info">99.9%</div>
              <div class="stat-title">Uptime</div>
              <div class="stat-desc">Last 30 days</div>
            </div>
          </Stats>
        </div>
        
        {/* Users Table */}
        <Card class="p-6">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-xl font-semibold">Recent Users</h3>
            <Button size="sm">Add User</Button>
          </div>
          <Table>
            <thead>
              <tr>
                <th>User</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id}>
                  <td>
                    <div class="flex items-center">
                      <Avatar size="sm" class="mr-2" />
                      {user.name}
                    </div>
                  </td>
                  <td>{user.email}</td>
                  <td>
                    <Badge color={user.role === 'Admin' ? 'primary' : 'secondary'}>
                      {user.role}
                    </Badge>
                  </td>
                  <td>
                    <Badge color={user.status === 'Active' ? 'success' : 'warning'}>
                      {user.status}
                    </Badge>
                  </td>
                  <td>
                    <Button size="xs" variant="outline">Edit</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card>
      </div>
    </div>
  );
}`
          }
        ]
      }
    ],
    form: [
      {
        id: "contact-form",
        name: "Contact Form",
        description: "Professional contact form with validation and multiple input types",
        category: "form",
        tags: ["contact", "form", "validation", "inputs"],
        path: "/pages/templates/contact-form",
        keywords: ["contact", "form", "validation", "inputs"],
        components: ["Input", "Textarea", "Button", "Card", "Alert"],
        layout: {
          structure: "Header + Form Card + Success/Error States",
          responsive: true,
          sections: ["header", "form", "validation", "submission"]
        },
        features: ["form-validation", "error-handling", "responsive-design", "accessibility"],
        codeFiles: [
          {
            filename: "ContactFormPage.tsx",
            language: "tsx",
            content: `import { Input, Textarea, Button, Card, Alert } from "@suppers/ui-lib";

export default function ContactFormPage() {
  return (
    <div class="min-h-screen bg-base-200 py-12">
      <div class="max-w-2xl mx-auto px-4">
        <div class="text-center mb-8">
          <h1 class="text-3xl font-bold mb-2">Contact Us</h1>
          <p class="text-base-content/70">We'd love to hear from you. Send us a message!</p>
        </div>
        
        <Card class="p-8">
          <form class="space-y-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="label">
                  <span class="label-text">First Name *</span>
                </label>
                <Input 
                  type="text" 
                  placeholder="John" 
                  required 
                  class="w-full"
                />
              </div>
              <div>
                <label class="label">
                  <span class="label-text">Last Name *</span>
                </label>
                <Input 
                  type="text" 
                  placeholder="Doe" 
                  required 
                  class="w-full"
                />
              </div>
            </div>
            
            <div>
              <label class="label">
                <span class="label-text">Email Address *</span>
              </label>
              <Input 
                type="email" 
                placeholder="john@example.com" 
                required 
                class="w-full"
              />
            </div>
            
            <div>
              <label class="label">
                <span class="label-text">Subject</span>
              </label>
              <Input 
                type="text" 
                placeholder="How can we help?" 
                class="w-full"
              />
            </div>
            
            <div>
              <label class="label">
                <span class="label-text">Message *</span>
              </label>
              <Textarea 
                placeholder="Tell us more about your inquiry..."
                rows={5}
                required
                class="w-full"
              />
            </div>
            
            <div class="flex items-center justify-between">
              <div class="text-sm text-base-content/70">
                * Required fields
              </div>
              <Button type="submit" size="lg">
                Send Message
              </Button>
            </div>
          </form>
        </Card>
        
        <Alert class="mt-6" type="info">
          <span>We typically respond within 24 hours during business days.</span>
        </Alert>
      </div>
    </div>
  );
}`
          }
        ]
      }
    ],
    admin: [],
    auth: [
      {
        id: "login-page",
        name: "Login Page",
        description: "Clean authentication page with social login options and form validation",
        category: "auth",
        tags: ["login", "auth", "social", "validation"],
        path: "/pages/templates/login-page",
        keywords: ["login", "signin", "auth", "social"],
        components: ["Input", "Button", "Card", "Divider", "Alert"],
        layout: {
          structure: "Centered Card + Form + Social Options + Links",
          responsive: true,
          sections: ["header", "form", "social", "links"]
        },
        features: ["social-login", "form-validation", "responsive-design", "accessibility"],
        codeFiles: [
          {
            filename: "LoginPage.tsx",
            language: "tsx",
            content: `import { Input, Button, Card, Divider, Alert } from "@suppers/ui-lib";

export default function LoginPage() {
  return (
    <div class="min-h-screen bg-base-200 flex items-center justify-center py-12 px-4">
      <div class="max-w-md w-full">
        <div class="text-center mb-8">
          <h1 class="text-3xl font-bold">Welcome Back</h1>
          <p class="text-base-content/70 mt-2">Sign in to your account</p>
        </div>
        
        <Card class="p-8">
          {/* Social Login */}
          <div class="space-y-3 mb-6">
            <Button variant="outline" class="w-full" size="lg">
              <svg class="w-5 h-5 mr-2" viewBox="0 0 24 24">
                {/* Google icon */}
              </svg>
              Continue with Google
            </Button>
            <Button variant="outline" class="w-full" size="lg">
              <svg class="w-5 h-5 mr-2" viewBox="0 0 24 24">
                {/* GitHub icon */}
              </svg>
              Continue with GitHub
            </Button>
          </div>
          
          <Divider>OR</Divider>
          
          {/* Email/Password Form */}
          <form class="space-y-4">
            <div>
              <label class="label">
                <span class="label-text">Email</span>
              </label>
              <Input 
                type="email" 
                placeholder="Enter your email"
                class="w-full"
                required
              />
            </div>
            
            <div>
              <label class="label">
                <span class="label-text">Password</span>
              </label>
              <Input 
                type="password" 
                placeholder="Enter your password"
                class="w-full"
                required
              />
            </div>
            
            <div class="flex items-center justify-between">
              <label class="label cursor-pointer">
                <input type="checkbox" class="checkbox checkbox-sm" />
                <span class="label-text ml-2">Remember me</span>
              </label>
              <a href="#" class="link link-primary text-sm">Forgot password?</a>
            </div>
            
            <Button type="submit" class="w-full" size="lg">
              Sign In
            </Button>
          </form>
          
          <div class="text-center mt-6">
            <span class="text-base-content/70">Don't have an account? </span>
            <a href="#" class="link link-primary">Sign up</a>
          </div>
        </Card>
      </div>
    </div>
  );
}`
          }
        ]
      }
    ],
    content: []
  },
  guides: [
    {
      title: "Building Effective Page Layouts",
      description: "Learn how to compose ui-lib components into cohesive page designs",
      sections: [
        {
          title: "Layout Fundamentals",
          content: "Start with a clear hierarchy: header, main content, and footer. Use layout components like Sidebar and Drawer for navigation.",
          examples: ["hero-landing", "admin-dashboard"]
        },
        {
          title: "Component Composition",
          content: "Combine components thoughtfully. Cards work well for content sections, Stats for metrics, and Tables for data display.",
          examples: ["admin-dashboard", "contact-form"]
        },
        {
          title: "Responsive Design",
          content: "Use Tailwind's responsive classes to ensure your layouts work on all devices. Test mobile-first approaches.",
          examples: ["hero-landing", "login-page"]
        }
      ]
    }
  ]
};

// Utility functions for working with page templates
const allTemplates = [
  ...pageTemplates.templates.landing,
  ...pageTemplates.templates.dashboard,
  ...pageTemplates.templates.form,
  ...pageTemplates.templates.admin,
  ...pageTemplates.templates.auth,
  ...pageTemplates.templates.content
];

export const getPagesByCategory = (category: string) => {
  return allTemplates.filter((template) => template.category.toLowerCase() === category.toLowerCase());
};

export const getPageByPath = (path: string) => {
  return allTemplates.find((template) => template.path === path);
};

export const getAllPageCategories = () => {
  const categories = new Set(allTemplates.map((template) => template.category));
  return Array.from(categories);
};

export const getPageCount = () => allTemplates.length;

export const getPageCategoryCount = (category: string) => {
  return allTemplates.filter((template) => template.category.toLowerCase() === category.toLowerCase()).length;
};

export const getPagesByFeature = (feature: string) => {
  return allTemplates.filter((template) => template.features?.includes(feature));
};

export const getPagesByComponent = (component: string) => {
  return allTemplates.filter((template) => template.components?.includes(component));
};
