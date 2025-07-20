import { ComponentMetadata } from "../../types.ts";
import { Card } from "./Card.tsx";

export const cardMetadata: ComponentMetadata = {
  name: "Card",
  description: "Content containers",
  category: "Data Display",
  path: "/components/display/card",
  tags: ["container", "content", "layout", "panel"],
  examples: ["basic", "with-image", "with-actions", "compact"],
  relatedComponents: ["avatar", "badge", "button"],
  preview: (
    <div class="w-72">
      <Card
        title="Sample Card"
        actions={
          <div class="card-actions justify-end">
            <button class="btn btn-primary btn-sm">Action</button>
          </div>
        }
      >
        This is a sample card with some content to demonstrate the component.
      </Card>
    </div>
  ),
};
