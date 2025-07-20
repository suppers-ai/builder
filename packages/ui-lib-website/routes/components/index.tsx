import {
  // Actions
  Button,
  Dropdown,
  Modal,
  Swap,
  ThemeController,
  LoginButton,
  SearchButton,
  SearchModal,
  
  // Display
  Accordion,
  Avatar,
  Badge,
  Card,
  Carousel,
  ChatBubble,
  Collapse,
  Countdown,
  Diff,
  Kbd,
  Stat,
  Table,
  Timeline,
  ComponentPreviewCard,
  
  // Navigation
  Breadcrumbs,
  Dock,
  Link,
  Menu,
  Navbar,
  Pagination,
  Steps,
  Tabs,
  UserProfileDropdown,
  
  // Input
  Checkbox,
  ColorInput,
  DateInput,
  DatetimeInput,
  EmailInput,
  FileInput,
  Input,
  NumberInput,
  PasswordInput,
  Radio,
  Range,
  Rating,
  Select,
  Textarea,
  TimeInput,
  Toggle,
  
  // Layout
  Artboard,
  Divider,
  Drawer,
  Footer,
  Hero,
  Indicator,
  Join,
  Mask,
  Stack,
  
  // Feedback
  Alert,
  Loading,
  Progress,
  RadialProgress,
  Skeleton,
  Toast,
  Tooltip,
  
  // Mockup
  BrowserMockup,
  CodeMockup,
  PhoneMockup,
  WindowMockup,
} from "@suppers/ui-lib";
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
            <li><a>Item 1</a></li>
            <li><a>Item 2</a></li>
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
    preview: <ThemeController />,
    tags: ["theme", "appearance", "settings"],
  },
  {
    name: "Login Button",
    description: "Authentication login button with built-in OAuth integration",
    path: "/components/action/login-button",
    category: "Actions",
    categoryColor: "primary",
    preview: <LoginButton />,
    tags: ["auth", "login", "oauth"],
  },
  {
    name: "Search Button",
    description: "Search trigger button for opening search interfaces",
    path: "/components/action/search-button",
    category: "Actions",
    categoryColor: "primary",
    preview: <SearchButton />,
    tags: ["search", "trigger", "interface"],
  },
  {
    name: "Search Modal",
    description: "Full-featured search modal with results and filtering",
    path: "/components/action/search-modal",
    category: "Actions",
    categoryColor: "primary",
    preview: (
      <div class="mockup-window border bg-base-300 scale-75">
        <div class="flex justify-center px-4 py-8 bg-base-200">
          <div class="text-center">
            <h3 class="font-bold text-sm">Search Modal</h3>
            <p class="text-xs">Search interface</p>
          </div>
        </div>
      </div>
    ),
    tags: ["search", "modal", "filter"],
  },

  // Display
  {
    name: "Accordion",
    description: "Collapsible content sections with expand/collapse functionality",
    path: "/components/display/accordion",
    category: "Display",
    categoryColor: "secondary",
    preview: (
      <Accordion>
        <div class="collapse-title text-sm font-medium">Accordion Item</div>
        <div class="collapse-content"><p class="text-xs">Content goes here</p></div>
      </Accordion>
    ),
    tags: ["collapsible", "expand", "content"],
  },
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
        <Avatar online src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.jpg" />
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
  {
    name: "Carousel",
    description: "Image and content sliders with navigation controls",
    path: "/components/display/carousel",
    category: "Display",
    categoryColor: "secondary",
    preview: (
      <div class="carousel w-full max-w-xs">
        <div class="carousel-item w-full">
          <div class="w-full h-20 bg-primary/20 flex items-center justify-center text-xs">Slide 1</div>
        </div>
      </div>
    ),
    tags: ["slider", "images", "gallery"],
  },
  {
    name: "Chat Bubble",
    description: "Messaging interfaces with chat bubble styling",
    path: "/components/display/chat-bubble",
    category: "Display",
    categoryColor: "secondary",
    preview: (
      <div class="chat chat-start">
        <div class="chat-bubble text-xs">Hello! How are you?</div>
      </div>
    ),
    tags: ["chat", "message", "bubble"],
  },
  {
    name: "Collapse",
    description: "Expandable content sections with smooth animations",
    path: "/components/display/collapse",
    category: "Display",
    categoryColor: "secondary",
    preview: (
      <Collapse title="Click to expand">
        <p class="text-xs">This content can be collapsed</p>
      </Collapse>
    ),
    tags: ["collapsible", "expand", "toggle"],
  },
  {
    name: "Countdown",
    description: "Timer displays for counting down to specific dates or times",
    path: "/components/display/countdown",
    category: "Display",
    categoryColor: "secondary",
    preview: (
      <div class="grid grid-flow-col gap-2 text-center auto-cols-max">
        <div class="flex flex-col p-2 bg-neutral rounded-box text-neutral-content">
          <span class="countdown font-mono text-sm">15</span>
          <span class="text-xs">days</span>
        </div>
      </div>
    ),
    tags: ["timer", "countdown", "time"],
  },
  {
    name: "Diff",
    description: "Code and text comparison with highlighted differences",
    path: "/components/display/diff",
    category: "Display",
    categoryColor: "secondary",
    preview: (
      <div class="diff aspect-[16/9] scale-75">
        <div class="diff-item-1">
          <div class="bg-primary text-primary-content text-xs p-2">- Old line</div>
        </div>
        <div class="diff-item-2">
          <div class="bg-secondary text-secondary-content text-xs p-2">+ New line</div>
        </div>
      </div>
    ),
    tags: ["comparison", "diff", "code"],
  },
  {
    name: "Kbd",
    description: "Keyboard shortcuts and key press display styling",
    path: "/components/display/kbd",
    category: "Display",
    categoryColor: "secondary",
    preview: (
      <div class="flex gap-1">
        <Kbd>⌘</Kbd>
        <Kbd>K</Kbd>
      </div>
    ),
    tags: ["keyboard", "shortcut", "key"],
  },
  {
    name: "Stat",
    description: "Statistics and metrics display with icons and descriptions",
    path: "/components/display/stat",
    category: "Display",
    categoryColor: "secondary",
    preview: (
      <div class="stats shadow scale-75">
        <div class="stat">
          <div class="stat-title text-xs">Total Users</div>
          <div class="stat-value text-sm">31K</div>
          <div class="stat-desc text-xs">Jan 1st - Feb 1st</div>
        </div>
      </div>
    ),
    tags: ["statistics", "metrics", "data"],
  },
  {
    name: "Table",
    description: "Data tables with sorting, filtering, and pagination",
    path: "/components/display/table",
    category: "Display",
    categoryColor: "secondary",
    preview: (
      <div class="overflow-x-auto">
        <table class="table table-xs">
          <thead>
            <tr><th>Name</th><th>Job</th></tr>
          </thead>
          <tbody>
            <tr><td>Cy</td><td>Quality Control</td></tr>
            <tr><td>Hart</td><td>Desktop Support</td></tr>
          </tbody>
        </table>
      </div>
    ),
    tags: ["table", "data", "grid"],
  },
  {
    name: "Timeline",
    description: "Event chronology and process flow visualization",
    path: "/components/display/timeline",
    category: "Display",
    categoryColor: "secondary",
    preview: (
      <ul class="timeline timeline-compact">
        <li>
          <div class="timeline-middle">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="h-3 w-3">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.236 4.53L8.23 10.661a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clipRule="evenodd" />
            </svg>
          </div>
          <div class="timeline-end timeline-box text-xs">First event</div>
          <hr/>
        </li>
      </ul>
    ),
    tags: ["timeline", "chronology", "events"],
  },

  // Navigation
  {
    name: "Breadcrumbs",
    description: "Navigation trails showing the current page location",
    path: "/components/navigation/breadcrumbs",
    category: "Navigation",
    categoryColor: "accent",
    preview: (
      <Breadcrumbs
        size="sm"
        items={[
          { label: "Home", href: "/" },
          { label: "Components", href: "/components" },
          { label: "Current", active: true },
        ]}
      />
    ),
    tags: ["breadcrumbs", "navigation", "trail"],
  },
  {
    name: "Dock",
    description: "Dock-style navigation with icons and shortcuts",
    path: "/components/navigation/dock",
    category: "Navigation",
    categoryColor: "accent",
    preview: (
      <div class="btm-nav btm-nav-xs">
        <button class="active">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
          </svg>
        </button>
        <button>
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </button>
      </div>
    ),
    tags: ["dock", "navigation", "icons"],
  },
  {
    name: "Link",
    description: "Various link styles for navigation and actions",
    path: "/components/navigation/link",
    category: "Navigation",
    categoryColor: "accent",
    preview: (
      <div class="flex gap-2 flex-col">
        <Link href="#" color="primary">Primary Link</Link>
        <Link href="#" color="secondary">Secondary Link</Link>
      </div>
    ),
    tags: ["link", "navigation", "anchor"],
  },
  {
    name: "Menu",
    description: "Navigation menus with hierarchical structure",
    path: "/components/navigation/menu",
    category: "Navigation",
    categoryColor: "accent",
    preview: (
      <ul class="menu bg-base-200 w-32 rounded-box text-xs">
        <li><a>Item 1</a></li>
        <li><a>Item 2</a></li>
        <li><a>Item 3</a></li>
      </ul>
    ),
    tags: ["menu", "navigation", "list"],
  },
  {
    name: "Navbar",
    description: "Top navigation bars with branding and menu items",
    path: "/components/navigation/navbar",
    category: "Navigation",
    categoryColor: "accent",
    preview: (
      <div class="navbar bg-base-100 min-h-0 h-12">
        <div class="flex-1">
          <a class="btn btn-ghost text-xs">Brand</a>
        </div>
        <div class="flex-none">
          <ul class="menu menu-horizontal px-1 text-xs">
            <li><a>Link</a></li>
          </ul>
        </div>
      </div>
    ),
    tags: ["navbar", "header", "navigation"],
  },
  {
    name: "Pagination",
    description: "Page navigation for large datasets and content",
    path: "/components/navigation/pagination",
    category: "Navigation",
    categoryColor: "accent",
    preview: (
      <div class="join">
        <button class="join-item btn btn-xs">1</button>
        <button class="join-item btn btn-xs btn-active">2</button>
        <button class="join-item btn btn-xs">3</button>
      </div>
    ),
    tags: ["pagination", "pages", "navigation"],
  },
  {
    name: "Steps",
    description: "Multi-step processes and progress indicators",
    path: "/components/navigation/steps",
    category: "Navigation",
    categoryColor: "accent",
    preview: (
      <ul class="steps steps-horizontal text-xs">
        <li class="step step-primary">Register</li>
        <li class="step step-primary">Choose plan</li>
        <li class="step">Purchase</li>
      </ul>
    ),
    tags: ["steps", "process", "progress"],
  },
  {
    name: "Tabs",
    description: "Tabbed interfaces for organizing content sections",
    path: "/components/navigation/tabs",
    category: "Navigation",
    categoryColor: "accent",
    preview: (
      <div class="tabs">
        <a class="tab tab-active text-xs">Tab 1</a>
        <a class="tab text-xs">Tab 2</a>
        <a class="tab text-xs">Tab 3</a>
      </div>
    ),
    tags: ["tabs", "tabbed", "interface"],
  },
  {
    name: "User Profile Dropdown",
    description: "User profile menu with avatar and account options",
    path: "/components/navigation/user-profile-dropdown",
    category: "Navigation",
    categoryColor: "accent",
    preview: (
      <div class="dropdown dropdown-end">
        <div tabIndex={0} role="button" class="btn btn-ghost btn-circle avatar">
          <div class="w-6 rounded-full">
            <img alt="User" src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.jpg" />
          </div>
        </div>
      </div>
    ),
    tags: ["user", "profile", "dropdown"],
  },

  // Input
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
    name: "Color Input",
    description: "Color picker input field for selecting colors",
    path: "/components/input/color-input",
    category: "Input",
    categoryColor: "info",
    preview: <ColorInput value="#3b82f6" />,
    tags: ["color", "picker", "input"],
  },
  {
    name: "Date Input",
    description: "Date selection input field with calendar picker",
    path: "/components/input/date-input",
    category: "Input",
    categoryColor: "info",
    preview: <DateInput />,
    tags: ["date", "calendar", "input"],
  },
  {
    name: "Datetime Input",
    description: "Date and time selection input field",
    path: "/components/input/datetime-input",
    category: "Input",
    categoryColor: "info",
    preview: <DatetimeInput />,
    tags: ["datetime", "calendar", "time"],
  },
  {
    name: "Email Input",
    description: "Email address input field with validation",
    path: "/components/input/email-input",
    category: "Input",
    categoryColor: "info",
    preview: <EmailInput placeholder="Enter email..." />,
    tags: ["email", "validation", "input"],
  },
  {
    name: "File Input",
    description: "File upload interfaces with drag and drop support",
    path: "/components/input/file-input",
    category: "Input",
    categoryColor: "info",
    preview: <FileInput />,
    tags: ["file", "upload", "input"],
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
  {
    name: "Number Input",
    description: "Numeric input field with validation and controls",
    path: "/components/input/number-input",
    category: "Input",
    categoryColor: "info",
    preview: <NumberInput placeholder="Enter number..." />,
    tags: ["number", "numeric", "input"],
  },
  {
    name: "Password Input",
    description: "Password input field with visibility toggle",
    path: "/components/input/password-input",
    category: "Input",
    categoryColor: "info",
    preview: <PasswordInput placeholder="Enter password..." />,
    tags: ["password", "secure", "input"],
  },
  {
    name: "Radio",
    description: "Single selection radio buttons for exclusive choices",
    path: "/components/input/radio",
    category: "Input",
    categoryColor: "info",
    preview: (
      <div class="flex gap-2">
        <Radio name="radio-demo" checked />
        <Radio name="radio-demo" />
        <Radio name="radio-demo" />
      </div>
    ),
    tags: ["radio", "selection", "form"],
  },
  {
    name: "Range",
    description: "Slider controls for selecting numeric values",
    path: "/components/input/range",
    category: "Input",
    categoryColor: "info",
    preview: <Range min={0} max={100} value={50} />,
    tags: ["range", "slider", "numeric"],
  },
  {
    name: "Rating",
    description: "Star ratings and review input components",
    path: "/components/input/rating",
    category: "Input",
    categoryColor: "info",
    preview: <Rating value={3} />,
    tags: ["rating", "stars", "review"],
  },
  {
    name: "Select",
    description: "Dropdown selections with single and multiple options",
    path: "/components/input/select",
    category: "Input",
    categoryColor: "info",
    preview: (
      <Select>
        <option>Option 1</option>
        <option>Option 2</option>
        <option>Option 3</option>
      </Select>
    ),
    tags: ["select", "dropdown", "options"],
  },
  {
    name: "Textarea",
    description: "Multi-line text input for longer content",
    path: "/components/input/textarea",
    category: "Input",
    categoryColor: "info",
    preview: <Textarea placeholder="Enter text..." rows={3} />,
    tags: ["textarea", "text", "multiline"],
  },
  {
    name: "Text Input",
    description: "Basic text input component for single-line text",
    path: "/components/input/text-input",
    category: "Input",
    categoryColor: "info",
    preview: <Input type="text" placeholder="Text input..." />,
    tags: ["text", "input", "form"],
  },
  {
    name: "Time Input",
    description: "Time selection input field with picker",
    path: "/components/input/time-input",
    category: "Input",
    categoryColor: "info",
    preview: <TimeInput />,
    tags: ["time", "picker", "input"],
  },
  {
    name: "Toggle",
    description: "On/off switches for binary state controls",
    path: "/components/input/toggle",
    category: "Input",
    categoryColor: "info",
    preview: (
      <div class="flex gap-2">
        <Toggle checked />
        <Toggle color="primary" checked />
        <Toggle color="secondary" />
      </div>
    ),
    tags: ["toggle", "switch", "binary"],
  },

  // Layout
  {
    name: "Artboard",
    description: "Design canvases and mockup containers",
    path: "/components/layout/artboard",
    category: "Layout",
    categoryColor: "success",
    preview: (
      <div class="artboard artboard-demo phone-1 scale-50">
        <div class="text-xs">320×568</div>
      </div>
    ),
    tags: ["artboard", "canvas", "mockup"],
  },
  {
    name: "Divider",
    description: "Section separators with optional text labels",
    path: "/components/layout/divider",
    category: "Layout",
    categoryColor: "success",
    preview: (
      <div class="flex flex-col w-full">
        <div class="text-xs">Content above</div>
        <Divider>OR</Divider>
        <div class="text-xs">Content below</div>
      </div>
    ),
    tags: ["divider", "separator", "section"],
  },
  {
    name: "Drawer",
    description: "Side panel layouts with sliding animations",
    path: "/components/layout/drawer",
    category: "Layout",
    categoryColor: "success",
    preview: (
      <div class="mockup-window border bg-base-300 scale-75">
        <div class="flex justify-center px-4 py-8 bg-base-200">
          <div class="text-center">
            <h3 class="font-bold text-sm">Drawer Layout</h3>
            <p class="text-xs">Side panel interface</p>
          </div>
        </div>
      </div>
    ),
    tags: ["drawer", "sidebar", "panel"],
  },
  {
    name: "Footer",
    description: "Page footers with links and information",
    path: "/components/layout/footer",
    category: "Layout",
    categoryColor: "success",
    preview: (
      <footer class="footer p-4 bg-neutral text-neutral-content text-xs">
        <aside>
          <p>Copyright © 2024 - All right reserved</p>
        </aside>
      </footer>
    ),
    tags: ["footer", "bottom", "links"],
  },
  {
    name: "Hero",
    description: "Landing page hero sections with call-to-action",
    path: "/components/layout/hero",
    category: "Layout",
    categoryColor: "success",
    preview: (
      <div class="hero min-h-32 bg-base-200">
        <div class="hero-content text-center">
          <div class="max-w-md">
            <h1 class="text-lg font-bold">Hero Title</h1>
            <p class="text-xs py-2">Hero description text</p>
          </div>
        </div>
      </div>
    ),
    tags: ["hero", "landing", "banner"],
  },
  {
    name: "Indicator",
    description: "Notification badges and status indicators",
    path: "/components/layout/indicator",
    category: "Layout",
    categoryColor: "success",
    preview: (
      <div class="indicator">
        <span class="indicator-item badge badge-secondary text-xs">new</span>
        <div class="grid w-16 h-16 bg-base-300 place-items-center text-xs">content</div>
      </div>
    ),
    tags: ["indicator", "badge", "notification"],
  },
  {
    name: "Join",
    description: "Connected elements and button groups",
    path: "/components/layout/join",
    category: "Layout",
    categoryColor: "success",
    preview: (
      <div class="join">
        <button class="btn join-item btn-xs">Button</button>
        <button class="btn join-item btn-xs">Button</button>
        <button class="btn join-item btn-xs">Button</button>
      </div>
    ),
    tags: ["join", "connected", "group"],
  },
  {
    name: "Mask",
    description: "Image masking and shape overlays",
    path: "/components/layout/mask",
    category: "Layout",
    categoryColor: "success",
    preview: (
      <div class="mask mask-squircle w-12 h-12 bg-primary"></div>
    ),
    tags: ["mask", "image", "shape"],
  },
  {
    name: "Stack",
    description: "Layered layouts and z-index management",
    path: "/components/layout/stack",
    category: "Layout",
    categoryColor: "success",
    preview: (
      <div class="stack">
        <div class="grid w-16 h-12 rounded bg-primary place-content-center text-primary-content text-xs">1</div>
        <div class="grid w-16 h-12 rounded bg-accent place-content-center text-accent-content text-xs">2</div>
        <div class="grid w-16 h-12 rounded bg-secondary place-content-center text-secondary-content text-xs">3</div>
      </div>
    ),
    tags: ["stack", "layers", "z-index"],
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
  {
    name: "Radial Progress",
    description: "Circular progress indicators with percentage display",
    path: "/components/feedback/radial-progress",
    category: "Feedback",
    categoryColor: "warning",
    preview: (
      <div class="flex gap-2">
        <RadialProgress value={70} />
        <RadialProgress value={40} color="primary" />
      </div>
    ),
    tags: ["progress", "radial", "circular"],
  },
  {
    name: "Skeleton",
    description: "Loading placeholders that mimic content structure",
    path: "/components/feedback/skeleton",
    category: "Feedback",
    categoryColor: "warning",
    preview: (
      <div class="flex flex-col gap-2 w-32">
        <div class="skeleton h-4 w-28"></div>
        <div class="skeleton h-4 w-full"></div>
        <div class="skeleton h-4 w-full"></div>
      </div>
    ),
    tags: ["skeleton", "loading", "placeholder"],
  },
  {
    name: "Toast",
    description: "Temporary messages and notifications",
    path: "/components/feedback/toast",
    category: "Feedback",
    categoryColor: "warning",
    preview: (
      <div class="toast toast-top toast-end">
        <div class="alert alert-info">
          <span class="text-xs">New message!</span>
        </div>
      </div>
    ),
    tags: ["toast", "notification", "temporary"],
  },
  {
    name: "Tooltip",
    description: "Hover information and contextual help",
    path: "/components/feedback/tooltip",
    category: "Feedback",
    categoryColor: "warning",
    preview: (
      <Tooltip content="Hello world">
        <Button size="sm">Hover me</Button>
      </Tooltip>
    ),
    tags: ["tooltip", "hover", "help"],
  },

  // Mockup
  {
    name: "Browser Mockup",
    description: "Web page frames and browser window mockups",
    path: "/components/mockup/browser-mockup",
    category: "Mockup",
    categoryColor: "error",
    preview: (
      <div class="mockup-browser border bg-base-300 scale-50">
        <div class="mockup-browser-toolbar">
          <div class="input text-xs">https://daisyui.com</div>
        </div>
        <div class="flex justify-center px-4 py-8 bg-base-200">
          <div class="text-xs">Browser content</div>
        </div>
      </div>
    ),
    tags: ["mockup", "browser", "frame"],
  },
  {
    name: "Code Mockup",
    description: "Code display frames and terminal mockups",
    path: "/components/mockup/code-mockup",
    category: "Mockup",
    categoryColor: "error",
    preview: (
      <div class="mockup-code scale-75">
        <pre data-prefix="$"><code class="text-xs">npm i daisyui</code></pre>
        <pre data-prefix=">" class="text-warning"><code class="text-xs">installing...</code></pre>
        <pre data-prefix=">" class="text-success"><code class="text-xs">Done!</code></pre>
      </div>
    ),
    tags: ["mockup", "code", "terminal"],
  },
  {
    name: "Phone Mockup",
    description: "Mobile app frames and phone mockups",
    path: "/components/mockup/phone-mockup",
    category: "Mockup",
    categoryColor: "error",
    preview: (
      <div class="mockup-phone scale-50">
        <div class="camera"></div>
        <div class="display">
          <div class="artboard artboard-demo phone-1">
            <div class="text-xs">Mobile app</div>
          </div>
        </div>
      </div>
    ),
    tags: ["mockup", "phone", "mobile"],
  },
  {
    name: "Window Mockup",
    description: "Desktop app frames and window mockups",
    path: "/components/mockup/window-mockup",
    category: "Mockup",
    categoryColor: "error",
    preview: (
      <div class="mockup-window border bg-base-300 scale-75">
        <div class="flex justify-center px-4 py-8 bg-base-200">
          <div class="text-xs">Desktop application</div>
        </div>
      </div>
    ),
    tags: ["mockup", "window", "desktop"],
  },
];

const categories = [
  { name: "All", count: components.length, color: "neutral" },
  { name: "Actions", count: 8, color: "primary" },
  { name: "Display", count: 13, color: "secondary" },
  { name: "Navigation", count: 9, color: "accent" },
  { name: "Input", count: 17, color: "info" },
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
              { label: "Components", active: true },
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
