import { type PageProps } from "fresh";
import { Button, Button as ButtonComponent, ComponentPageTemplate } from "@suppers/ui-lib";

export default function ButtonDemo(props: PageProps) {
  // Set the title in state for the app component
  if (props.state) {
    (props.state as any).title = "Button - DaisyUI Component Library";
  }
  const examples = [
    {
      title: "Basic Buttons",
      description: "Standard button colors and variants",
      code: `<Button>Default</Button>
<Button color="primary">Primary</Button>
<Button color="secondary">Secondary</Button>
<Button color="accent">Accent</Button>`,
      preview: (
        <div class="flex flex-wrap gap-4">
          <ButtonComponent>Default</ButtonComponent>
          <ButtonComponent color="primary">Primary</ButtonComponent>
          <ButtonComponent color="secondary">Secondary</ButtonComponent>
          <ButtonComponent color="accent">Accent</ButtonComponent>
        </div>
      ),
    },
    {
      title: "Button Variants",
      description: "Different visual styles for buttons",
      code: `<Button variant="outline" color="primary">Outline</Button>
<Button variant="ghost" color="primary">Ghost</Button>
<Button variant="link" color="primary">Link</Button>`,
      preview: (
        <div class="flex flex-wrap gap-4">
          <ButtonComponent variant="outline" color="primary">Outline</ButtonComponent>
          <ButtonComponent variant="ghost" color="primary">Ghost</ButtonComponent>
          <ButtonComponent variant="link" color="primary">Link</ButtonComponent>
        </div>
      ),
    },
    {
      title: "Button Sizes",
      description: "Various button sizes for different use cases",
      code: `<Button size="xs" color="primary">Extra Small</Button>
<Button size="sm" color="primary">Small</Button>
<Button color="primary">Medium</Button>
<Button size="lg" color="primary">Large</Button>`,
      preview: (
        <div class="flex flex-wrap items-center gap-4">
          <ButtonComponent size="xs" color="primary">Extra Small</ButtonComponent>
          <ButtonComponent size="sm" color="primary">Small</ButtonComponent>
          <ButtonComponent color="primary">Medium</ButtonComponent>
          <ButtonComponent size="lg" color="primary">Large</ButtonComponent>
        </div>
      ),
    },
    {
      title: "Button States",
      description: "Different button states and interactions",
      code: `<Button color="primary">Normal</Button>
<Button color="primary" active>Active</Button>
<Button color="primary" disabled>Disabled</Button>
<Button color="primary" loading>Loading</Button>`,
      preview: (
        <div class="flex flex-wrap gap-4">
          <ButtonComponent color="primary">Normal</ButtonComponent>
          <ButtonComponent color="primary" active>Active</ButtonComponent>
          <ButtonComponent color="primary" disabled>Disabled</ButtonComponent>
          <ButtonComponent color="primary" loading>Loading</ButtonComponent>
        </div>
      ),
    },
    {
      title: "Interactive Buttons (Islands)",
      description: "Client-side interactive buttons with event handlers",
      code: `<Button 
  color="primary" 
  onClick={() => alert('Clicked!')}
>
  Click Me
</Button>`,
      preview: (
        <div class="flex flex-wrap gap-4">
          <Button
            color="primary"
            onClick={() => alert("Button clicked!")}
          >
            Click Me
          </Button>
          <Button
            color="secondary"
            variant="outline"
            onClick={() => console.log("Logged to console")}
          >
            Log to Console
          </Button>
        </div>
      ),
    },
  ];

  const apiProps = [
    {
      name: "children",
      type: "ComponentChildren",
      description: "Button content",
      required: true,
    },
    {
      name: "color",
      type:
        "'primary' | 'secondary' | 'accent' | 'neutral' | 'info' | 'success' | 'warning' | 'error'",
      default: "undefined",
      description: "Button color theme",
    },
    {
      name: "size",
      type: "'xs' | 'sm' | 'md' | 'lg'",
      default: "'md'",
      description: "Button size",
    },
    {
      name: "variant",
      type: "'solid' | 'outline' | 'ghost' | 'link'",
      default: "'solid'",
      description: "Button visual style",
    },
    {
      name: "disabled",
      type: "boolean",
      default: "false",
      description: "Disable button interactions",
    },
    {
      name: "loading",
      type: "boolean",
      default: "false",
      description: "Show loading spinner",
    },
    {
      name: "active",
      type: "boolean",
      default: "false",
      description: "Apply active state styling",
    },
    {
      name: "onClick",
      type: "(event: Event) => void",
      description: "Click event handler (Islands only)",
    },
  ];

  const usageNotes = [
    "Use Button component for server-side rendered buttons without interactivity",
    "Use Button island for client-side interactive buttons with event handlers",
    "Primary buttons should be used sparingly for the main action on a page",
    "Outline buttons work well for secondary actions",
    "Ghost buttons are ideal for tertiary actions or navigation",
    "Loading state automatically disables the button to prevent multiple submissions",
  ];

  return (
    <ComponentPageTemplate
      title="Button"
      description="Interactive buttons with multiple variants, sizes, and states for user actions"
      category="Actions"
      examples={examples}
      apiProps={apiProps}
      usageNotes={usageNotes}
    />
  );
}
