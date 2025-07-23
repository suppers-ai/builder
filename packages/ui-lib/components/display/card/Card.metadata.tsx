import {
  ComponentCategory,
  ComponentExample,
  ComponentMetadata,
  ComponentProp,
} from "../../types.ts";
import { Card } from "./Card.tsx";

const cardExamples: ComponentExample[] = [
  {
    title: "Basic Cards",
    description: "Simple cards with different content",
    code: `<Card title="Card Title">
  This is a basic card with some content.
</Card>
<Card title="Product Card">
  A great product with amazing features.
</Card>`,
    showCode: true,
  },
  {
    title: "Cards with Images",
    description: "Cards featuring images",
    code: `<Card
  image="https://img.daisyui.com/images/stock/photo-1606107557195-0e29a4b5b4aa.jpg"
  imageAlt="Shoes"
  title="Shoes!"
>
  If a dog chews shoes whose shoes does he choose?
</Card>`,
    showCode: true,
  },
  {
    title: "Card with Actions",
    description: "Card with action buttons at the bottom",
    code: `<Card title="Product Card">
  A great product with amazing features.
  <div slot="actions" class="card-actions justify-end">
    <button class="btn btn-primary">Buy Now</button>
    <button class="btn btn-outline">Add to Cart</button>
  </div>
</Card>`,
    showCode: true,
  },
  {
    title: "Card Variants",
    description: "Different card styles and layouts",
    code: `<Card compact title="Compact Card">
  This is a compact card with less padding.
</Card>
<Card bordered title="Bordered Card">
  This card has a border.
</Card>
<Card glass title="Glass Card">
  This card has a glass morphism effect.
</Card>`,
    showCode: true,
  },
  {
    title: "Side Layout Card",
    description: "Horizontal card layout with side image",
    code: `<Card
  side
  image="https://img.daisyui.com/images/stock/photo-1606107557195-0e29a4b5b4aa.jpg"
  title="Side Card"
>
  This card uses a horizontal layout with the image on the side.
</Card>`,
    showCode: true,
  },
];

const cardProps: ComponentProp[] = [
  {
    name: "children",
    type: "ComponentChildren",
    description: "Card content",
    required: true,
  },
  {
    name: "title",
    type: "string",
    description: "Card title displayed prominently",
  },
  {
    name: "image",
    type: "string",
    description: "Image URL to display in card header",
  },
  {
    name: "imageAlt",
    type: "string",
    description: "Alt text for the image",
  },
  {
    name: "actions",
    type: "ComponentChildren",
    description: "Action buttons displayed at bottom",
  },
  {
    name: "compact",
    type: "boolean",
    description: "Use compact padding",
    default: "false",
  },
  {
    name: "side",
    type: "boolean",
    description: "Horizontal layout with side image",
    default: "false",
  },
  {
    name: "glass",
    type: "boolean",
    description: "Glass morphism effect",
    default: "false",
  },
  {
    name: "bordered",
    type: "boolean",
    description: "Show card border",
    default: "false",
  },
  {
    name: "class",
    type: "string",
    description: "Additional CSS classes",
  },
];

export const cardMetadata: ComponentMetadata = {
  name: "Card",
  description: "Content containers with flexible layouts for organizing information",
  category: ComponentCategory.DISPLAY,
  path: "/components/display/card",
  tags: ["container", "content", "layout", "panel"],
  relatedComponents: ["avatar", "badge", "button"],
  interactive: false, // Static component, no island mode needed
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
  examples: cardExamples,
  props: cardProps,
  variants: ["default", "compact", "side", "image-overlay"],
  useCases: ["Product showcase", "User profiles", "Content preview", "Information display"],
  usageNotes: [
    "Cards are perfect for grouping related content together",
    "Use card-body class for proper content padding",
    "Images should include proper alt text for accessibility",
    "Actions prop automatically creates card-actions container",
    "Side layout works well for horizontal displays",
    "Compact variant reduces padding for dense layouts",
    "Glass effect requires backdrop blur support",
  ],
};
