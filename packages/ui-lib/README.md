# UI Library - DaisyUI 5 & Tailwind 4 Compatible

A comprehensive UI component library built with DaisyUI 5 and Tailwind CSS 4, providing 162+
production-ready components for modern web applications.

## 🚀 Features

- **162+ Components** - Comprehensive collection across 10 categories
- **DaisyUI 5 Compatible** - Latest features and enhancements
- **Tailwind 4 Ready** - Modern utility-first CSS framework
- **TypeScript First** - Full type safety with Zod schemas
- **SSR Compatible** - Works with Deno Fresh and other SSR frameworks
- **Accessibility Focused** - WCAG compliant with enhanced ARIA support
- **Performance Optimized** - Tree-shakable with minimal bundle impact
- **Theme Support** - Full DaisyUI theme system integration

## 📦 Installation

```bash
# Using Deno
import { Button, Input, Card } from "https://deno.land/x/ui-lib/mod.ts";

# Using npm (if published)
npm install @your-org/ui-lib
```

## 🎯 Quick Start

```tsx
import { Button, Card, Input } from "./ui-lib/mod.ts";

export default function MyPage() {
  return (
    <div className="p-8">
      <Card title="Welcome">
        <div className="space-y-4">
          <Input placeholder="Enter your name" />
          <Button color="primary">Get Started</Button>
        </div>
      </Card>
    </div>
  );
}
```

## 📚 Component Categories

### 🎬 Action Components

Interactive elements for user actions

- **Button** - Enhanced loading states and animations
- **Modal** - Improved backdrop and focus management
- **Dropdown** - Better positioning and accessibility
- **SearchModal** - Advanced search with keyboard navigation

### 📝 Input Components

Form controls and data entry

- **Input** - All HTML input types with enhanced validation
- **Select** - Dropdown selection with improved styling
- **Checkbox/Radio/Toggle** - Form controls with smooth animations
- **Textarea** - Multi-line text input with auto-resize

### 🎨 Display Components

Visual content presentation

- **Card** - Enhanced shadow system and responsive layouts
- **Table** - Responsive data tables with sorting
- **Badge** - Status indicators with improved color system
- **Avatar** - User profile images with fallbacks

### 🧭 Navigation Components

Site navigation and wayfinding

- **Navbar** - Responsive navigation with mobile support
- **Sidebar** - Collapsible side navigation
- **Breadcrumbs** - Hierarchical navigation trails
- **Tabs** - Content organization with keyboard support

### 💬 Feedback Components

User feedback and status indication

- **Alert** - Enhanced color contrast and accessibility
- **Toast** - Improved positioning and animations
- **Loading** - Multiple spinner types and states
- **Tooltip** - Better positioning and responsive behavior

### 🏗️ Layout Components

Page structure and organization

- **Hero** - Landing page headers with responsive design
- **Footer** - Site footers with flexible layouts
- **Divider** - Content separation with various styles
- **Stack** - Flexible content stacking

### 📱 Mockup Components

Device and interface mockups

- **Browser** - Browser window mockups
- **Phone** - Mobile device frames
- **Window** - Desktop application windows
- **Code** - Code editor mockups

### 📄 Page Components

Complete page layouts

- **HomePage** - Landing page layouts
- **LoginPage** - Authentication interfaces
- **ProfilePage** - User profile displays
- **AdminPage** - Administrative interfaces

### 🔐 Auth Components

Authentication and authorization

- **AuthGuard** - Route protection
- **LoginButton** - Authentication triggers
- **UserProfile** - User information display

### 📊 Section Components

Page sections and content blocks

- **BenefitsSection** - Feature highlights
- **StatsSection** - Metric displays
- **TestimonialSection** - User testimonials

## 🎨 DaisyUI 5 Enhancements

### Enhanced Color System

```tsx
// Improved semantic colors with better contrast
<Button color="primary">Primary Action</Button>
<Button color="secondary">Secondary Action</Button>
<Button color="accent">Accent Action</Button>
```

### Advanced Loading States

```tsx
// Multiple loading spinner types
<Button loading loadingType="spinner">Loading</Button>
<Button loading loadingType="dots">Loading</Button>
<Button loading loadingType="ring">Loading</Button>
```

### Better Theme Integration

```tsx
// Enhanced theme switching
<div data-theme="dark">
  <Button color="primary">Dark Theme Button</Button>
</div>;
```

## 🎯 Tailwind 4 Features

### Container Queries

```tsx
// Responsive design based on container size
<div className="@container">
  <Card className="@sm:grid-cols-2 @lg:grid-cols-3">
    Container-responsive content
  </Card>
</div>;
```

### Enhanced Arbitrary Values

```tsx
// Better custom value support
<Button className="bg-[#1da1f2] text-[14px] rotate-[17deg]">
  Custom Styled Button
</Button>;
```

### Simplified Transforms

```tsx
// No explicit transform class needed
<div className="-translate-y-1/2 scale-110">
  Transformed content
</div>;
```

## 🔧 Configuration

### Tailwind Configuration

```javascript
// tailwind.config.js
module.exports = {
  content: [
    "./components/**/*.{js,ts,jsx,tsx}",
    "./node_modules/@your-org/ui-lib/**/*.{js,ts,jsx,tsx}",
  ],
  plugins: [
    require("daisyui"),
  ],
  daisyui: {
    themes: ["light", "dark", "cupcake", "bumblebee"],
  },
};
```

### Deno Configuration

```json
// deno.json
{
  "imports": {
    "ui-lib/": "./packages/ui-lib/",
    "zod": "https://deno.land/x/zod@v3.22.4/mod.ts"
  }
}
```

## 🧪 Testing

### Component Testing

```bash
# Run all component tests
deno test --allow-read --allow-write components/

# Test specific component
deno test --allow-read --allow-write components/action/button/Button.test.ts
```

### Visual Regression Testing

```bash
# Run visual tests
deno run --allow-read --allow-write scripts/run-visual-tests.ts

# Update visual baselines
deno run --allow-read --allow-write scripts/run-visual-tests.ts --update-baselines
```

### Performance Testing

```bash
# Run performance tests
deno run --allow-read --allow-write scripts/run-performance-tests.ts
```

## 📖 Documentation

### Component Documentation

Each component includes comprehensive documentation:

- **API Reference** - Props, types, and schemas
- **Usage Examples** - Common patterns and use cases
- **Accessibility Notes** - WCAG compliance information
- **Migration Guide** - Upgrade instructions

### Interactive Examples

```tsx
// All components include interactive examples
import { buttonMetadata } from "./components/action/button/Button.metadata.tsx";

// Access examples programmatically
const examples = buttonMetadata.examples;
const usageNotes = buttonMetadata.usageNotes;
```

## 🚀 Performance

### Bundle Size

- **Optimized CSS** - Tree-shakable DaisyUI classes
- **Minimal JS** - Components average <2KB gzipped
- **Smart Imports** - Import only what you need

### Runtime Performance

- **Fast Rendering** - Optimized component implementations
- **Memory Efficient** - Minimal memory footprint
- **Animation Optimized** - GPU-accelerated animations

## ♿ Accessibility

### WCAG Compliance

- **AA Compliant** - Meets WCAG 2.1 AA standards
- **Screen Reader Support** - Comprehensive ARIA attributes
- **Keyboard Navigation** - Full keyboard accessibility
- **Focus Management** - Proper focus handling

### Enhanced Features

- **High Contrast** - Better color contrast ratios
- **Reduced Motion** - Respects user preferences
- **Focus Indicators** - Clear focus states
- **Semantic HTML** - Proper HTML structure

## 🔄 Migration

### From DaisyUI 4

The migration maintains 100% backward compatibility:

```tsx
// Existing code continues to work
<Button color="primary">Click me</Button>

// Enhanced features available
<Button color="primary" loading loadingType="spinner">
  Enhanced Button
</Button>
```

### Migration Tools

```bash
# Analyze components for migration opportunities
deno run --allow-read --allow-write migration-cli.ts analyze ./components

# Apply automatic migrations
deno run --allow-read --allow-write migration-cli.ts migrate ./components
```

## 🤝 Contributing

### Development Setup

```bash
# Clone repository
git clone <repository-url>

# Install dependencies
deno cache deps.ts

# Run development server
deno task dev
```

### Component Development

1. **Create Component** - Follow existing patterns
2. **Add Schema** - Define Zod validation schema
3. **Write Tests** - Include unit and integration tests
4. **Add Metadata** - Document component usage
5. **Update Examples** - Provide usage examples

### Testing Requirements

- **Unit Tests** - Test component functionality
- **Integration Tests** - Test component combinations
- **Visual Tests** - Ensure visual consistency
- **Accessibility Tests** - Verify WCAG compliance

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- **DaisyUI** - For the excellent component framework
- **Tailwind CSS** - For the utility-first CSS framework
- **Deno** - For the modern JavaScript runtime
- **Preact** - For the lightweight React alternative

## 📞 Support

- **Documentation** - [Component Documentation](./docs/)
- **Migration Guide** - [Migration Guide](./DAISYUI_5_TAILWIND_4_MIGRATION_GUIDE.md)
- **Troubleshooting** - [Troubleshooting Guide](./MIGRATION_TROUBLESHOOTING_GUIDE.md)
- **Issues** - [GitHub Issues](https://github.com/your-org/ui-lib/issues)

---

Built with ❤️ using DaisyUI 5 and Tailwind CSS 4
