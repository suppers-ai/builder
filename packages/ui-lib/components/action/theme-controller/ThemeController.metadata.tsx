import { ComponentMetadata, ComponentExample, ComponentCategory } from "../../types.ts";
import { ThemeController } from "./ThemeController.tsx";

const themeControllerExamples: ComponentExample[] = [
  {
    title: "Dropdown Theme Selector",
    description: "Dropdown with multiple theme options and color previews",
    code: `<ThemeController
  variant="dropdown"
  themes={["light", "dark", "cupcake", "cyberpunk", "synthwave"]}
  currentTheme="light"
  showLabel={true}
/>`,
    showCode: true,
  },
  {
    title: "Toggle Switch",
    description: "Simple toggle for light/dark mode switching",
    code: `<ThemeController
  variant="toggle"
  themes={["light", "dark"]}
  currentTheme="light"
  showLabel={true}
/>`,
    showCode: true,
  },
  {
    title: "Radio Button Group",
    description: "Radio buttons for theme selection",
    code: `<ThemeController
  variant="radio"
  themes={["light", "dark", "cupcake", "emerald"]}
  currentTheme="light"
  showLabel={true}
/>`,
    showCode: true,
  },
  {
    title: "Card-style Theme Picker",
    description: "Rich theme selector with preview cards",
    code: `<ThemeController
  variant="dropdown"
  themes={["corporate", "business", "luxury", "wireframe"]}
  currentTheme="corporate"
  showPreview={true}
  size="lg"
/>`,
    showCode: true,
  },
];

export const themeControllerMetadata: ComponentMetadata = {
  name: "Theme Controller",
  description: "Theme switching",
  category: ComponentCategory.ACTION,
  path: "/components/action/theme-controller",
  tags: ["theme", "dark", "light", "mode", "appearance", "switch"],
  examples: themeControllerExamples,
  relatedComponents: ["swap", "dropdown", "radio"],
  preview: (
    <div class="flex gap-4 items-center">
      <ThemeController
        variant="toggle"
        themes={["light", "dark"]}
        currentTheme="light"
        size="sm"
      />
      <ThemeController
        variant="dropdown"
        themes={["light", "dark", "cupcake", "cyberpunk"]}
        currentTheme="light"
        size="sm"
      />
    </div>
  ),
};
