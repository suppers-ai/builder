import { ComponentMetadata, ComponentExample, ComponentCategory } from "../../types.ts";
import { Carousel, CarouselItem } from "./Carousel.tsx";

const carouselExamples: ComponentExample[] = [
  {
    title: "Basic Carousel",
    description: "Simple carousel with default settings",
    props: {
      items: [
        {
          id: "1",
      content: "Slide 1 content"
        },
        {
          id: "2",
      content: "Slide 2 content"
        },
        {
          id: "3",
      content: "Slide 3 content"
        }
      ]
    }
  },  {
    title: "With Indicators",
    description: "Carousel with dot indicators at the bottom",
    props: {
      items: [
        {
          id: "1",
      content: "Slide 1 content"
        },
        {
          id: "2",
      content: "Slide 2 content"
        },
        {
          id: "3",
      content: "Slide 3 content"
        }
      ]
    }
  },  {
    title: "With Navigation Buttons",
    description: "Carousel with previous/next navigation buttons",
    props: {
      items: [
        {
          id: "1",
      content: "Slide 1 content"
        },
        {
          id: "2",
      content: "Slide 2 content"
        },
        {
          id: "3",
      content: "Slide 3 content"
        }
      ]
    }
  },  {
    title: "Vertical Carousel",
    description: "Carousel with vertical sliding orientation",
    props: {
      items: [
        {
          id: "1",
      content: "Slide 1 content"
        },
        {
          id: "2",
      content: "Slide 2 content"
        },
        {
          id: "3",
      content: "Slide 3 content"
        }
      ]
    }
  },  {
    title: "Center Mode Carousel",
    description: "Carousel with center snap and multiple visible items",
    props: {
      items: [
        {
          id: "1",
      content: "Slide 1 content"
        },
        {
          id: "2",
      content: "Slide 2 content"
        },
        {
          id: "3",
      content: "Slide 3 content"
        }
      ]
    }
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
  )};
