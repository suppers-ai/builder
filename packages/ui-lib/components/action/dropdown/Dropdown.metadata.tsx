import { ComponentMetadata } from "../../types.ts";
import { Dropdown } from "./Dropdown.tsx";

export const dropdownMetadata: ComponentMetadata = {
  name: "Dropdown",
  description: "Dropdown menus",
  category: "Actions",
  path: "/components/action/dropdown",
  tags: ["menu", "select", "options", "navigation"],
  examples: ["basic", "hover", "click", "nested"],
  relatedComponents: ["button", "menu"],
  preview: (
    <Dropdown
      trigger={<button class="btn btn-primary">Open Menu</button>}
      content={
        <>
          <li><a>Item 1</a></li>
          <li><a>Item 2</a></li>
          <li><a>Item 3</a></li>
        </>
      }
    />
  ),
};
