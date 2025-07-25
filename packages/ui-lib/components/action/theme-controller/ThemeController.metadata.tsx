import { ComponentMetadata, ComponentExample, ComponentCategory } from "../../types.ts";
import { ThemeController } from "./ThemeController.tsx";

const themeControllerExamples: ComponentExample[] = [
  {
    title: "Basic Example",
    description: "Basic usage of the component",
    code: `<ThemeController />`,
    props: {},
    showCode: true,
  },
  {
    title: "With Selected Themes",
    description: "Theme controller with a subset of available themes",
    code: `<ThemeController
  themes={["light", "dark", "cupcake", "cyberpunk", "synthwave"]}
  currentTheme="light"
  showLabel={true}
/>`,
    props: {
      themes: ["light", "dark", "cupcake", "cyberpunk", "synthwave"],
      currentTheme: "light",
      showLabel: true,
    },
    showCode: true,
  },
  {
    title: "Without Label",
    description: "Theme controller button without text label",
    code: `<ThemeController
  themes={["light", "dark", "corporate", "luxury"]}
  currentTheme="light"
  showLabel={false}
/>`,
    props: {
      themes: ["light", "dark", "corporate", "luxury"],
      currentTheme: "light",
      showLabel: false,
    },
    showCode: true,
  },
];

export const themeControllerMetadata: ComponentMetadata = {
  name: "ThemeController",
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
