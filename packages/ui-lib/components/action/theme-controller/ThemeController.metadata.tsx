import { ComponentCategory, ComponentExample, ComponentMetadata } from "../../types.ts";
import { ThemeController } from "./ThemeController.tsx";

const themeControllerExamples: ComponentExample[] = [
  {
    title: "Theme Modal Interface",
    description: "Interactive theme selection modal with organized theme categories",
    props: { showButton: false },
  },
];

export const themeControllerMetadata: ComponentMetadata = {
  name: "ThemeController",
  description: "Interactive theme selection modal with organized light and dark theme categories",
  category: ComponentCategory.ACTION,
  path: "/components/action/theme-controller",
  tags: ["theme", "dark", "light", "mode", "appearance", "switch", "modal"],
  examples: themeControllerExamples,
  relatedComponents: ["modal", "dropdown", "swap"],
  preview: (
    <div class="flex items-center justify-center">
      <ThemeController
        currentTheme="light"
        showButton
        showLabel
      />
    </div>
  ),
};
