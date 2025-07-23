import { ComponentMetadata, ComponentCategory, ComponentExample, ComponentProp } from "../../types.ts";

const skeletonExamples: ComponentExample[] = [
  {
    title: "Basic Skeleton",
    description: "Simple rectangular skeleton loaders",
    code: `<div class="space-y-3">
  <Skeleton width="100%" height={20} />
  <Skeleton width="80%" height={16} />
  <Skeleton width="60%" height={16} />
</div>`,
    showCode: true,
  },
  {
    title: "Circle Skeleton",
    description: "Circular skeletons for avatars and profile pictures",
    code: `<div class="flex gap-4 items-center">
  <Skeleton circle width={40} height={40} />
  <Skeleton circle width={60} height={60} />
  <Skeleton circle width={80} height={80} />
</div>`,
    showCode: true,
  },
  {
    title: "Card Skeleton",
    description: "Complex skeleton layout mimicking card content",
    code: `<div class="card bg-base-100 shadow-md w-80">
  <div class="card-body">
    <div class="flex items-center gap-3 mb-4">
      <Skeleton circle width={50} height={50} />
      <div class="flex-1">
        <Skeleton width="70%" height={18} />
        <Skeleton width="50%" height={14} />
      </div>
    </div>
    
    <Skeleton width="100%" height={200} />
    
    <div class="space-y-2 mt-4">
      <Skeleton width="90%" height={16} />
      <Skeleton width="75%" height={16} />
      <Skeleton width="60%" height={16} />
    </div>
    
    <div class="flex gap-2 mt-4">
      <Skeleton width={80} height={32} />
      <Skeleton width={100} height={32} />
    </div>
  </div>
</div>`,
    showCode: true,
  },
  {
    title: "List Skeleton",
    description: "Skeleton for list items and table rows",
    code: `<div class="space-y-4">
  <div class="flex items-center gap-3">
    <Skeleton circle width={32} height={32} />
    <div class="flex-1">
      <Skeleton width="40%" height={16} />
      <Skeleton width="60%" height={12} />
    </div>
    <Skeleton width={60} height={24} />
  </div>
  
  <div class="flex items-center gap-3">
    <Skeleton circle width={32} height={32} />
    <div class="flex-1">
      <Skeleton width="50%" height={16} />
      <Skeleton width="70%" height={12} />
    </div>
    <Skeleton width={80} height={24} />
  </div>
  
  <div class="flex items-center gap-3">
    <Skeleton circle width={32} height={32} />
    <div class="flex-1">
      <Skeleton width="35%" height={16} />
      <Skeleton width="55%" height={12} />
    </div>
    <Skeleton width={70} height={24} />
  </div>
</div>`,
    showCode: true,
  },
  {
    title: "Text Skeleton",
    description: "Skeleton placeholders for text content of various lengths",
    code: `<div class="space-y-4">
  <div>
    <Skeleton width="25%" height={32} />
    <div class="space-y-2 mt-2">
      <Skeleton width="100%" height={16} />
      <Skeleton width="95%" height={16} />
      <Skeleton width="87%" height={16} />
      <Skeleton width="92%" height={16} />
      <Skeleton width="70%" height={16} />
    </div>
  </div>
  
  <div>
    <Skeleton width="30%" height={24} />
    <div class="space-y-2 mt-2">
      <Skeleton width="100%" height={14} />
      <Skeleton width="88%" height={14} />
      <Skeleton width="95%" height={14} />
    </div>
  </div>
</div>`,
    showCode: true,
  },
];

const skeletonProps: ComponentProp[] = [
  {
    name: "width",
    type: "string | number",
    description: "Width of the skeleton (px number or CSS string like '100%')",
  },
  {
    name: "height",
    type: "string | number",
    description: "Height of the skeleton (px number or CSS string)",
  },
  {
    name: "circle",
    type: "boolean",
    description: "Render as a circular skeleton (for avatars)",
    default: "false",
  },
  {
    name: "rounded",
    type: "boolean",
    description: "Apply rounded corners to rectangular skeletons",
    default: "true",
  },
  {
    name: "animation",
    type: "'pulse' | 'wave' | 'none'",
    description: "Animation type for the skeleton",
    default: "pulse",
  },
  {
    name: "class",
    type: "string",
    description: "Additional CSS classes",
  },
];

export const skeletonMetadata: ComponentMetadata = {
  name: "Skeleton",
  description: "Loading placeholders that mimic content structure while data is being fetched",
  category: ComponentCategory.FEEDBACK,
  path: "/components/feedback/skeleton",
  tags: ["skeleton", "placeholder", "loading", "shimmer", "ghost", "content"],
  relatedComponents: ["loading", "avatar", "card"],
  interactive: false, // Loading placeholder, not interactive
  preview: (
    <div class="flex flex-col gap-3">
      <div class="flex items-center gap-3">
        <div class="skeleton w-10 h-10 rounded-full shrink-0"></div>
        <div class="flex-1">
          <div class="skeleton h-4 w-3/5"></div>
          <div class="skeleton h-3 w-2/5 mt-1"></div>
        </div>
      </div>
      <div class="skeleton h-24 w-full"></div>
    </div>
  ),
  examples: skeletonExamples,
  props: skeletonProps,
  variants: ["basic", "circle", "text", "card", "list"],
  useCases: ["Loading states", "Content placeholders", "Image loading", "Text loading", "Complex layouts"],
  usageNotes: [
    "Use skeletons that match the actual content structure and dimensions",
    "Vary skeleton widths to create more realistic loading states",
    "Combine circular and rectangular skeletons for complex layouts",
    "Keep skeleton animations subtle to avoid distraction",
    "Replace skeletons with actual content as soon as data loads",
    "Consider accessibility by providing appropriate aria-labels for screen readers",
  ],
};