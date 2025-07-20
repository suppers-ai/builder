import { ComponentMetadata } from "../../types.ts";
import { Button } from "./Button.tsx";

export const buttonMetadata: ComponentMetadata = {
  name: "Button",
  description: "Interactive buttons with multiple variants, sizes, and states for user actions",
  category: "Actions",
  path: "/components/action/button",
  tags: ["interactive", "action", "click"],
  examples: ["primary", "secondary", "ghost", "outline"],
  relatedComponents: ["dropdown", "modal"],
  preview: (
    <div class="flex gap-2">
      <Button color="primary">Primary</Button>
      <Button variant="outline">Outline</Button>
    </div>
  ),
};
