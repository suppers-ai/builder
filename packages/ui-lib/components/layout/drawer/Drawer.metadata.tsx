import { ComponentCategory, ComponentExample, ComponentMetadata } from "../../types.ts";
import { Drawer } from "./Drawer.tsx";

const drawerExamples: ComponentExample[] = [
  {
    title: "Basic Drawer",
    description: "Simple sliding drawer panel",
    code: `<Drawer
  sidebarContent={
    <ul class="menu p-4 w-80 bg-base-200">
      <li><a>Home</a></li>
      <li><a>Projects</a></li>
      <li><a>Settings</a></li>
    </ul>
  }
  open
>
  <div class="p-4">
    <h2 class="text-2xl font-bold">Main Content</h2>
    <p>This is the main content area.</p>
  </div>
</Drawer>`,
    showCode: true,
  },
  {
    title: "Drawer with Overlay",
    description: "Drawer with background overlay",
    code: `<Drawer
  sidebarContent={
    <div class="p-4 w-80 bg-base-200">
      <h3 class="text-lg font-bold mb-4">Navigation</h3>
      <nav class="space-y-2">
        <a href="#" class="block py-2 px-4 hover:bg-base-300 rounded">Dashboard</a>
        <a href="#" class="block py-2 px-4 hover:bg-base-300 rounded">Analytics</a>
        <a href="#" class="block py-2 px-4 hover:bg-base-300 rounded">Reports</a>
      </nav>
    </div>
  }
  open
  showOverlay
>
  <div class="p-4">
    <p>Main content with overlay drawer.</p>
  </div>
</Drawer>`,
    showCode: true,
  },
  {
    title: "Responsive Drawer",
    description: "Drawer that adapts to screen size",
    code: `<Drawer
  sidebarContent={
    <div class="p-4 w-80 bg-base-200">
      <h3 class="text-lg font-bold mb-4">Mobile Menu</h3>
      <div class="space-y-2">
        <button class="btn btn-ghost justify-start w-full">
          <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"/>
          </svg>
          Home
        </button>
        <button class="btn btn-ghost justify-start w-full">
          <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          Projects
        </button>
      </div>
    </div>
  }
  responsive
  breakpoint="lg"
>
  <div class="p-4">
    <p>Content that works on mobile and desktop.</p>
  </div>
</Drawer>`,
    showCode: true,
  },
  {
    title: "Drawer with Navbar",
    description: "Drawer integrated with navigation bar",
    code: `<Drawer
  sidebarContent={
    <ul class="menu p-4 w-80 bg-base-200">
      <li><a>Dashboard</a></li>
      <li><a>Users</a></li>
      <li><a>Settings</a></li>
      <li><a>Logout</a></li>
    </ul>
  }
  navbar={
    <div class="navbar bg-base-300">
      <div class="flex-none">
        <button class="btn btn-square btn-ghost">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"/>
          </svg>
        </button>
      </div>
      <div class="flex-1">
        <a class="btn btn-ghost text-xl">My App</a>
      </div>
    </div>
  }
>
  <div class="p-4">
    <p>Main content with integrated navbar.</p>
  </div>
</Drawer>`,
    showCode: true,
  },
  {
    title: "End Drawer",
    description: "Drawer that slides from the right side",
    code: `<Drawer
  sidebarContent={
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
  }
  position="right"
  open
>
  <div class="p-4">
    <p>Main content with right-side drawer.</p>
  </div>
</Drawer>`,
    showCode: true,
  },
];

export const drawerMetadata: ComponentMetadata = {
  name: "Drawer",
  description: "Slide-out navigation",
  category: ComponentCategory.LAYOUT,
  path: "/components/layout/drawer",
  tags: ["drawer", "sidebar", "navigation", "slide", "mobile", "menu"],
  examples: drawerExamples,
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
