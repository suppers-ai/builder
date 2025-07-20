import { ComponentPageTemplate } from "@suppers/ui-lib";
import { Avatar } from "@suppers/ui-lib";

export default function AvatarDemo() {
  const examples = [
    {
      title: "Basic Avatars",
      description: "Simple avatar with image, ring, and initials",
      code: `<Avatar
  src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.jpg"
  alt="Profile"
/>`,
      preview: (
        <div class="flex gap-4">
          <Avatar
            src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.jpg"
            alt="Profile"
          />
          <Avatar
            src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.jpg"
            alt="Profile"
            ring
          />
          <Avatar initials="JD" />
        </div>
      ),
    },
    {
      title: "Avatar Sizes",
      description: "Different avatar sizes from xs to xl",
      code: `<Avatar
  size="lg"
  src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.jpg"
  alt="Large Avatar"
/>`,
      preview: (
        <div class="flex items-center gap-4">
          <Avatar
            size="xs"
            src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.jpg"
            alt="Extra Small"
          />
          <Avatar
            size="sm"
            src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.jpg"
            alt="Small"
          />
          <Avatar
            size="md"
            src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.jpg"
            alt="Medium"
          />
          <Avatar
            size="lg"
            src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.jpg"
            alt="Large"
          />
          <Avatar
            size="xl"
            src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.jpg"
            alt="Extra Large"
          />
        </div>
      ),
    },
    {
      title: "Avatar with Status",
      description: "Online and offline status indicators",
      code: `<Avatar
  src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.jpg"
  alt="Online User"
  online
/>`,
      preview: (
        <div class="flex gap-4">
          <Avatar
            src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.jpg"
            alt="Online User"
            online
          />
          <Avatar
            src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.jpg"
            alt="Offline User"
            offline
          />
          <Avatar
            src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.jpg"
            alt="Online with Ring"
            online
            ring
          />
        </div>
      ),
    },
    {
      title: "Avatar with Initials",
      description: "Placeholder avatars using initials",
      code: `<Avatar
  initials="AB"
  size="lg"
/>`,
      preview: (
        <div class="flex gap-4">
          <Avatar initials="AB" />
          <Avatar initials="CD" size="lg" />
          <Avatar initials="EF" ring />
          <Avatar initials="GH" online />
          <Avatar initials="IJ" offline />
        </div>
      ),
    },
    {
      title: "Avatar Groups",
      description: "Overlapping avatars for team displays",
      code: `<div class="flex -space-x-3">
  <Avatar src="user1.jpg" ring />
  <Avatar src="user2.jpg" ring />
  <Avatar src="user3.jpg" ring />
  <Avatar initials="+3" ring />
</div>`,
      preview: (
        <div class="space-y-4">
          <div class="flex -space-x-3">
            <Avatar
              src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.jpg"
              alt="User 1"
              ring
            />
            <Avatar
              src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.jpg"
              alt="User 2"
              ring
            />
            <Avatar
              src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.jpg"
              alt="User 3"
              ring
            />
            <Avatar
              initials="+3"
              ring
            />
          </div>
          <div class="flex -space-x-2">
            <Avatar
              size="sm"
              src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.jpg"
              alt="User 1"
              ring
            />
            <Avatar
              size="sm"
              src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.jpg"
              alt="User 2"
              ring
            />
            <Avatar
              size="sm"
              initials="+5"
              ring
            />
          </div>
        </div>
      ),
    },
  ];

  const apiProps = [
    {
      name: "src",
      type: "string",
      description: "Image source URL",
    },
    {
      name: "alt",
      type: "string",
      description: "Alt text for the image",
    },
    {
      name: "size",
      type: "xs | sm | md | lg | xl",
      default: "md",
      description: "Avatar size",
    },
    {
      name: "initials",
      type: "string",
      description: "Text to display when no image (e.g., 'AB')",
    },
    {
      name: "ring",
      type: "boolean",
      default: "false",
      description: "Show ring around avatar",
    },
    {
      name: "online",
      type: "boolean",
      default: "false",
      description: "Show online status indicator",
    },
    {
      name: "offline",
      type: "boolean",
      default: "false",
      description: "Show offline status indicator",
    },
    {
      name: "placeholder",
      type: "string",
      description: "Fallback text when no initials or image",
    },
    {
      name: "class",
      type: "string",
      description: "Additional CSS classes",
    },
  ];

  const usageNotes = [
    "Use src prop for user profile images with proper alt text",
    "Initials prop creates text-based avatars when no image is available",
    "Ring prop adds visual emphasis and works well for active users",
    "Status indicators (online/offline) show user presence",
    "Avatar groups use negative margins to overlap avatars",
    "Always provide alt text for accessibility",
    "Consider loading states and error handling for images",
  ];

  const accessibilityNotes = [
    "Always include meaningful alt text for images",
    "Initials should be readable against background colors",
    "Status indicators need accessible labels or descriptions",
    "Ring has sufficient contrast against all themes",
    "Screen readers announce avatar content appropriately",
    "Focus indicators are visible when avatars are interactive",
    "Color alone should not convey status information",
  ];

  const relatedComponents = [
    { name: "Badge", path: "/components/display/badge" },
    { name: "Card", path: "/components/display/card" },
    { name: "Button", path: "/components/action/button" },
    { name: "Dropdown", path: "/components/action/dropdown" },
  ];

  return (
    <ComponentPageTemplate
      title="Avatar"
      description="Profile pictures and user representations with various sizes and states"
      category="Display"
      examples={examples}
      apiProps={apiProps}
      usageNotes={usageNotes}
      accessibilityNotes={accessibilityNotes}
      relatedComponents={relatedComponents}
    />
  );
}
