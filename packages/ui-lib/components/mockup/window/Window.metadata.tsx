import { ComponentMetadata, ComponentExample, ComponentCategory } from "../../types.ts";
import { WindowMockup } from "./WindowMockup.tsx";

const windowExamples: ComponentExample[] = [
  {
    title: "Basic Window",
    description: "Simple OS window mockup",
    props: {
      title: "Application Window",
      children: "Window content"
    }
  },  {
    title: "Window with Toolbar",
    description: "Window with toolbar and menu items",
    props: {
      title: "Application Window",
      children: "Window content"
    }
  },  {
    title: "Colored Window",
    description: "Window with custom title bar color",
    props: {
      title: "Application Window",
      children: "Window content",
      color: "primary"
    }
  },  {
    title: "Responsive Window",
    description: "Window that adapts to different screen sizes",
    props: {
      title: "Application Window",
      children: "Window content"
    }
  },  {
    title: "Minimized Window",
    description: "Window in minimized state with reduced content",
    props: {
      title: "Application Window",
      children: "Window content"
    }
  },
];

export const windowMetadata: ComponentMetadata = {
  name: "Window",
  description: "OS window mockup",
  category: ComponentCategory.MOCKUP,
  path: "/components/mockup/window",
  tags: ["window", "mockup", "os", "frame", "demo", "showcase"],
  examples: windowExamples,
  relatedComponents: ["browser", "artboard", "phone"],
  preview: (
    <div class="w-80">
      <WindowMockup title="My Application" showControls>
        <div class="bg-base-100 p-6 h-32 flex items-center justify-center border-t">
          Application content area
        </div>
      </WindowMockup>
    </div>
  )};
