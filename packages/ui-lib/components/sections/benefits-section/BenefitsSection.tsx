import {
  Accessibility,
  ArrowRight,
  CheckCircle,
  Code2,
  Component,
  Palette,
  Shield,
  Smartphone,
  Target,
  Zap,
  Flower,
} from "lucide-preact";

interface Benefit {
  icon: any;
  title: string;
  description: string;
  features: string[];
  color: string;
}

const benefits: Benefit[] = [
  {
    icon: <Flower size={32} />,
    title: "DaisyUI Components",
    description:
      "Components are built with DaisyUI and are ready to use in your Fresh applications.",
    features: [
      "65+ components included",
      "Perfect API compatibility with Fresh",
      "Regular updates with DaisyUI",
      "No missing features",
    ],
    color: "text-warning",
  },
  {
    icon: <Zap size={32} />,
    title: "Fresh 2.0 Native",
    description:
      "Built specifically for Fresh 2.0 using preact for optimal performance.",
    features: [
      "Server-side rendering",
      "Component islands",
      "Zero runtime overhead",
      "Edge-ready deployment",
    ],
    color: "text-secondary",
  },
  {
    icon: <Code2 size={32} />,
    title: "TypeScript First",
    description: "Fully typed components with IntelliSense support and compile-time safety.",
    features: [
      "100% TypeScript coverage",
      "Auto-completion support",
      "Type-safe props",
      "IDE integration",
    ],
    color: "text-accent",
  },
  {
    icon: <Shield size={32} />,
    title: "Ecosystem Ready",
    description:
      "Components are built to be used in the Suppers ecosystem. This allows for quick development and a consistent user experience across all applications.",
    features: [
      "Secure Authentication",
      "Fast File Storage",
      "Reliable Database",
    ],
    color: "text-success",
  },
];

const features = [
  {
    icon: <Component size={24} />,
    title: "Component Islands",
    description: "Interactive components that hydrate only when needed",
  },
  {
    icon: <Palette size={24} />,
    title: "29 Built-in Themes",
    description: "Switch between themes instantly with built-in theme controller",
  },
  {
    icon: <Smartphone size={24} />,
    title: "Mobile First",
    description: "Responsive design that works perfectly on all devices",
  },
  {
    icon: <Accessibility size={24} />,
    title: "Accessibility",
    description: "WCAG 2.1 compliant with keyboard navigation and screen reader support",
  },
];

export function BenefitsSection() {
  return (
    <section class="py-20 lg:py-32 bg-base-100">
      <div class="px-4 lg:px-6 max-w-6xl mx-auto">
        {/* Section header */}
        <div class="text-center mb-16">
          <h2 class="text-3xl lg:text-4xl font-bold text-base-content mb-4">
            Why Choose Our Component Library?
          </h2>
          <p class="text-lg text-base-content/70 max-w-2xl mx-auto">
            Built by developers, for developers. Get the tools you need to build amazing
            applications with confidence, and harness our ecosystem to speed up your development.
          </p>
        </div>

        {/* Main benefits grid */}
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-20">
          {benefits.map((benefit, index) => (
            <div
              key={index}
              class="card bg-base-100 border border-base-300 shadow-lg hover:shadow-xl transition-shadow duration-300"
            >
              <div class="card-body p-8">
                <div class={`${benefit.color} mb-4`}>
                  {benefit.icon}
                </div>
                <h3 class="card-title text-xl mb-3">
                  {benefit.title}
                </h3>
                <p class="text-base-content/70 mb-6">
                  {benefit.description}
                </p>
                <ul class="space-y-2">
                  {benefit.features.map((feature, idx) => (
                    <li key={idx} class="flex items-center gap-3 text-sm">
                      <CheckCircle size={16} className="text-success shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

        {/* Additional features */}
        <div class="bg-gradient-to-r from-base-200/50 to-base-300/30 rounded-2xl p-8 lg:p-12">
          <div class="text-center mb-12">
            <h3 class="text-2xl lg:text-3xl font-bold text-base-content mb-4">
              Everything You Need
            </h3>
            <p class="text-base-content/70">
              Comprehensive features that make development a breeze
            </p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} class="text-center">
                <div class="inline-flex items-center justify-center w-12 h-12 bg-primary/10 rounded-lg mb-4">
                  <div class="text-primary">
                    {feature.icon}
                  </div>
                </div>
                <h4 class="font-semibold text-base-content mb-2">
                  {feature.title}
                </h4>
                <p class="text-sm text-base-content/60">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div class="text-center mt-16">
          <h3 class="text-2xl font-bold text-base-content mb-4">
            Ready to Get Started?
          </h3>
          <p class="text-base-content/70 mb-8 max-w-xl mx-auto">
            Join thousands of developers building amazing applications with our component library.
          </p>
          <div class="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/components"
              class="btn btn-primary btn-lg group"
            >
              Explore Components
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </a>
            <a
              href="/docs/installation"
              class="btn btn-outline btn-lg"
            >
              Installation Guide
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
