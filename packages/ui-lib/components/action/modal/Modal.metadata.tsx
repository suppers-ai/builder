import { ComponentMetadata } from "../../types.ts";

export const modalMetadata: ComponentMetadata = {
  name: "Modal",
  description: "Dialog boxes and overlays for displaying content and capturing user input",
  category: "Actions",
  path: "/components/action/modal",
  tags: ["dialog", "overlay", "popup"],
  examples: ["basic", "with-form", "confirmation", "full-screen"],
  relatedComponents: ["button", "alert"],
  preview: (
    <div class="mockup-window border bg-base-300 scale-75">
      <div class="flex justify-center px-4 py-16 bg-base-200">
        <div class="text-center">
          <h3 class="font-bold text-lg">Modal Dialog</h3>
          <p class="py-4">This is a modal example</p>
        </div>
      </div>
    </div>
  ),
};
