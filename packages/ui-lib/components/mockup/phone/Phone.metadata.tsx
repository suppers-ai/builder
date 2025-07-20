import { ComponentMetadata } from "../../types.ts";
import { PhoneMockup } from "./PhoneMockup.tsx";

export const phoneMetadata: ComponentMetadata = {
  name: "Phone",
  description: "Mobile device mockup",
  category: "Mockup",
  path: "/components/mockup/phone",
  tags: ["phone", "mobile", "mockup", "device", "demo", "showcase"],
  examples: ["basic", "with-camera", "colors", "different-sizes", "responsive"],
  relatedComponents: ["artboard", "browser", "window"],
  preview: (
    <div class="flex gap-4">
      <PhoneMockup variant="iphone" color="black">
        <div class="bg-primary text-primary-content p-4 h-full flex items-center justify-center">
          iPhone App
        </div>
      </PhoneMockup>
      <PhoneMockup variant="android" color="white">
        <div class="bg-secondary text-secondary-content p-4 h-full flex items-center justify-center">
          Android App
        </div>
      </PhoneMockup>
    </div>
  ),
};
