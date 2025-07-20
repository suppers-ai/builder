import { ComponentMetadata } from "../../types.ts";
import { Carousel, CarouselItem } from "./Carousel.tsx";

export const carouselMetadata: ComponentMetadata = {
  name: "Carousel",
  description: "Image and content slider",
  category: "Data Display",
  path: "/components/display/carousel",
  tags: ["slider", "gallery", "images", "navigation", "slideshow", "swipe"],
  examples: ["basic", "with-indicators", "with-buttons", "vertical", "center-mode"],
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
