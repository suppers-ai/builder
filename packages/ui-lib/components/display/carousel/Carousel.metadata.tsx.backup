import { ComponentMetadata, ComponentExample, ComponentCategory } from "../../types.ts";
import { Carousel, CarouselItem } from "./Carousel.tsx";

const carouselExamples: ComponentExample[] = [
  {
    title: "Basic Carousel",
    description: "Simple carousel with default settings",
    code: `<Carousel>
  <CarouselItem>
    <div class="bg-primary text-primary-content h-64 flex items-center justify-center">
      Slide 1
    </div>
  </CarouselItem>
  <CarouselItem>
    <div class="bg-secondary text-secondary-content h-64 flex items-center justify-center">
      Slide 2
    </div>
  </CarouselItem>
  <CarouselItem>
    <div class="bg-accent text-accent-content h-64 flex items-center justify-center">
      Slide 3
    </div>
  </CarouselItem>
</Carousel>`,
    showCode: true,
  },
  {
    title: "With Indicators",
    description: "Carousel with dot indicators at the bottom",
    code: `<Carousel indicators navigation>
  <CarouselItem>
    <img src="https://img.daisyui.com/images/stock/photo-1559703248-dcaaec9fab78.jpg" class="w-full" alt="Slide 1" />
  </CarouselItem>
  <CarouselItem>
    <img src="https://img.daisyui.com/images/stock/photo-1565098772267-60af42b81ef2.jpg" class="w-full" alt="Slide 2" />
  </CarouselItem>
  <CarouselItem>
    <img src="https://img.daisyui.com/images/stock/photo-1572635148818-ef6fd45eb394.jpg" class="w-full" alt="Slide 3" />
  </CarouselItem>
</Carousel>`,
    showCode: true,
  },
  {
    title: "With Navigation Buttons",
    description: "Carousel with previous/next navigation buttons",
    code: `<Carousel navigation indicators={false} autoSlide>
  <CarouselItem>
    <div class="bg-gradient-to-r from-purple-400 to-pink-400 h-64 flex items-center justify-center text-white font-bold text-2xl">
      Auto Slide 1
    </div>
  </CarouselItem>
  <CarouselItem>
    <div class="bg-gradient-to-r from-green-400 to-blue-400 h-64 flex items-center justify-center text-white font-bold text-2xl">
      Auto Slide 2
    </div>
  </CarouselItem>
  <CarouselItem>
    <div class="bg-gradient-to-r from-yellow-400 to-red-400 h-64 flex items-center justify-center text-white font-bold text-2xl">
      Auto Slide 3
    </div>
  </CarouselItem>
</Carousel>`,
    showCode: true,
  },
  {
    title: "Vertical Carousel",
    description: "Carousel with vertical sliding orientation",
    code: `<Carousel vertical indicators navigation class="h-96">
  <CarouselItem>
    <div class="bg-info text-info-content h-32 flex items-center justify-center">
      Vertical Slide 1
    </div>
  </CarouselItem>
  <CarouselItem>
    <div class="bg-success text-success-content h-32 flex items-center justify-center">
      Vertical Slide 2
    </div>
  </CarouselItem>
  <CarouselItem>
    <div class="bg-warning text-warning-content h-32 flex items-center justify-center">
      Vertical Slide 3
    </div>
  </CarouselItem>
</Carousel>`,
    showCode: true,
  },
  {
    title: "Center Mode Carousel",
    description: "Carousel with center snap and multiple visible items",
    code: `<Carousel snap="center" indicators>
  <CarouselItem>
    <div class="bg-base-300 h-48 mx-2 flex items-center justify-center rounded-lg">
      Center Item 1
    </div>
  </CarouselItem>
  <CarouselItem>
    <div class="bg-base-300 h-48 mx-2 flex items-center justify-center rounded-lg">
      Center Item 2
    </div>
  </CarouselItem>
  <CarouselItem>
    <div class="bg-base-300 h-48 mx-2 flex items-center justify-center rounded-lg">
      Center Item 3
    </div>
  </CarouselItem>
</Carousel>`,
    showCode: true,
  },
];

export const carouselMetadata: ComponentMetadata = {
  name: "Carousel",
  description: "Image and content slider",
  category: ComponentCategory.DISPLAY,
  path: "/components/display/carousel",
  tags: ["slider", "gallery", "images", "navigation", "slideshow", "swipe"],
  examples: carouselExamples,
  relatedComponents: ["artboard", "hero", "card"],
  preview: (
    <div class="w-64 h-32">
      <Carousel indicators navigation>
        <CarouselItem>
          <div class="bg-primary text-primary-content flex items-center justify-center h-32">
            Slide 1
          </div>
        </CarouselItem>
        <CarouselItem>
          <div class="bg-secondary text-secondary-content flex items-center justify-center h-32">
            Slide 2
          </div>
        </CarouselItem>
        <CarouselItem>
          <div class="bg-accent text-accent-content flex items-center justify-center h-32">
            Slide 3
          </div>
        </CarouselItem>
      </Carousel>
    </div>
  ),
};
