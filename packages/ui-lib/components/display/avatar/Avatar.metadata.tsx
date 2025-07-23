import { ComponentMetadata, ComponentCategory, ComponentExample, ComponentProp } from "../../types.ts";

const avatarExamples: ComponentExample[] = [
  {
    title: "Basic Avatar",
    description: "Simple avatars with images and placeholders",
    code: `<Avatar src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.jpg" />
<Avatar initials="JD" />
<Avatar placeholder="?" />`,
    showCode: true,
  },
  {
    title: "Avatar Sizes",
    description: "Different sizes for various contexts",
    code: `<Avatar size="xs" src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.jpg" />
<Avatar size="sm" src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.jpg" />
<Avatar size="md" src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.jpg" />
<Avatar size="lg" src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.jpg" />
<Avatar size="xl" src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.jpg" />`,
    showCode: true,
  },
  {
    title: "Avatar with Status Indicators",
    description: "Online/offline status indicators",
    code: `<Avatar online src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.jpg" />
<Avatar offline src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.jpg" />
<Avatar online initials="JD" />
<Avatar offline initials="SM" />`,
    showCode: true,
  },
  {
    title: "Avatar with Ring",
    description: "Avatars with decorative rings",
    code: `<Avatar ring src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.jpg" />
<Avatar ring initials="AB" />
<Avatar ring online src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.jpg" />`,
    showCode: true,
  },
  {
    title: "Avatar Group",
    description: "Multiple avatars grouped together",
    code: `<div class="avatar-group -space-x-6 rtl:space-x-reverse">
  <Avatar src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.jpg" />
  <Avatar src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.jpg" />
  <Avatar src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.jpg" />
  <Avatar initials="+3" />
</div>`,
    showCode: true,
  },
];

const avatarProps: ComponentProp[] = [
  {
    name: "src",
    type: "string",
    description: "Image source URL for the avatar",
  },
  {
    name: "alt",
    type: "string",
    description: "Alt text for the avatar image",
    default: "''",
  },
  {
    name: "initials",
    type: "string",
    description: "Text initials to display when no image is provided",
  },
  {
    name: "placeholder",
    type: "string",
    description: "Placeholder text when no image or initials are provided",
  },
  {
    name: "size",
    type: "'xs' | 'sm' | 'md' | 'lg' | 'xl'",
    description: "Size of the avatar",
    default: "md",
  },
  {
    name: "ring",
    type: "boolean",
    description: "Whether to show a decorative ring around the avatar",
    default: "false",
  },
  {
    name: "online",
    type: "boolean",
    description: "Show online status indicator",
    default: "false",
  },
  {
    name: "offline",
    type: "boolean",
    description: "Show offline status indicator",
    default: "false",
  },
  {
    name: "class",
    type: "string",
    description: "Additional CSS classes",
  },
];

export const avatarMetadata: ComponentMetadata = {
  name: "Avatar",
  description: "Profile pictures and user representations with various sizes and status indicators",
  category: ComponentCategory.DISPLAY,
  path: "/components/display/avatar",
  tags: ["profile", "user", "image", "avatar", "picture"],
  relatedComponents: ["badge", "indicator", "button"],
  interactive: false, // Display component, not interactive
  preview: (
    <div class="flex gap-2">
      <div class="avatar">
        <div class="w-12 h-12 rounded-full">
          <img src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.jpg" />
        </div>
      </div>
      <div class="avatar placeholder">
        <div class="bg-neutral text-neutral-content rounded-full w-12 h-12">
          <span class="text-xl">AB</span>
        </div>
      </div>
      <div class="avatar online">
        <div class="w-12 h-12 rounded-full">
          <img src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.jpg" />
        </div>
      </div>
    </div>
  ),
  examples: avatarExamples,
  props: avatarProps,
  variants: ["basic", "sizes", "status", "ring", "groups"],
  useCases: ["User profiles", "Comments", "Team members", "Contact lists", "Navigation"],
  usageNotes: [
    "Use appropriate sizes based on context (xs for lists, lg for profiles)",
    "Provide meaningful alt text for accessibility when using images",
    "Use initials as fallbacks when images fail to load",
    "Status indicators help show user availability in chat applications",
    "Avatar groups work well for showing team members or participants",
    "Ring variants add emphasis for important users or selected states",
  ],
};