import { ComponentMetadata } from "../../types.ts";
import { ThemeController } from "./ThemeController.tsx";

export const themeControllerMetadata: ComponentMetadata = {
  name: "Theme Controller",
  description: "Theme switching",
  category: "Actions",
  path: "/components/action/theme-controller",
  tags: ["theme", "dark", "light", "mode", "appearance", "switch"],
  examples: ["dropdown", "toggle", "radio", "cards"],
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
