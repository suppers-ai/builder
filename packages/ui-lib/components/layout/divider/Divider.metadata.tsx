import { ComponentMetadata, ComponentCategory, ComponentExample, ComponentProp } from "../../types.ts";

const dividerExamples: ComponentExample[] = [
  {
    title: "Basic Divider",
    description: "Simple horizontal dividers for separating content",
    code: `<div class="space-y-4">
  <div>First section of content</div>
  <Divider />
  <div>Second section of content</div>
  <Divider />
  <div>Third section of content</div>
</div>`,
    showCode: true,
  },
  {
    title: "Divider with Text",
    description: "Dividers with text labels for clearer section separation",
    code: `<div class="space-y-4">
  <div>Login with your account</div>
  <Divider text="OR" />
  <div>Sign up for a new account</div>
  <Divider text="CONTINUE WITH" />
  <div>Social login options</div>
</div>`,
    showCode: true,
  },
  {
    title: "Text Position",
    description: "Different text positioning within the divider",
    code: `<div class="space-y-4">
  <div>Content above</div>
  <Divider text="Start aligned" position="start" />
  <div>More content</div>
  <Divider text="Center aligned" position="center" />
  <div>More content</div>
  <Divider text="End aligned" position="end" />
  <div>Content below</div>
</div>`,
    showCode: true,
  },
  {
    title: "Vertical Dividers",
    description: "Vertical dividers for side-by-side content separation",
    code: `<div class="flex items-center h-32">
  <div class="flex-1 text-center">
    <h3 class="font-bold">Section A</h3>
    <p>Left side content</p>
  </div>
  <Divider vertical />
  <div class="flex-1 text-center">
    <h3 class="font-bold">Section B</h3>
    <p>Right side content</p>
  </div>
  <Divider vertical text="OR" />
  <div class="flex-1 text-center">
    <h3 class="font-bold">Section C</h3>
    <p>Third section</p>
  </div>
</div>`,
    showCode: true,
  },
  {
    title: "Dividers in Forms",
    description: "Real-world usage in forms and cards",
    code: `<div class="card bg-base-100 shadow-md max-w-md">
  <div class="card-body">
    <h2 class="card-title">Account Setup</h2>
    
    <div class="form-control">
      <input type="email" class="input input-bordered" placeholder="Email address" />
    </div>
    <div class="form-control">
      <input type="password" class="input input-bordered" placeholder="Password" />
    </div>
    <button class="btn btn-primary">Create Account</button>
    
    <Divider text="OR CONTINUE WITH" />
    
    <div class="flex gap-2">
      <button class="btn btn-outline flex-1">
        <svg class="w-5 h-5" viewBox="0 0 24 24">
          <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
        </svg>
        Google
      </button>
      <button class="btn btn-outline flex-1">
        <svg class="w-5 h-5" viewBox="0 0 24 24">
          <path fill="currentColor" d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
        Facebook
      </button>
    </div>
    
    <Divider />
    
    <div class="text-center text-sm">
      Already have an account? 
      <a class="link link-primary">Sign in</a>
    </div>
  </div>
</div>`,
    showCode: true,
  },
];

const dividerProps: ComponentProp[] = [
  {
    name: "text",
    type: "string",
    description: "Text to display in the middle of the divider",
  },
  {
    name: "position",
    type: "'start' | 'center' | 'end'",
    description: "Horizontal alignment of the text within the divider",
    default: "center",
  },
  {
    name: "vertical",
    type: "boolean",
    description: "Whether to render as a vertical divider",
    default: "false",
  },
  {
    name: "responsive",
    type: "boolean",
    description: "Enable responsive behavior for the divider",
    default: "false",
  },
  {
    name: "class",
    type: "string",
    description: "Additional CSS classes",
  },
];

export const dividerMetadata: ComponentMetadata = {
  name: "Divider",
  description: "Visual separators for organizing content into distinct sections with optional text labels",
  category: ComponentCategory.LAYOUT,
  path: "/components/layout/divider",
  tags: ["divider", "separator", "line", "break", "section", "hr"],
  relatedComponents: ["card", "hero", "join"],
  interactive: false, // Visual separator, not interactive
  preview: (
    <div class="flex flex-col gap-4 w-full max-w-sm">
      <div class="text-sm">Section 1</div>
      <div class="divider"></div>
      <div class="text-sm">Section 2</div>
      <div class="divider">OR</div>
      <div class="text-sm">Section 3</div>
    </div>
  ),
  examples: dividerExamples,
  props: dividerProps,
  variants: ["basic", "with-text", "vertical", "positioned-text"],
  useCases: ["Form sections", "Content separation", "Navigation groups", "Login/signup flows", "Card sections"],
  usageNotes: [
    "Use horizontal dividers to separate vertical content stacks",
    "Use vertical dividers in flex layouts to separate side-by-side content",
    "Keep divider text short and descriptive (e.g., 'OR', 'AND', section names)",
    "Text positioning helps create visual hierarchy in complex layouts",
    "Dividers improve readability by creating clear content boundaries",
    "Consider using semantic HTML elements like <hr> for screen readers when appropriate",
  ],
};