import {
  ComponentCategory,
  ComponentExample,
  ComponentMetadata,
  ComponentSchema} from "../../types.ts";
import { Dropdown } from "./Dropdown.tsx";
import {
  DropdownPropsSchema,
  safeValidateDropdownProps,
  validateDropdownProps} from "./Dropdown.schema.ts";

const dropdownExamples: ComponentExample[] = [
  {
    title: "Basic Dropdown",
    description: "Simple dropdown menu with button trigger",
    props: {
      trigger: <button class="btn btn-primary">Click me</button>,
      content: (
        <>
          <li><a>Item 1</a></li>
          <li><a>Item 2</a></li>
          <li><a>Item 3</a></li>
        </>
      )
    }
  },
  {
    title: "Dropdown Positions",
    description: "Different dropdown positions",
    props: [
      {
        trigger: <button class="btn btn-secondary">Top</button>,
        content: (
          <>
            <li><a>Item 1</a></li>
            <li><a>Item 2</a></li>
          </>
        ),
        position: "top" as const},
      {
        trigger: <button class="btn btn-accent">Bottom End</button>,
        content: (
          <>
            <li><a>Item 1</a></li>
            <li><a>Item 2</a></li>
          </>
        ),
        position: "bottom-end" as const},
    ]},
  {
    title: "Hover Dropdown",
    description: "Dropdown that opens on hover",
    props: {
      trigger: <button class="btn btn-outline">Hover Me</button>,
      content: (
        <>
          <li><a>Quick Action 1</a></li>
          <li><a>Quick Action 2</a></li>
          <li><a>Quick Action 3</a></li>
        </>
      ),
      hover: true
    }
  },
  {
    title: "User Profile Dropdown",
    description: "Real-world example with avatar and actions",
    props: {
      trigger: (
        <div class="btn btn-ghost btn-circle avatar">
          <div class="w-10 rounded-full">
            <img alt="User" src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp" />
          </div>
        </div>
      ),
      content: (
        <>
          <li class="menu-title"><span>John Doe</span></li>
          <li><a>Profile</a></li>
          <li><a>Settings</a></li>
          <li><hr class="my-2" /></li>
          <li><a class="text-error">Sign out</a></li>
        </>
      ),
      position: "bottom-end" as const}
        }
      ];;

const dropdownSchema: ComponentSchema = {
  schema: DropdownPropsSchema,
  validateFn: validateDropdownProps,
  safeValidateFn: safeValidateDropdownProps};

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
  schema: dropdownSchema,
  variants: ["basic", "hover", "position", "user-profile"],
  useCases: ["Navigation menus", "User actions", "Context menus", "Filter options"],
  usageNotes: [
    "Use trigger prop for the clickable element that opens the dropdown",
    "Use content prop for the dropdown menu items",
    "Position prop controls where the dropdown appears relative to trigger",
    "Hover prop enables hover-to-open behavior",
    "Great for navigation menus, context menus, and action lists",
  ]};
