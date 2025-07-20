import { ComponentPageTemplate } from "@suppers/ui-lib";
import { Badge } from "@suppers/ui-lib";
import { AlertTriangle, Check, Info, Star, X } from "lucide-preact";

export default function BadgeDemo() {
  const examples = [
    {
      title: "Basic Badges",
      description: "Simple badges with text content",
      code: `<Badge>Default</Badge>
<Badge color="primary">Primary</Badge>`,
      preview: (
        <div class="flex gap-2">
          <Badge>Default</Badge>
          <Badge>Badge</Badge>
          <Badge>Label</Badge>
          <Badge>New</Badge>
        </div>
      ),
    },
    {
      title: "Badge Colors",
      description: "Different color variants for various use cases",
      code: `<Badge color="primary">Primary</Badge>
<Badge color="success">Success</Badge>
<Badge color="error">Error</Badge>`,
      preview: (
        <div class="flex gap-2">
          <Badge color="primary">Primary</Badge>
          <Badge color="secondary">Secondary</Badge>
          <Badge color="accent">Accent</Badge>
          <Badge color="success">Success</Badge>
          <Badge color="warning">Warning</Badge>
          <Badge color="error">Error</Badge>
        </div>
      ),
    },
    {
      title: "Badge Sizes",
      description: "Different sizes from xs to lg",
      code: `<Badge size="lg" color="primary">Large</Badge>`,
      preview: (
        <div class="flex items-center gap-2">
          <Badge size="xs" color="primary">XS</Badge>
          <Badge size="sm" color="primary">SM</Badge>
          <Badge size="md" color="primary">MD</Badge>
          <Badge size="lg" color="primary">LG</Badge>
        </div>
      ),
    },
    {
      title: "Badge Variants",
      description: "Filled and outline styles",
      code: `<Badge color="primary">Filled</Badge>
<Badge color="primary" variant="outline">Outline</Badge>`,
      preview: (
        <div class="flex gap-2">
          <Badge color="primary">Filled</Badge>
          <Badge color="primary" variant="outline">Outline</Badge>
          <Badge color="secondary">Filled</Badge>
          <Badge color="secondary" variant="outline">Outline</Badge>
        </div>
      ),
    },

    {
      title: "Badge with Numbers",
      description: "Badges displaying numerical content",
      code: `<Badge color="error" content={99} />
<Badge color="primary" content="999+" />`,
      preview: (
        <div class="flex gap-2">
          <Badge color="primary" content={1} />
          <Badge color="secondary" content={99} />
          <Badge color="accent" content={999} />
          <Badge color="error" content="999+" />
          <Badge color="success" content="New" />
        </div>
      ),
    },
    {
      title: "Badge with Icons",
      description: "Badges containing icons and text",
      code: `<Badge color="success">
  <span class="flex items-center gap-1">
    <Check size={16} /> Verified
  </span>
</Badge>`,
      preview: (
        <div class="flex gap-2">
          <Badge color="primary">
            <span class="flex items-center gap-1">
              <Star size={16} /> Featured
            </span>
          </Badge>
          <Badge color="success">
            <span class="flex items-center gap-1">
              <Check size={16} /> Verified
            </span>
          </Badge>
          <Badge color="error">
            <span class="flex items-center gap-1">
              <X size={16} /> Rejected
            </span>
          </Badge>
          <Badge color="warning">
            <span class="flex items-center gap-1">
              <AlertTriangle size={16} /> Pending
            </span>
          </Badge>
        </div>
      ),
    },

    {
      title: "Status Badges",
      description: "Badges for showing various status states",
      code: `<Badge color="success">Online</Badge>
<Badge color="warning">Pending</Badge>
<Badge color="error">Offline</Badge>`,
      preview: (
        <div class="space-y-2">
          <div class="flex items-center gap-4">
            <span>User Status:</span>
            <Badge color="success">Online</Badge>
          </div>
          <div class="flex items-center gap-4">
            <span>Payment:</span>
            <Badge color="warning">Pending</Badge>
          </div>
          <div class="flex items-center gap-4">
            <span>Account:</span>
            <Badge color="error">Suspended</Badge>
          </div>
        </div>
      ),
    },
  ];

  const apiProps = [
    {
      name: "children",
      type: "ComponentChildren",
      description: "Badge content (text, icons, etc.)",
    },
    {
      name: "content",
      type: "string | number",
      description: "Alternative way to set badge content",
    },
    {
      name: "color",
      type: "primary | secondary | accent | neutral | info | success | warning | error",
      description: "Badge color variant",
    },
    {
      name: "size",
      type: "xs | sm | md | lg",
      default: "md",
      description: "Badge size",
    },
    {
      name: "variant",
      type: "outline",
      description: "Badge style variant",
    },
    {
      name: "position",
      type: "top-right | top-left | bottom-right | bottom-left",
      description: "Position when used as indicator",
    },
    {
      name: "class",
      type: "string",
      description: "Additional CSS classes",
    },
  ];

  const usageNotes = [
    "Use descriptive text that clearly indicates the badge purpose",
    "Choose appropriate colors that match the semantic meaning",
    "Content prop can be used for simple text or numbers",
    "Children prop allows for complex content like icons",
    "Outline variant provides a subtle alternative to filled badges",
    "Position prop creates indicator-style badges",
    "Keep badge text concise for better readability",
  ];

  const accessibilityNotes = [
    "Badge text should be descriptive and meaningful",
    "Ensure sufficient color contrast in all themes",
    "Don't rely solely on color to convey information",
    "Use appropriate semantic HTML when badges represent status",
    "Consider screen reader announcements for dynamic badges",
    "Provide context for numerical badges (e.g., '5 unread messages')",
    "Test readability with various text sizes and zoom levels",
  ];

  const relatedComponents = [
    { name: "Button", path: "/components/action/button" },
    { name: "Alert", path: "/components/feedback/alert" },
    { name: "Avatar", path: "/components/display/avatar" },
    { name: "Card", path: "/components/display/card" },
  ];

  return (
    <ComponentPageTemplate
      title="Badge"
      description="Small labels and indicators for status, categories, and notifications"
      category="Display"
      examples={examples}
      apiProps={apiProps}
      usageNotes={usageNotes}
      accessibilityNotes={accessibilityNotes}
      relatedComponents={relatedComponents}
    />
  );
}
