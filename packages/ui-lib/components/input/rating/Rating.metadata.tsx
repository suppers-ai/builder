import {
  ComponentCategory,
  ComponentExample,
  ComponentMetadata,
  ComponentProp,
} from "../../types.ts";
import { Rating } from "./Rating.tsx";

const ratingExamples: ComponentExample[] = [
  {
    title: "Basic Rating",
    description: "Simple star ratings with different values",
    props: {
      value: 3,
      max: 5,
    },
  },
  {
    title: "Rating Sizes",
    description: "Different sizes for various contexts",
    props: {
      value: 3,
      max: 5,
      size: "lg",
    },
  },
  {
    title: "Rating Shapes",
    description: "Different mask shapes for ratings",
    props: {
      value: 3,
      max: 5,
    },
  },
  {
    title: "Half Star Rating",
    description: "Ratings with half-star precision",
    props: {
      value: 3,
      max: 5,
    },
  },
  {
    title: "Product Reviews",
    description: "Real-world usage in product review contexts",
    props: {
      value: 3,
      max: 5,
    },
  },
];

const ratingProps: ComponentProp[] = [
  {
    name: "value",
    type: "number",
    description: "Current rating value",
    default: "0",
  },
  {
    name: "max",
    type: "number",
    description: "Maximum rating value (number of stars)",
    default: "5",
  },
  {
    name: "size",
    type: "'xs' | 'sm' | 'md' | 'lg'",
    description: "Size of the rating stars",
    default: "md",
  },
  {
    name: "mask",
    type: "'star' | 'star-2' | 'heart'",
    description: "Shape of the rating elements",
    default: "star",
  },
  {
    name: "half",
    type: "boolean",
    description: "Enable half-star ratings",
    default: "false",
  },
  {
    name: "readonly",
    type: "boolean",
    description: "Whether the rating is read-only (display only)",
    default: "false",
  },
  {
    name: "hoverValue",
    type: "number",
    description: "Value to display on hover (controlled mode)",
  },
  {
    name: "onChange",
    type: "(value: number) => void",
    description: "Callback when rating value changes",
  },
  {
    name: "onHover",
    type: "(value: number) => void",
    description: "Callback when hovering over a rating value",
  },
  {
    name: "onMouseLeave",
    type: "() => void",
    description: "Callback when mouse leaves the rating component",
  },
  {
    name: "class",
    type: "string",
    description: "Additional CSS classes",
  },
];

export const ratingMetadata: ComponentMetadata = {
  name: "Rating",
  description:
    "Interactive star rating component for collecting user feedback and displaying ratings",
  category: ComponentCategory.INPUT,
  path: "/components/input/rating",
  tags: ["rating", "stars", "review", "score", "feedback", "evaluation"],
  relatedComponents: ["form-control", "mask", "stat"],
  interactive: true, // Users can click to set ratings
  preview: (
    <div class="flex flex-col gap-3">
      <div class="rating">
        <input type="radio" name="rating-1" class="mask mask-star bg-orange-400" />
        <input type="radio" name="rating-1" class="mask mask-star bg-orange-400" />
        <input type="radio" name="rating-1" class="mask mask-star bg-orange-400" />
        <input type="radio" name="rating-1" class="mask mask-star bg-orange-400" checked />
        <input type="radio" name="rating-1" class="mask mask-star bg-orange-400" />
      </div>
      <div class="rating rating-lg">
        <input type="radio" name="rating-2" class="mask mask-heart bg-red-400" />
        <input type="radio" name="rating-2" class="mask mask-heart bg-red-400" />
        <input type="radio" name="rating-2" class="mask mask-heart bg-red-400" checked />
        <input type="radio" name="rating-2" class="mask mask-heart bg-red-400" />
        <input type="radio" name="rating-2" class="mask mask-heart bg-red-400" />
      </div>
    </div>
  ),
  examples: ratingExamples,
  props: ratingProps,
  variants: ["basic", "sizes", "shapes", "half-stars", "readonly"],
  useCases: [
    "Product reviews",
    "User feedback",
    "Content ratings",
    "Quality assessments",
    "Survey responses",
  ],
  usageNotes: [
    "Use readonly ratings for displaying existing ratings or reviews",
    "Half-star ratings provide more precise feedback collection",
    "Different mask shapes (star, heart) can match your brand aesthetic",
    "Consider the context when choosing rating scales (1-5 vs 1-10)",
    "Provide clear labels or descriptions for what the rating represents",
    "Use appropriate sizes based on the UI context and importance",
  ],
};
