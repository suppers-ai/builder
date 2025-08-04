import {
  ComponentCategory,
  ComponentExample,
  ComponentMetadata,
  ComponentSchema,
} from "../../types.ts";
import { Drawer } from "./Drawer.tsx";
import {
  DrawerPropsSchema,
  safeValidateDrawerProps,
  validateDrawerProps,
} from "./Drawer.schema.ts";

const drawerExamples: ComponentExample[] = [
  {
    title: "Basic Drawer",
    description: "Simple sliding drawer panel",
    props: {
      sidebarContent: (
        <ul class="menu p-4 w-80 bg-base-200">
          <li>
            <a>Home</a>
          </li>
          <li>
            <a>Projects</a>
          </li>
          <li>
            <a>Settings</a>
          </li>
        </ul>
      ),
      open: true,
      children: (
        <div class="p-4">
          <h2 class="text-2xl font-bold">Main Content</h2>
          <p>This is the main content area.</p>
        </div>
      ),
    },
  },
  {
    title: "Drawer with Overlay",
    description: "Drawer with background overlay",
    props: {
      sidebarContent: (
        <div class="p-4 w-80 bg-base-200">
          <h3 class="text-lg font-bold mb-4">Navigation</h3>
          <nav class="space-y-2">
            <a href="#" class="block py-2 px-4 hover:bg-base-300 rounded">Dashboard</a>
            <a href="#" class="block py-2 px-4 hover:bg-base-300 rounded">Analytics</a>
            <a href="#" class="block py-2 px-4 hover:bg-base-300 rounded">Reports</a>
          </nav>
        </div>
      ),
      open: true,
      showOverlay: true,
      children: (
        <div class="p-4">
          <p>Main content with overlay drawer.</p>
        </div>
      ),
    },
  },
  {
    title: "Responsive Drawer",
    description: "Drawer that adapts to screen size",
    props: {
      sidebarContent: (
        <div class="p-4 w-80 bg-base-200">
          <h3 class="text-lg font-bold mb-4">Mobile Menu</h3>
          <div class="space-y-2">
            <button class="btn btn-ghost justify-start w-full">
              🏠 Home
            </button>
            <button class="btn btn-ghost justify-start w-full">
              📊 Projects
            </button>
          </div>
        </div>
      ),
      responsive: true,
      breakpoint: "lg" as const,
      children: (
        <div class="p-4">
          <p>Content that works on mobile and desktop.</p>
        </div>
      ),
    },
  },
  {
    title: "Drawer with Navbar",
    description: "Drawer integrated with navigation bar",
    props: {
      sidebarContent: (
        <ul class="menu p-4 w-80 bg-base-200">
          <li>
            <a>Dashboard</a>
          </li>
          <li>
            <a>Users</a>
          </li>
          <li>
            <a>Settings</a>
          </li>
          <li>
            <a>Logout</a>
          </li>
        </ul>
      ),
      navbar: (
        <div class="navbar bg-base-300">
          <div class="flex-none">
            <button class="btn btn-square btn-ghost">
              ☰
            </button>
          </div>
          <div class="flex-1">
            <a class="btn btn-ghost text-xl">My App</a>
          </div>
        </div>
      ),
      children: (
        <div class="p-4">
          <p>Main content with integrated navbar.</p>
        </div>
      ),
    },
  },
  {
    title: "End Drawer",
    description: "Drawer that slides from the right side",
    props: {
      sidebarContent: (
        <div class="p-4 w-80 bg-base-200">
          <h3 class="text-lg font-bold mb-4">Settings Panel</h3>
          <div class="space-y-4">
            <div class="form-control">
              <label class="label cursor-pointer">
                <span class="label-text">Dark Mode</span>
                <input type="checkbox" class="toggle toggle-primary" />
              </label>
            </div>
            <div class="form-control">
              <label class="label cursor-pointer">
                <span class="label-text">Notifications</span>
                <input type="checkbox" class="toggle toggle-primary" checked />
              </label>
            </div>
            <button class="btn btn-primary w-full">Save Settings</button>
          </div>
        </div>
      ),
      position: "right" as const,
      open: true,
      children: (
        <div class="p-4">
          <p>Main content with right-side drawer.</p>
        </div>
      ),
    },
  },
];

const drawerSchema: ComponentSchema = {
  schema: DrawerPropsSchema,
  validateFn: validateDrawerProps,
  safeValidateFn: safeValidateDrawerProps,
};

export const drawerMetadata: ComponentMetadata = {
  name: "Drawer",
  description: "Slide-out navigation",
  category: ComponentCategory.LAYOUT,
  path: "/components/layout/drawer",
  tags: ["drawer", "sidebar", "navigation", "slide", "mobile", "menu"],
  examples: drawerExamples,
  schema: drawerSchema,
  relatedComponents: ["navbar", "menu", "modal"],
  preview: (
    <div class="w-64 h-48">
      <Drawer
        sidebarContent={
          <ul class="menu p-4 w-48 bg-base-200">
            <li>
              <a>Home</a>
            </li>
            <li>
              <a>About</a>
            </li>
            <li>
              <a>Contact</a>
            </li>
          </ul>
        }
        open
      >
        <div class="p-4">Main content area</div>
      </Drawer>
    </div>
  ),
};
