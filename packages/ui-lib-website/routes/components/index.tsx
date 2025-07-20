import { ComponentPreviewCard, Button, Dropdown, Swap, Avatar, Badge, Card, Alert, Loading, Progress, Checkbox, Input, Breadcrumbs } from "@suppers/ui-lib";
import { Filter, Grid, List, Search } from "lucide-preact";

interface Component {
  name: string;
  description: string;
  path: string;
  category: string;
  categoryColor: string;
  preview: any;
  tags: string[];
}

const components: Component[] = [
  // Actions
  {
    name: "Button",
    description: "Interactive buttons with multiple variants, sizes, and states for user actions",
    path: "/components/action/button",
    category: "Actions",
    categoryColor: "primary",
    preview: (
      <div class="flex gap-2">
        <Button color="primary">Primary</Button>
        <Button variant="outline">Outline</Button>
      </div>
    ),
    tags: ["interactive", "action", "click"],
  },
  {
    name: "Dropdown",
    description: "Dropdown menus for navigation and actions with customizable content",
    path: "/components/action/dropdown",
    category: "Actions",
    categoryColor: "primary",
    preview: (
      <Dropdown 
        trigger={<Button color="primary">Dropdown</Button>}
        content={
          <ul class="menu dropdown-content bg-base-100 rounded-box z-[1] w-52 p-2 shadow">
            <li>
              <a>Item 1</a>
            </li>
            <li>
              <a>Item 2</a>
            </li>
          </ul>
        }
      />
    ),
    tags: ["menu", "navigation", "action"],
  },
  {
    name: "Modal",
    description: "Dialog boxes and overlays for displaying content and capturing user input",
    path: "/components/action/modal",
    category: "Actions",
    categoryColor: "primary",
    preview: (
      <div class="mockup-window border bg-base-300 scale-75">
        <div class="flex justify-center px-4 py-16 bg-base-200">
          <div class="text-center">
            <h3 class="font-bold text-lg">Modal Dialog</h3>
            <p class="py-4">This is a modal example</p>
          </div>
        </div>
      </div>
    ),
    tags: ["dialog", "overlay", "popup"],
  },
  {
    name: "Swap",
    description: "Toggle between two states with smooth animations and transitions",
    path: "/components/action/swap",
    category: "Actions",
    categoryColor: "primary",
    preview: <Swap on="ON" off="OFF" />,
    tags: ["toggle", "animation", "state"],
  },
  {
    name: "Theme Controller",
    description: "Interface for switching between different application themes",
    path: "/components/action/theme-controller",
    category: "Actions",
    categoryColor: "primary",
    preview: (
      <div class="flex gap-2">
        <input type="radio" name="theme-preview" class="radio radio-primary" checked />
        <input type="radio" name="theme-preview" class="radio radio-secondary" />
        <input type="radio" name="theme-preview" class="radio radio-accent" />
      </div>
    ),
    tags: ["theme", "appearance", "settings"],
  },

  // Data Display
  {
    name: "Avatar",
    description: "Profile pictures and user representations with various sizes and states",
    path: "/components/display/avatar",
    category: "Display",
    categoryColor: "secondary",
    preview: (
      <div class="flex gap-2">
        <Avatar src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.jpg" />
        <Avatar initials="AB" />
        <Avatar
          online
          src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.jpg"
        />
      </div>
    ),
    tags: ["profile", "user", "image"],
  },
  {
    name: "Badge",
    description: "Small labels and indicators for status, categories, and notifications",
    path: "/components/display/badge",
    category: "Display",
    categoryColor: "secondary",
    preview: (
      <div class="flex gap-2">
        <Badge color="primary">New</Badge>
        <Badge color="success">Active</Badge>
        <Badge variant="outline">Badge</Badge>
      </div>
    ),
    tags: ["label", "status", "indicator"],
  },
  {
    name: "Card",
    description: "Content containers with flexible layouts for organizing information",
    path: "/components/display/card",
    category: "Display",
    categoryColor: "secondary",
    preview: (
      <Card>
        <div class="card-body p-4">
          <h2 class="card-title text-sm">Card Title</h2>
          <p class="text-xs">Card content goes here</p>
        </div>
      </Card>
    ),
    tags: ["container", "content", "layout"],
  },

  // Data Input
  {
    name: "Checkbox",
    description: "Selection checkboxes for multiple choice inputs and forms",
    path: "/components/input/checkbox",
    category: "Input",
    categoryColor: "info",
    preview: (
      <div class="flex gap-2">
        <Checkbox checked />
        <Checkbox color="primary" checked />
        <Checkbox color="secondary" checked />
      </div>
    ),
    tags: ["form", "selection", "input"],
  },
  {
    name: "Input",
    description: "Text input fields with various types, sizes, and validation states",
    path: "/components/input/input",
    category: "Input",
    categoryColor: "info",
    preview: (
      <div class="space-y-2">
        <Input placeholder="Enter text..." size="sm" />
        <Input color="primary" placeholder="Primary input" size="sm" />
      </div>
    ),
    tags: ["form", "text", "field"],
  },

  // Feedback
  {
    name: "Alert",
    description: "Notification messages for success, warnings, errors, and information",
    path: "/components/feedback/alert",
    category: "Feedback",
    categoryColor: "warning",
    preview: (
      <div class="space-y-1">
        <Alert color="success">
          <span class="text-xs">Success message</span>
        </Alert>
        <Alert color="warning">
          <span class="text-xs">Warning message</span>
        </Alert>
      </div>
    ),
    tags: ["notification", "message", "status"],
  },
  {
    name: "Loading",
    description: "Loading spinners and indicators for asynchronous operations",
    path: "/components/feedback/loading",
    category: "Feedback",
    categoryColor: "warning",
    preview: (
      <div class="flex gap-2">
        <Loading size="sm" />
        <Loading type="dots" size="sm" />
        <Loading type="ring" size="sm" />
      </div>
    ),
    tags: ["spinner", "loader", "async"],
  },
  {
    name: "Progress",
    description: "Progress bars for showing completion status and loading states",
    path: "/components/feedback/progress",
    category: "Feedback",
    categoryColor: "warning",
    preview: (
      <div class="space-y-2 w-full">
        <Progress value={30} max={100} color="primary" />
        <Progress value={70} max={100} color="success" />
      </div>
    ),
    tags: ["progress", "completion", "status"],
  },
];

const categories = [
  { name: "All", count: components.length, color: "neutral" },
  { name: "Actions", count: 5, color: "primary" },
  { name: "Display", count: 13, color: "secondary" },
  { name: "Navigation", count: 7, color: "accent" },
  { name: "Input", count: 9, color: "info" },
  { name: "Layout", count: 9, color: "success" },
  { name: "Feedback", count: 7, color: "warning" },
  { name: "Mockup", count: 4, color: "error" },
];

export default function ComponentsPage() {
  return (
    <>
      {/* Page Header */}
      <header class="bg-gradient-to-r from-primary/5 to-secondary/5 border-b border-base-300">
        <div class="px-4 lg:px-6 pt-20 pb-8">
          <div class="max-w-4xl">
            <h1 class="text-3xl lg:text-4xl font-bold text-base-content mb-2">
              Component Library
            </h1>
            <p class="text-lg text-base-content/70 max-w-2xl">
              Explore our comprehensive collection of DaisyUI components built for Fresh 2.0
            </p>
          </div>
        </div>
      </header>

      {/* Breadcrumbs */}
      <nav class="bg-base-200/50 border-b border-base-300">
        <div class="px-4 lg:px-6 py-3">
          <Breadcrumbs
            size="sm"
            items={[
              { label: "Home", href: "/" },
              { label: "Components", active: true }
            ]}
          />
        </div>
      </nav>

      <div class="px-4 lg:px-6 py-8">
        <div class="max-w-7xl mx-auto">
          {/* Static Search Bar */}
          <div class="mb-8">
            {/* Category Filters */}
            <div class="flex flex-wrap gap-2">
              {categories.map((category) => (
                <Button
                  key={category.name}
                  size="sm"
                  color={category.name === "All" ? category.color : undefined}
                  variant={category.name === "All" ? undefined : "outline"}
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
                {components.length} Components
              </h2>
            </div>
          </div>

          {/* Components Grid */}
          <div class="card-grid-responsive">
            {components.map((component) => (
              <ComponentPreviewCard
                key={component.name}
                name={component.name}
                description={component.description}
                path={component.path}
                category={component.category}
                preview={component.preview}
                color={component.categoryColor}
              />
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
