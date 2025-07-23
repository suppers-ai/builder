import {
  ComponentCategory,
  ComponentExample,
  ComponentMetadata,
  ComponentProp,
} from "../../types.ts";
import { Dropdown } from "./Dropdown.tsx";

const dropdownExamples: ComponentExample[] = [
  {
    title: "Basic Dropdown",
    description: "Simple dropdown menu with button trigger",
    code: `<div class="dropdown">
  <div tabIndex={0} role="button" class="btn m-1">Click me</div>
  <ul tabIndex={0} class="dropdown-content menu bg-base-100 rounded-box z-[1] w-52 p-2 shadow">
    <li><a>Item 1</a></li>
    <li><a>Item 2</a></li>
    <li><a>Item 3</a></li>
  </ul>
</div>`,
    showCode: true,
  },
  {
    title: "Dropdown Positions",
    description: "Different dropdown positions",
    code: `<div class="dropdown dropdown-top">
  <div tabIndex={0} role="button" class="btn m-1">Top</div>
  <ul tabIndex={0} class="dropdown-content menu bg-base-100 rounded-box z-[1] w-52 p-2 shadow">
    <li><a>Item 1</a></li>
    <li><a>Item 2</a></li>
  </ul>
</div>
<div class="dropdown dropdown-end">
  <div tabIndex={0} role="button" class="btn m-1">End</div>
  <ul tabIndex={0} class="dropdown-content menu bg-base-100 rounded-box z-[1] w-52 p-2 shadow">
    <li><a>Item 1</a></li>
    <li><a>Item 2</a></li>
  </ul>
</div>`,
    showCode: true,
  },
  {
    title: "Hover Dropdown",
    description: "Dropdown that opens on hover",
    code: `<div class="dropdown dropdown-hover">
  <div tabIndex={0} role="button" class="btn btn-outline m-1">Hover Me</div>
  <ul tabIndex={0} class="dropdown-content menu bg-base-100 rounded-box z-[1] w-52 p-2 shadow">
    <li><a>Quick Action 1</a></li>
    <li><a>Quick Action 2</a></li>
    <li><a>Quick Action 3</a></li>
  </ul>
</div>`,
    showCode: true,
  },
  {
    title: "User Profile Dropdown",
    description: "Real-world example with avatar and actions",
    code: `<div class="dropdown dropdown-end">
  <div tabIndex={0} role="button" class="btn btn-ghost btn-circle avatar">
    <div class="w-10 rounded-full">
      <img alt="User" src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp" />
    </div>
  </div>
  <ul tabIndex={0} class="dropdown-content menu bg-base-100 rounded-box z-[1] w-52 p-2 shadow">
    <li class="menu-title"><span>John Doe</span></li>
    <li><a>Profile</a></li>
    <li><a>Settings</a></li>
    <li><hr class="my-2" /></li>
    <li><a class="text-error">Sign out</a></li>
  </ul>
</div>`,
    showCode: true,
  },
];

const dropdownProps: ComponentProp[] = [
  {
    name: "trigger",
    type: "ComponentChildren",
    description: "Element that triggers the dropdown",
    required: true,
  },
  {
    name: "content",
    type: "ComponentChildren",
    description: "Dropdown menu content",
    required: true,
  },
  {
    name: "position",
    type:
      "'top' | 'bottom' | 'left' | 'right' | 'top-start' | 'top-end' | 'bottom-start' | 'bottom-end'",
    description: "Position of dropdown relative to trigger",
    default: "bottom",
  },
  {
    name: "hover",
    type: "boolean",
    description: "Whether to trigger on hover",
    default: "false",
  },
  {
    name: "open",
    type: "boolean",
    description: "Control dropdown open state",
    default: "false",
  },
  {
    name: "forceOpen",
    type: "boolean",
    description: "Force dropdown to stay open",
    default: "false",
  },
];

export const dropdownMetadata: ComponentMetadata = {
  name: "Dropdown",
  description: "Dropdown menus for navigation and actions with customizable trigger and content",
  category: ComponentCategory.ACTION,
  path: "/components/action/dropdown",
  tags: ["menu", "navigation", "popup", "list"],
  relatedComponents: ["button", "menu", "navbar"],
  interactive: true, // Requires island mode for click handling
  preview: (
    <Dropdown
      trigger={<button class="btn btn-primary">Open Menu</button>}
      content={
        <>
          <li>
            <a>Item 1</a>
          </li>
          <li>
            <a>Item 2</a>
          </li>
          <li>
            <a>Item 3</a>
          </li>
        </>
      }
    />
  ),
  examples: dropdownExamples,
  props: dropdownProps,
  variants: ["basic", "hover", "position", "user-profile"],
  useCases: ["Navigation menus", "User actions", "Context menus", "Filter options"],
  usageNotes: [
    "Use trigger prop for the clickable element that opens the dropdown",
    "Use content prop for the dropdown menu items",
    "Position prop controls where the dropdown appears relative to trigger",
    "Hover prop enables hover-to-open behavior",
    "Great for navigation menus, context menus, and action lists",
  ],
};
