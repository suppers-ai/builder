---
title: "Card Title"
description: "Content containers with flexible layouts for organizing information"
category: "Display"
apiProps:
  -
    name: "children"
    type: "ComponentChildren"
    description: "Card content"
    required: true
  -
    name: "title"
    type: "string"
    description: "Card title displayed prominently"
  -
    name: "image"
    type: "string"
    description: "Image URL to display in card header"
  -
    name: "imageAlt"
    type: "string"
    description: "Alt text for the image"
  -
    name: "actions"
    type: "ComponentChildren"
    description: "Action buttons displayed at bottom"
  -
    name: "compact"
    type: "boolean"
    description: "Use compact padding"
    default: "false"
  -
    name: "side"
    type: "boolean"
    description: "Horizontal layout with side image"
    default: "false"
  -
    name: "glass"
    type: "boolean"
    description: "Glass morphism effect"
    default: "false"
  -
    name: "bordered"
    type: "boolean"
    description: "Show card border"
    default: "false"
  -
    name: "class"
    type: "string"
    description: "Additional CSS classes"
demoInfo:
  variants: ["default", "compact", "side", "image-overlay"]
  interactions: ["hover effects", "clickable", "expandable"]
  useCases: ["Product showcase", "User profiles", "Content preview", "Information display"]
previewData:
  - title: "Basic Cards"
    description: "Simple cards with different content"
    components:
      - props: { title: "Card Title" }
        children: "This is a basic card with some content."
      - props: { title: "Product Card" }
        children: "A great product with amazing features."
  - title: "Cards with Images"
    description: "Cards featuring images"
    components:
      - props:
          image: "https://img.daisyui.com/images/stock/photo-1606107557195-0e29a4b5b4aa.jpg"
          imageAlt: "Shoes"
          title: "Shoes!"
        children: "If a dog chews shoes whose shoes does he choose?"
  - title: "Card Variants"
    description: "Different card styles"
    components:
      - props: { title: "Compact Card", compact: true }
        children: "This is a compact card with less padding."
      - props: { title: "Side Card", side: true, image: "https://img.daisyui.com/images/stock/photo-1606107557195-0e29a4b5b4aa.jpg" }
        children: "This card uses a horizontal layout."
usageNotes:
  - "Cards are perfect for grouping related content together"
  - "Use card-body class for proper content padding"
  - "Images should include proper alt text for accessibility"
  - "Actions prop automatically creates card-actions container"
  - "Side layout works well for horizontal displays"
  - "Compact variant reduces padding for dense layouts"
  - "Glass effect requires backdrop blur support"
accessibilityNotes:
  - "Ensure card titles use proper heading hierarchy"
  - "Provide meaningful alt text for all images"
  - "Action buttons should have clear, descriptive labels"
  - "Cards should have sufficient color contrast"
  - "Use semantic HTML structure within card content"
  - "Interactive cards should have focus indicators"
  - "Screen readers should be able to navigate card content logically"
relatedComponents:
  -
    name: "Button"
    path: "/components/action/button"
  -
    name: "Badge"
    path: "/components/display/badge"
  -
    name: "Avatar"
    path: "/components/display/avatar"
  -
    name: "Modal"
    path: "/components/action/modal"
---

## Basic Card

Simple card with title and content

```tsx
<Card title="Card Title">
  <p>This is a basic card with some content.</p>
</Card>;
```

## Card with Image

Card featuring an image at the top

```tsx
<Card
  image="https://img.daisyui.com/images/stock/photo-1606107557195-0e29a4b5b4aa.jpg"
  imageAlt="Shoes"
  title="Shoes!"
>
  <p>If a dog chews shoes whose shoes does he choose?</p>
</Card>;
```

## Card with Actions

Card with action buttons at the bottom

```tsx
<Card
  title="Product Card"
  actions={
    <div class="flex gap-2">
      <Button color="primary">Buy Now</Button>
      <Button variant="outline">Add to Cart</Button>
    </div>
  }
>
  <p>A great product with amazing features.</p>
</Card>;
```

## Card Variants

Different card styles and layouts

```tsx
<Card compact title="Compact Card">
  <p>This is a compact card with less padding.</p>
</Card>;
```

## Side Layout Card

Horizontal card layout with side image

```tsx
<Card
  side
  image="https://img.daisyui.com/images/stock/photo-1606107557195-0e29a4b5b4aa.jpg"
  title="Side Card"
>
  <p>This card uses a horizontal layout with the image on the side.</p>
</Card>;
```
