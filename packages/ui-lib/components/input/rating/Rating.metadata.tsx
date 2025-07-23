import {
  ComponentCategory,
  ComponentExample,
  ComponentMetadata,
  ComponentProp,
} from "../../types.ts";

const ratingExamples: ComponentExample[] = [
  {
    title: "Basic Rating",
    description: "Simple star ratings with different values",
    code: `<div class="space-y-2">
  <Rating value={1} />
  <Rating value={2} />
  <Rating value={3} />
  <Rating value={4} />
  <Rating value={5} />
</div>`,
    showCode: true,
  },
  {
    title: "Rating Sizes",
    description: "Different sizes for various contexts",
    code: `<div class="space-y-3">
  <Rating value={4} size="xs" />
  <Rating value={4} size="sm" />
  <Rating value={4} size="md" />
  <Rating value={4} size="lg" />
</div>`,
    showCode: true,
  },
  {
    title: "Rating Shapes",
    description: "Different mask shapes for ratings",
    code: `<div class="space-y-3">
  <Rating value={4} mask="star" />
  <Rating value={3} mask="star-2" />
  <Rating value={5} mask="heart" />
</div>`,
    showCode: true,
  },
  {
    title: "Half Star Rating",
    description: "Ratings with half-star precision",
    code: `<div class="space-y-2">
  <Rating value={1.5} half />
  <Rating value={2.5} half />
  <Rating value={3.5} half />
  <Rating value={4.5} half />
</div>`,
    showCode: true,
  },
  {
    title: "Product Reviews",
    description: "Real-world usage in product review contexts",
    code: `<div class="space-y-6">
  <div class="card bg-base-100 shadow-md">
    <div class="card-body">
      <div class="flex items-start gap-4">
        <div class="avatar">
          <div class="w-12 h-12 rounded-full">
            <img src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.jpg" />
          </div>
        </div>
        <div class="flex-1">
          <div class="flex items-center gap-2 mb-2">
            <h3 class="font-semibold">John Doe</h3>
            <Rating value={5} size="sm" readonly />
            <span class="text-sm text-base-content/70">5 days ago</span>
          </div>
          <p class="text-sm">Excellent product! Highly recommend to anyone looking for quality.</p>
        </div>
      </div>
    </div>
  </div>

  <div class="card bg-base-100 shadow-md">
    <div class="card-body">
      <div class="flex items-start gap-4">
        <div class="avatar">
          <div class="w-12 h-12 rounded-full">
            <img src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.jpg" />
          </div>
        </div>
        <div class="flex-1">
          <div class="flex items-center gap-2 mb-2">
            <h3 class="font-semibold">Sarah Wilson</h3>
            <Rating value={3.5} half size="sm" readonly />
            <span class="text-sm text-base-content/70">2 weeks ago</span>
          </div>
          <p class="text-sm">Good overall, but could be improved in some areas.</p>
        </div>
      </div>
    </div>
  </div>
</div>`,
    showCode: true,
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
