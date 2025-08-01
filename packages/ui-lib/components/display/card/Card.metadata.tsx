import {
  ComponentCategory,
  ComponentExample,
  ComponentMetadata,
  ComponentProp} from "../../types.ts";
import { Card } from "./Card.tsx";

const cardExamples: ComponentExample[] = [
  {
    title: "Basic Cards",
    description: "Simple cards with different content",
    props: [
      {
        title: "Card Title",
        children: "This is a basic card with some content."
      },
      {
        title: "Product Card", 
        children: "A great product with amazing features."
        }
      ]},
  {
    title: "Cards with Images",
    description: "Cards featuring images",
    props: {
      image: "https://img.daisyui.com/images/stock/photo-1606107557195-0e29a4b5b4aa.webp",
      imageAlt: "Shoes",
      title: "Shoes!",
      children: "If a dog chews shoes whose shoes does he choose?"
    }
  },
  {
    title: "Card with Actions",
    description: "Card with action buttons at the bottom",
    props: {
      title: "Product Card",
      children: "A great product with amazing features.",
      actions: (
        <>
          <button class="btn btn-primary">Buy Now</button>
          <button class="btn btn-outline">Add to Cart</button>
        </>
      )
    }
  },
  {
    title: "Card Variants",
    description: "Different card styles and layouts",
    props: [
      {
        compact: true,
        title: "Compact Card",
        children: "This is a compact card with less padding."
      },
      {
        bordered: true,
        title: "Bordered Card",
        children: "This card has a border."
      },
      {
        glass: true,
        title: "Glass Card",
        children: "This card has a glass morphism effect."
        }
      ]},
  {
    title: "Side Layout Card",
    description: "Horizontal card layout with side image",
    props: {
      side: true,
      image: "https://img.daisyui.com/images/stock/photo-1606107557195-0e29a4b5b4aa.webp",
      title: "Side Card",
      children: "This card uses a horizontal layout with the image on the side."
    }
        }
      ];;

const cardProps: ComponentProp[] = [
  {
    name: "children",
    type: "ComponentChildren",
    description: "Card content",
    required: true},
  {
    name: "title",
    type: "string",
    description: "Card title displayed prominently"},
  {
    name: "image",
    type: "string",
    description: "Image URL to display in card header"},
  {
    name: "imageAlt",
    type: "string",
    description: "Alt text for the image"},
  {
    name: "actions",
    type: "ComponentChildren",
    description: "Action buttons displayed at bottom"},
  {
    name: "compact",
    type: "boolean",
    description: "Use compact padding",
    default: "false"},
  {
    name: "side",
    type: "boolean",
    description: "Horizontal layout with side image",
    default: "false"},
  {
    name: "glass",
    type: "boolean",
    description: "Glass morphism effect",
    default: "false"},
  {
    name: "bordered",
    type: "boolean",
    description: "Show card border",
    default: "false"},
  {
    name: "class",
    type: "string",
    description: "Additional CSS classes"},
];

export const cardMetadata: ComponentMetadata = {
  name: "Card",
  description: "Content containers with flexible layouts for organizing information, enhanced with DaisyUI 5 and Tailwind 4 features",
  category: ComponentCategory.DISPLAY,
  path: "/components/display/card",
  tags: ["container", "content", "layout", "panel", "daisyui-5", "tailwind-4", "enhanced-shadows", "responsive"],
  relatedComponents: ["avatar", "badge", "button", "image", "divider"],
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
        This is a sample card with enhanced DaisyUI 5 styling and improved shadows.
      </Card>
    </div>
  ),
  examples: cardExamples,
  props: cardProps,
  variants: ["default", "compact", "side", "image-overlay", "bordered", "glass"],
  useCases: ["Product showcase", "User profiles", "Content preview", "Information display", "Dashboard widgets", "Media cards"],
  usageNotes: [
    "Cards are perfect for grouping related content together with enhanced visual hierarchy",
    "Use card-body class for proper content padding with DaisyUI 5 improvements",
    "Images should include proper alt text for accessibility and better responsive handling",
    "Actions prop automatically creates card-actions container with improved spacing",
    "Side layout works well for horizontal displays with better responsive behavior",
    "Compact variant reduces padding for dense layouts while maintaining readability",
    "Glass effect enhanced with better backdrop blur and opacity handling",
    "Enhanced shadow system with DaisyUI 5 for better depth perception",
    "Improved border radius system for modern appearance",
    "Better responsive image behavior within cards",
    "Enhanced content spacing with improved padding and margin calculations",
    "Supports Tailwind 4 container queries for responsive design based on card size",
    "Better theme compatibility with enhanced color tokens",
    "Improved accessibility with better focus management and ARIA support",
    "Optimized performance with better CSS generation and reduced bundle impact",
    "Fully backward compatible - all existing card patterns continue to work"
  ]
};;
