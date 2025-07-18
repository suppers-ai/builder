# JSON App Compiler - UI Library Package

The UI library package provides a comprehensive collection of reusable Fresh 2.0 island components designed for the JSON App Compiler system. Each component is built with TypeScript, includes prop validation, supports theming, and follows accessibility best practices.

## 📦 Installation

This package is part of the JSON App Compiler monorepo and can be used both within the compiler system and as a standalone component library.

```typescript
import { 
  Button, 
  Input, 
  Card, 
  Layout,
  ComponentRegistry 
} from "@json-app-compiler/ui-library";
```

## 🎨 Available Components

### Button Component

Interactive button component with multiple variants and sizes.

```typescript
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
  fullWidth?: boolean;
  loading?: boolean;
  onClick?: () => void;
  children: ComponentChildren;
}
```

**Usage Examples:**

```tsx
// Basic button
<Button variant="primary" size="md">
  Click Me
</Button>

// Full width submit button
<Button 
  variant="primary" 
  size="lg" 
  type="submit" 
  fullWidth={true}
>
  Submit Form
</Button>

// Loading state
<Button variant="secondary" loading={true}>
  Processing...
</Button>
```

**JSON Configuration:**
```json
{
  "id": "submitButton",
  "type": "Button",
  "props": {
    "variant": "primary",
    "size": "md",
    "type": "submit",
    "fullWidth": true
  },
  "children": "Submit"
}
```

### Input Component

Form input component with validation and various input types.

```typescript
interface InputProps {
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search';
  label?: string;
  placeholder?: string;
  value?: string;
  defaultValue?: string;
  required?: boolean;
  disabled?: boolean;
  readonly?: boolean;
  fullWidth?: boolean;
  error?: string;
  helpText?: string;
  min?: number;
  max?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  onChange?: (value: string) => void;
  onBlur?: () => void;
  onFocus?: () => void;
}
```

**Usage Examples:**

```tsx
// Basic text input
<Input 
  type="text"
  label="Full Name"
  placeholder="Enter your name"
  required={true}
/>

// Email input with validation
<Input
  type="email"
  label="Email Address"
  placeholder="user@example.com"
  error="Please enter a valid email address"
  fullWidth={true}
/>

// Password input
<Input
  type="password"
  label="Password"
  minLength={8}
  helpText="Password must be at least 8 characters"
/>
```

**JSON Configuration:**
```json
{
  "id": "emailInput",
  "type": "Input",
  "props": {
    "type": "email",
    "label": "Email Address",
    "placeholder": "Enter your email",
    "required": true,
    "fullWidth": true
  }
}
```

### Card Component

Container component for grouping related content with optional header and footer.

```typescript
interface CardProps {
  variant?: 'default' | 'outlined' | 'elevated' | 'filled';
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  shadow?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  title?: string;
  subtitle?: string;
  headerActions?: ComponentChildren;
  footer?: ComponentChildren;
  children: ComponentChildren;
}
```

**Usage Examples:**

```tsx
// Basic card
<Card 
  title="Welcome"
  subtitle="Get started with our platform"
  padding="lg"
  shadow="md"
>
  <p>This is the card content.</p>
</Card>

// Card with header actions
<Card
  title="User Profile"
  headerActions={<Button variant="ghost" size="sm">Edit</Button>}
  variant="outlined"
>
  <p>User information goes here.</p>
</Card>

// Card with footer
<Card
  title="Article Title"
  footer={
    <div>
      <Button variant="primary">Read More</Button>
      <Button variant="ghost">Share</Button>
    </div>
  }
>
  <p>Article preview content...</p>
</Card>
```

**JSON Configuration:**
```json
{
  "id": "welcomeCard",
  "type": "Card",
  "props": {
    "title": "Welcome to Our App",
    "subtitle": "Get started with these features",
    "padding": "lg",
    "shadow": "md",
    "variant": "elevated"
  },
  "children": [
    {
      "id": "cardContent",
      "type": "Layout",
      "props": { "padding": "md" },
      "children": "This is the main content of the card."
    }
  ]
}
```

### Layout Component

Flexible layout container with various layout patterns and responsive behavior.

```typescript
interface LayoutProps {
  variant?: 'default' | 'centered' | 'sidebar' | 'header-footer' | 'grid';
  direction?: 'row' | 'column';
  align?: 'start' | 'center' | 'end' | 'stretch';
  justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';
  gap?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  padding?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '7xl' | 'full';
  backgroundColor?: string;
  sidebarPosition?: 'left' | 'right';
  sidebarWidth?: 'sm' | 'md' | 'lg';
  children: ComponentChildren;
}
```

**Usage Examples:**

```tsx
// Centered layout
<Layout variant="centered" maxWidth="md" padding="lg">
  <h1>Centered Content</h1>
</Layout>

// Sidebar layout
<Layout 
  variant="sidebar" 
  sidebarPosition="left" 
  sidebarWidth="md"
>
  <div>Main content area</div>
</Layout>

// Grid layout
<Layout 
  variant="grid" 
  gap="md" 
  padding="lg"
>
  <Card>Item 1</Card>
  <Card>Item 2</Card>
  <Card>Item 3</Card>
</Layout>

// Flex layout
<Layout 
  direction="row" 
  justify="between" 
  align="center" 
  padding="md"
>
  <h2>Title</h2>
  <Button>Action</Button>
</Layout>
```

**JSON Configuration:**
```json
{
  "id": "mainLayout",
  "type": "Layout",
  "props": {
    "variant": "header-footer",
    "maxWidth": "7xl",
    "padding": "lg"
  },
  "children": [
    {
      "id": "content",
      "type": "Layout",
      "props": {
        "padding": "md",
        "gap": "lg"
      },
      "children": [
        // nested components
      ]
    }
  ]
}
```

## 🎨 Theming System

### Theme Configuration

The UI library supports comprehensive theming through CSS custom properties:

```typescript
interface ThemeConfig {
  primaryColor: string;
  secondaryColor: string;
  fontFamily: string;
  spacing: Record<string, string>;
  breakpoints: Record<string, string>;
  customProperties: Record<string, string>;
}
```

### CSS Custom Properties

```css
:root {
  /* Colors */
  --color-primary: #3b82f6;
  --color-secondary: #64748b;
  --color-success: #10b981;
  --color-warning: #f59e0b;
  --color-danger: #ef4444;
  
  /* Spacing */
  --spacing-xs: 0.5rem;
  --spacing-sm: 1rem;
  --spacing-md: 1.5rem;
  --spacing-lg: 2rem;
  --spacing-xl: 3rem;
  
  /* Typography */
  --font-family: system-ui, sans-serif;
  --font-size-sm: 0.875rem;
  --font-size-md: 1rem;
  --font-size-lg: 1.125rem;
  
  /* Shadows */
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1);
  --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1);
  
  /* Border radius */
  --radius-sm: 0.25rem;
  --radius-md: 0.375rem;
  --radius-lg: 0.5rem;
}
```

### Theme Application

```typescript
import { applyTheme, type ThemeConfig } from "@json-app-compiler/ui-library";

const customTheme: ThemeConfig = {
  primaryColor: "#8b5cf6",
  secondaryColor: "#64748b",
  fontFamily: "Inter, system-ui, sans-serif",
  spacing: {
    xs: "0.25rem",
    sm: "0.5rem",
    md: "1rem",
    lg: "1.5rem",
    xl: "2rem"
  }
};

applyTheme(customTheme);
```

## 🔧 Component Registry

### Registry Interface

```typescript
interface ComponentRegistry {
  [componentType: string]: ComponentRegistryEntry;
}

interface ComponentRegistryEntry {
  component: ComponentType;
  schema: JSONSchema;
  dependencies: string[];
  category?: string;
  description?: string;
}
```

### Using the Registry

```typescript
import { getComponentRegistry, registerComponent } from "@json-app-compiler/ui-library";

// Get all available components
const registry = getComponentRegistry();

// Register a custom component
registerComponent('CustomCard', {
  component: CustomCardComponent,
  schema: customCardSchema,
  dependencies: ['preact'],
  category: 'layout',
  description: 'A custom card component with special features'
});

// Get component by name
const buttonEntry = registry.getComponent('Button');
if (buttonEntry) {
  const { component: ButtonComponent, schema } = buttonEntry;
}
```

## ✅ Validation System

### Prop Validation

Each component includes comprehensive prop validation:

```typescript
interface PropValidationSchema {
  [propName: string]: {
    type: 'string' | 'number' | 'boolean' | 'array' | 'object';
    required?: boolean;
    enum?: unknown[];
    min?: number;
    max?: number;
    pattern?: string;
    custom?: (value: unknown) => ValidationResult;
  };
}
```

### Validation Examples

```typescript
// Button validation schema
const buttonSchema: PropValidationSchema = {
  variant: {
    type: 'string',
    enum: ['primary', 'secondary', 'outline', 'ghost', 'danger'],
    required: false
  },
  size: {
    type: 'string', 
    enum: ['sm', 'md', 'lg'],
    required: false
  },
  disabled: {
    type: 'boolean',
    required: false
  }
};

// Validate props
const validationResult = validateProps('Button', {
  variant: 'primary',
  size: 'md',
  disabled: false
});
```

## ♿ Accessibility Features

### Built-in Accessibility

All components include accessibility features:

- **Semantic HTML** - Proper HTML elements and structure
- **ARIA Labels** - Comprehensive ARIA attributes
- **Keyboard Navigation** - Full keyboard support
- **Focus Management** - Visible focus indicators
- **Screen Reader Support** - Compatible with assistive technologies
- **Color Contrast** - WCAG AA compliant color combinations

### Accessibility Props

```typescript
interface AccessibilityProps {
  'aria-label'?: string;
  'aria-describedby'?: string;
  'aria-expanded'?: boolean;
  'aria-hidden'?: boolean;
  role?: string;
  tabIndex?: number;
}
```

## 📱 Responsive Design

### Breakpoint System

```typescript
const breakpoints = {
  sm: '640px',   // Mobile landscape
  md: '768px',   // Tablet
  lg: '1024px',  // Desktop
  xl: '1280px',  // Large desktop
  '2xl': '1536px' // Extra large desktop
};
```

### Responsive Props

Many components support responsive prop values:

```typescript
// Responsive padding
<Layout padding={{ sm: 'sm', md: 'md', lg: 'lg' }}>
  Content
</Layout>

// Responsive grid columns
<Layout 
  variant="grid" 
  columns={{ sm: 1, md: 2, lg: 3 }}
>
  <Card>Item 1</Card>
  <Card>Item 2</Card>
  <Card>Item 3</Card>
</Layout>
```

## 🧪 Testing

### Component Testing

```typescript
import { render, fireEvent } from "@testing-library/preact";
import { Button } from "@json-app-compiler/ui-library";

test("Button renders with correct variant", () => {
  const { container } = render(
    <Button variant="primary">Click me</Button>
  );
  
  const button = container.querySelector('button');
  expect(button).toHaveClass('btn-primary');
});

test("Button handles click events", () => {
  const handleClick = jest.fn();
  const { container } = render(
    <Button onClick={handleClick}>Click me</Button>
  );
  
  const button = container.querySelector('button');
  fireEvent.click(button!);
  expect(handleClick).toHaveBeenCalledTimes(1);
});
```

### Running Tests

```bash
# Run all UI library tests
deno test packages/ui-library/ --allow-all

# Run specific component tests
deno test packages/ui-library/src/components/Button.test.tsx --allow-all

# Run with coverage
deno test packages/ui-library/ --allow-all --coverage=coverage/
```

## 🎯 Best Practices

### Component Usage

1. **Use semantic variants** - Choose appropriate variants for context
2. **Provide accessible labels** - Always include labels for form inputs
3. **Handle loading states** - Show loading indicators for async actions
4. **Validate props** - Use TypeScript and runtime validation
5. **Test interactions** - Write tests for user interactions

### Performance

1. **Lazy loading** - Components are loaded only when needed
2. **Tree shaking** - Unused components are excluded from bundles
3. **Minimal dependencies** - Components have minimal external dependencies
4. **Optimized rendering** - Efficient re-rendering with Preact signals

## 🔌 Extensibility

### Custom Components

Create custom components that integrate with the system:

```typescript
import { ComponentProps } from "@json-app-compiler/ui-library";

interface CustomComponentProps extends ComponentProps {
  customProp: string;
  onCustomEvent?: () => void;
}

export function CustomComponent(props: CustomComponentProps) {
  return (
    <div className="custom-component">
      {/* Component implementation */}
    </div>
  );
}

// Register the component
registerComponent('CustomComponent', {
  component: CustomComponent,
  schema: customComponentSchema,
  dependencies: ['preact']
});
```

## 📄 License

Part of the JSON App Compiler project. See the main project LICENSE for details.