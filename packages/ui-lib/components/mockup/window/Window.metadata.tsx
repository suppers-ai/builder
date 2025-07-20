import { ComponentMetadata } from "../../types.ts";
import { WindowMockup } from "./WindowMockup.tsx";

export const windowMetadata: ComponentMetadata = {
  name: "Window",
  description: "OS window mockup",
  category: "Mockup",
  path: "/components/mockup/window",
  tags: ["window", "mockup", "os", "frame", "demo", "showcase"],
  examples: ["basic", "with-toolbar", "colored", "responsive", "minimized"],
  relatedComponents: ["browser", "artboard", "phone"],
  preview: (
    <div class="w-80">
      <WindowMockup title="My Application" showControls>
        <div class="bg-base-100 p-6 h-32 flex items-center justify-center border-t">
          Application content area
        </div>
      </WindowMockup>
    </div>
  ),
};
