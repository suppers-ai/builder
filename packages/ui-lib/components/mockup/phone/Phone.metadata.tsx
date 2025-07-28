import { ComponentMetadata, ComponentExample, ComponentCategory } from "../../types.ts";
import { PhoneMockup } from "./PhoneMockup.tsx";

const phoneExamples: ComponentExample[] = [
  {
    title: "Basic Phone Mockup",
    description: "Simple mobile device frame mockup",
    props: {
      children: "Mobile app content"
    }
  }, {
    title: "iPhone with Camera",
    description: "iPhone mockup with camera cutout detail",
    props: {
      children: "Mobile app content"
    }
  }, {
    title: "Different Colors",
    description: "Phone mockups with different frame colors",
    props: {
      children: "Mobile app content",
      color: "primary"
    }
  }, {
    title: "Different Sizes",
    description: "Phone mockups in various sizes",
    props: {
      children: "Mobile app content",
      size: "lg"
    }
  }, {
    title: "Responsive E-commerce App",
    description: "Phone mockup showcasing a mobile app interface",
    props: {
      children: "Mobile app content"
    }
  },
];

export const phoneMetadata: ComponentMetadata = {
  name: "Phone",
  description: "Mobile device mockup",
  category: ComponentCategory.MOCKUP,
  path: "/components/mockup/phone",
  tags: ["phone", "mobile", "mockup", "device", "demo", "showcase"],
  examples: phoneExamples,
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
  )
};
