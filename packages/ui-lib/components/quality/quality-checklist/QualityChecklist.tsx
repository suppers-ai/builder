import { AlertCircle, CheckCircle, Info, XCircle } from "lucide-preact";

interface QualityCheckItem {
  id: string;
  title: string;
  description: string;
  status: "pass" | "fail" | "warning" | "info";
  category: "accessibility" | "performance" | "seo" | "compatibility" | "usability";
}

interface QualityChecklistProps {
  checks: QualityCheckItem[];
  title?: string;
  showCategories?: boolean;
}

export function QualityChecklist({
  checks,
  title = "Quality Assurance Checklist",
  showCategories = true,
}: QualityChecklistProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pass":
        return <CheckCircle size={20} class="text-success" />;
      case "fail":
        return <XCircle size={20} class="text-error" />;
      case "warning":
        return <AlertCircle size={20} class="text-warning" />;
      case "info":
      default:
        return <Info size={20} class="text-info" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pass":
        return "border-success";
      case "fail":
        return "border-error";
      case "warning":
        return "border-warning";
      case "info":
      default:
        return "border-info";
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "accessibility":
        return "badge-primary";
      case "performance":
        return "badge-secondary";
      case "seo":
        return "badge-accent";
      case "compatibility":
        return "badge-info";
      case "usability":
        return "badge-success";
      default:
        return "badge-neutral";
    }
  };

  const stats = {
    total: checks.length,
    pass: checks.filter((c) => c.status === "pass").length,
    fail: checks.filter((c) => c.status === "fail").length,
    warning: checks.filter((c) => c.status === "warning").length,
    info: checks.filter((c) => c.status === "info").length,
  };

  const passRate = stats.total > 0 ? ((stats.pass / stats.total) * 100).toFixed(1) : "0";

  const categories = showCategories ? [...new Set(checks.map((c) => c.category))] : [];

  return (
    <div class="card bg-base-100 border border-base-300 shadow-lg">
      <div class="card-header p-6 border-b border-base-300">
        <h2 class="card-title text-xl font-semibold">{title}</h2>

        {/* Stats Summary */}
        <div class="grid grid-cols-2 md:grid-cols-5 gap-4 mt-4">
          <div class="stat bg-base-200 rounded-lg p-3">
            <div class="stat-title text-xs">Total</div>
            <div class="stat-value text-lg">{stats.total}</div>
          </div>
          <div class="stat bg-success/10 rounded-lg p-3">
            <div class="stat-title text-xs text-success">Passed</div>
            <div class="stat-value text-lg text-success">{stats.pass}</div>
          </div>
          <div class="stat bg-error/10 rounded-lg p-3">
            <div class="stat-title text-xs text-error">Failed</div>
            <div class="stat-value text-lg text-error">{stats.fail}</div>
          </div>
          <div class="stat bg-warning/10 rounded-lg p-3">
            <div class="stat-title text-xs text-warning">Warnings</div>
            <div class="stat-value text-lg text-warning">{stats.warning}</div>
          </div>
          <div class="stat bg-primary/10 rounded-lg p-3">
            <div class="stat-title text-xs text-primary">Pass Rate</div>
            <div class="stat-value text-lg text-primary">{passRate}%</div>
          </div>
        </div>
      </div>

      <div class="card-body p-6">
        {showCategories && categories.length > 0
          ? (
            // Group by categories
            categories.map((category) => {
              const categoryChecks = checks.filter((c) => c.category === category);
              return (
                <div key={category} class="mb-8">
                  <div class="flex items-center gap-3 mb-4">
                    <h3 class="text-lg font-semibold capitalize">{category}</h3>
                    <div class={`badge ${getCategoryColor(category)}`}>
                      {categoryChecks.length} items
                    </div>
                  </div>

                  <div class="space-y-3">
                    {categoryChecks.map((check) => (
                      <div
                        key={check.id}
                        class={`border-l-4 ${
                          getStatusColor(check.status)
                        } bg-base-200/50 p-4 rounded-r-lg`}
                      >
                        <div class="flex items-start gap-3">
                          {getStatusIcon(check.status)}
                          <div class="flex-1">
                            <h4 class="font-medium text-sm">{check.title}</h4>
                            <p class="text-sm text-base-content/70 mt-1">{check.description}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })
          )
          : (
            // Show all checks in a single list
            <div class="space-y-3">
              {checks.map((check) => (
                <div
                  key={check.id}
                  class={`border-l-4 ${
                    getStatusColor(check.status)
                  } bg-base-200/50 p-4 rounded-r-lg`}
                >
                  <div class="flex items-start gap-3">
                    {getStatusIcon(check.status)}
                    <div class="flex-1">
                      <div class="flex items-center gap-2 mb-1">
                        <h4 class="font-medium text-sm">{check.title}</h4>
                        <div class={`badge badge-xs ${getCategoryColor(check.category)}`}>
                          {check.category}
                        </div>
                      </div>
                      <p class="text-sm text-base-content/70">{check.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
      </div>

      {/* Action Footer */}
      <div class="card-footer p-6 border-t border-base-300 bg-base-200/50">
        <div class="flex justify-between items-center">
          <div class="text-sm text-base-content/70">
            Last updated: {new Date().toLocaleDateString()}
          </div>
          <div class="flex gap-2">
            <button type="button" class="btn btn-sm btn-outline">
              Export Report
            </button>
            <button type="button" class="btn btn-sm btn-primary">
              Run Tests
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Sample quality checks data
export const defaultQualityChecks: QualityCheckItem[] = [
  // Accessibility
  {
    id: "a11y-1",
    title: "ARIA Labels Present",
    description: "All interactive elements have proper ARIA labels or accessible names",
    status: "pass",
    category: "accessibility",
  },
  {
    id: "a11y-2",
    title: "Color Contrast Compliance",
    description: "Text color contrast meets WCAG 2.1 AA standards (4.5:1 ratio)",
    status: "pass",
    category: "accessibility",
  },
  {
    id: "a11y-3",
    title: "Keyboard Navigation",
    description: "All components are navigable using keyboard only",
    status: "warning",
    category: "accessibility",
  },
  {
    id: "a11y-4",
    title: "Screen Reader Compatible",
    description: "Components work properly with screen reader software",
    status: "pass",
    category: "accessibility",
  },

  // Performance
  {
    id: "perf-1",
    title: "Lazy Loading Implemented",
    description: "Images and non-critical components are lazy loaded",
    status: "pass",
    category: "performance",
  },
  {
    id: "perf-2",
    title: "Bundle Size Optimized",
    description: "JavaScript bundle size is under recommended limits",
    status: "pass",
    category: "performance",
  },
  {
    id: "perf-3",
    title: "Critical CSS Inlined",
    description: "Above-the-fold CSS is inlined for faster rendering",
    status: "warning",
    category: "performance",
  },

  // SEO
  {
    id: "seo-1",
    title: "Meta Tags Complete",
    description: "All pages have proper title, description, and Open Graph tags",
    status: "pass",
    category: "seo",
  },
  {
    id: "seo-2",
    title: "Sitemap Generated",
    description: "XML sitemap is generated and accessible",
    status: "pass",
    category: "seo",
  },
  {
    id: "seo-3",
    title: "Structured Data Present",
    description: "Proper JSON-LD structured data is implemented",
    status: "pass",
    category: "seo",
  },

  // Compatibility
  {
    id: "compat-1",
    title: "Cross-Browser Tested",
    description: "Components work in Chrome, Firefox, Safari, and Edge",
    status: "pass",
    category: "compatibility",
  },
  {
    id: "compat-2",
    title: "Mobile Responsive",
    description: "All components are responsive and mobile-friendly",
    status: "pass",
    category: "compatibility",
  },
  {
    id: "compat-3",
    title: "Progressive Enhancement",
    description: "Components work without JavaScript enabled",
    status: "warning",
    category: "compatibility",
  },

  // Usability
  {
    id: "usability-1",
    title: "Loading States",
    description: "Components show appropriate loading states",
    status: "pass",
    category: "usability",
  },
  {
    id: "usability-2",
    title: "Error Handling",
    description: "Components handle errors gracefully",
    status: "pass",
    category: "usability",
  },
  {
    id: "usability-3",
    title: "Consistent Design",
    description: "All components follow the same design system",
    status: "pass",
    category: "usability",
  },
];
