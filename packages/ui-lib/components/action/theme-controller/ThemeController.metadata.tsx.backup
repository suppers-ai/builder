import { ComponentMetadata, ComponentExample, ComponentCategory } from "../../types.ts";
import { ThemeController } from "./ThemeController.tsx";

const themeControllerExamples: ComponentExample[] = [
  {
    title: "Theme Modal Interface",
    description: "Interactive theme selection modal with organized theme categories",
    code: `<ThemeController showButton={false} />`,
    props: { showButton: false },
    showCode: true,
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
        showButton={true}
        showLabel={true}
      />
    </div>
  ),
};
