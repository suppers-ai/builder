import { Button, Card, ComponentPageTemplate } from "@suppers/ui-lib";

export default function CardDemo() {
  const examples = [
    {
      title: "Basic Card",
      description: "Simple card with title and content",
      code: `<Card title="Card Title">
  <p>This is a basic card with some content.</p>
</Card>`,
      preview: (
        <Card title="Card Title">
          <p>
            This is a basic card with some content. Cards are great for organizing information into
            digestible sections.
          </p>
        </Card>
      ),
    },
    {
      title: "Card with Image",
      description: "Card featuring an image at the top",
      code: `<Card
  image="https://img.daisyui.com/images/stock/photo-1606107557195-0e29a4b5b4aa.jpg"
  imageAlt="Shoes"
  title="Shoes!"
>
  <p>If a dog chews shoes whose shoes does he choose?</p>
</Card>`,
      preview: (
        <Card
          image="https://img.daisyui.com/images/stock/photo-1606107557195-0e29a4b5b4aa.jpg"
          imageAlt="Shoes"
          title="Shoes!"
        >
          <p>If a dog chews shoes whose shoes does he choose?</p>
        </Card>
      ),
    },
    {
      title: "Card with Actions",
      description: "Card with action buttons at the bottom",
      code: `<Card
  title="Product Card"
  actions={
    <div class="flex gap-2">
      <Button color="primary">Buy Now</Button>
      <Button variant="outline">Add to Cart</Button>
    </div>
  }
>
  <p>A great product with amazing features.</p>
</Card>`,
      preview: (
        <Card
          title="Product Card"
          actions={
            <div class="flex gap-2">
              <Button color="primary">Buy Now</Button>
              <Button variant="outline">Add to Cart</Button>
            </div>
          }
        >
          <p>A great product with amazing features that you'll love.</p>
        </Card>
      ),
    },
    {
      title: "Card Variants",
      description: "Different card styles and layouts",
      code: `<Card compact title="Compact Card">
  <p>This is a compact card with less padding.</p>
</Card>`,
      preview: (
        <div class="space-y-4">
          <Card compact title="Compact Card">
            <p>This is a compact card with less padding.</p>
          </Card>
          <Card bordered title="Bordered Card">
            <p>This card has a visible border.</p>
          </Card>
        </div>
      ),
    },
    {
      title: "Side Layout Card",
      description: "Horizontal card layout with side image",
      code: `<Card
  side
  image="https://img.daisyui.com/images/stock/photo-1606107557195-0e29a4b5b4aa.jpg"
  title="Side Card"
>
  <p>This card uses a horizontal layout with the image on the side.</p>
</Card>`,
      preview: (
        <Card
          side
          image="https://img.daisyui.com/images/stock/photo-1606107557195-0e29a4b5b4aa.jpg"
          title="Side Card"
        >
          <p>This card uses a horizontal layout with the image on the side.</p>
        </Card>
      ),
    },
  ];

  const apiProps = [
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
      default: "false",
      description: "Use compact padding",
    },
    {
      name: "side",
      type: "boolean",
      default: "false",
      description: "Horizontal layout with side image",
    },
    {
      name: "glass",
      type: "boolean",
      default: "false",
      description: "Glass morphism effect",
    },
    {
      name: "bordered",
      type: "boolean",
      default: "false",
      description: "Show card border",
    },
    {
      name: "class",
      type: "string",
      description: "Additional CSS classes",
    },
  ];

  const usageNotes = [
    "Cards are perfect for grouping related content together",
    "Use card-body class for proper content padding",
    "Images should include proper alt text for accessibility",
    "Actions prop automatically creates card-actions container",
    "Side layout works well for horizontal displays",
    "Compact variant reduces padding for dense layouts",
    "Glass effect requires backdrop blur support",
  ];

  const accessibilityNotes = [
    "Ensure card titles use proper heading hierarchy",
    "Provide meaningful alt text for all images",
    "Action buttons should have clear, descriptive labels",
    "Cards should have sufficient color contrast",
    "Use semantic HTML structure within card content",
    "Interactive cards should have focus indicators",
    "Screen readers should be able to navigate card content logically",
  ];

  const relatedComponents = [
    { name: "Button", path: "/components/action/button" },
    { name: "Badge", path: "/components/display/badge" },
    { name: "Avatar", path: "/components/display/avatar" },
    { name: "Modal", path: "/components/action/modal" },
  ];

  return (
    <ComponentPageTemplate
      title="Card"
      description="Content containers with flexible layouts for organizing information"
      category="Display"
      examples={examples}
      apiProps={apiProps}
      usageNotes={usageNotes}
      accessibilityNotes={accessibilityNotes}
      relatedComponents={relatedComponents}
    />
  );
}
