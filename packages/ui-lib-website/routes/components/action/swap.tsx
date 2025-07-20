import { ComponentPageTemplate, Swap } from "@suppers/ui-lib";
import { Eye, EyeOff, Heart, Moon, Pause, Play, Star, Sun, Volume2, VolumeX } from "lucide-preact";

export default function SwapDemo() {
  const examples = [
    {
      title: "Basic Swap",
      description: "Simple swap between two states",
      code: `<Swap
  on={<Eye size={24} />}
  off={<EyeOff size={24} />}
/>`,
      preview: (
        <div class="flex gap-4">
          <Swap
            on={<Eye size={24} />}
            off={<EyeOff size={24} />}
          />
          <Swap
            on={<Moon size={24} />}
            off={<Sun size={24} />}
          />
          <Swap
            on={<Play size={24} />}
            off={<Pause size={24} />}
          />
        </div>
      ),
    },
    {
      title: "Rotate Animation",
      description: "Swap with rotating animation effect",
      code: `<Swap
  rotate
  on={<Sun size={24} />}
  off={<Moon size={24} />}
/>`,
      preview: (
        <div class="flex gap-4">
          <Swap
            rotate
            on={<Sun size={24} />}
            off={<Moon size={24} />}
          />
          <Swap
            rotate
            on={<Volume2 size={24} />}
            off={<VolumeX size={24} />}
          />
        </div>
      ),
    },
    {
      title: "Flip Animation",
      description: "Swap with flipping animation effect",
      code: `<Swap
  flip
  on={<Heart size={24} className="text-red-500" />}
  off={<Heart size={24} className="text-gray-400" />}
/>`,
      preview: (
        <div class="flex gap-4">
          <Swap
            flip
            on={<Heart size={24} class="text-red-500" />}
            off={<Heart size={24} class="text-gray-400" />}
          />
          <Swap
            flip
            on={<Star size={24} class="text-yellow-500" />}
            off={<Star size={24} class="text-gray-400" />}
          />
        </div>
      ),
    },
    {
      title: "Text Swap",
      description: "Swap between text content",
      code: `<Swap
  on={<span class="text-green-500 font-bold">ON</span>}
  off={<span class="text-red-500 font-bold">OFF</span>}
/>`,
      preview: (
        <div class="flex gap-4">
          <Swap
            on={<span class="text-green-500 font-bold">ON</span>}
            off={<span class="text-red-500 font-bold">OFF</span>}
          />
          <Swap
            rotate
            on={<span class="text-blue-500 font-semibold">Day</span>}
            off={<span class="text-purple-500 font-semibold">Night</span>}
          />
        </div>
      ),
    },
    {
      title: "Button Swap",
      description: "Swap between different button states",
      code: `<Swap
  on={<button class="btn btn-primary">Save</button>}
  off={<button class="btn btn-outline">Edit</button>}
/>`,
      preview: (
        <div class="flex gap-4">
          <Swap
            on={<button class="btn btn-primary">Save</button>}
            off={<button class="btn btn-outline">Edit</button>}
          />
          <Swap
            flip
            on={<button class="btn btn-success">✓ Done</button>}
            off={<button class="btn btn-warning">⚠ Pending</button>}
          />
        </div>
      ),
    },
  ];

  const apiProps = [
    {
      name: "on",
      type: "ComponentChildren",
      description: "Content to show in active state",
      required: true,
    },
    {
      name: "off",
      type: "ComponentChildren",
      description: "Content to show in inactive state",
      required: true,
    },
    {
      name: "active",
      type: "boolean",
      default: "false",
      description: "Controls swap state",
    },
    {
      name: "rotate",
      type: "boolean",
      default: "false",
      description: "Enable rotate animation",
    },
    {
      name: "flip",
      type: "boolean",
      default: "false",
      description: "Enable flip animation",
    },
    {
      name: "class",
      type: "string",
      description: "Additional CSS classes",
    },
    {
      name: "id",
      type: "string",
      description: "HTML id attribute",
    },
  ];

  const usageNotes = [
    "Use Swap for server-side rendered swaps without interactivity",
    "For interactive swaps with click handlers, create an island component",
    "Swap uses a hidden checkbox input for state management",
    "Choose between rotate and flip animations based on your design needs",
    "Can swap between any type of content: icons, text, buttons, or custom elements",
    "Animation classes (swap-rotate, swap-flip) provide smooth transitions",
    "Use consistent sizing for on/off content to prevent layout shifts",
  ];

  const accessibilityNotes = [
    "Swap uses a checkbox input which is keyboard accessible",
    "Screen readers announce state changes appropriately",
    "Focus indicators are provided by default styling",
    "Consider adding aria-label for icon-only swaps",
    "Ensure sufficient color contrast for both states",
    "Use meaningful labels when swapping between text states",
    "Test with keyboard navigation (Tab, Space, Enter)",
  ];

  const relatedComponents = [
    { name: "Button", path: "/components/action/button" },
    { name: "Toggle", path: "/components/input/toggle" },
    { name: "Checkbox", path: "/components/input/checkbox" },
    { name: "Theme Controller", path: "/components/action/theme-controller" },
  ];

  return (
    <ComponentPageTemplate
      title="Swap"
      description="Toggle between two states with smooth animations and transitions"
      category="Actions"
      examples={examples}
      apiProps={apiProps}
      usageNotes={usageNotes}
      accessibilityNotes={accessibilityNotes}
      relatedComponents={relatedComponents}
    />
  );
}
