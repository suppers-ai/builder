import { BaseComponentProps } from "../../types.ts";
import { ComponentChildren } from "preact";
import { useEffect, useRef, useState } from "preact/hooks";
import { Button } from "../../action/button/Button.tsx";

export interface CarouselProps extends BaseComponentProps {
  vertical?: boolean;
  autoSlide?: boolean;
  interval?: number;
  indicators?: boolean;
  navigation?: boolean;
  snap?: "start" | "center" | "end";
  children: ComponentChildren;
  // Controlled mode props
  currentSlide?: number;
  onSlideChange?: (index: number) => void;
  onNextSlide?: () => void;
  onPrevSlide?: () => void;
  onGoToSlide?: (index: number) => void;
  // Interactive controls
  showControls?: boolean;
  controlsPosition?: "top" | "bottom";
  allowAutoSlideToggle?: boolean;
  showSlideCounter?: boolean;
}

export interface CarouselItemProps extends BaseComponentProps {
  children: ComponentChildren;
}

export function Carousel({
  class: className = "",
  vertical = false,
  autoSlide = false,
  interval = 3000,
  indicators = true,
  navigation = true,
  snap = "center",
  children,
  currentSlide = 0,
  onSlideChange,
  onNextSlide,
  onPrevSlide,
  onGoToSlide,
  showControls = false,
  controlsPosition = "bottom",
  allowAutoSlideToggle = false,
  showSlideCounter = false,
  id,
  ...props
}: CarouselProps) {
  const carouselClasses = [
    "carousel",
    vertical ? "carousel-vertical" : "",
    "w-full",
    className,
  ].filter(Boolean).join(" ");

  // Convert children to array for proper handling
  const childArray = Array.isArray(children) ? children : [children];
  const slideCount = childArray.filter(Boolean).length;

  // Use controlled mode if handlers are provided
  const isControlled = !!(onSlideChange || onNextSlide || onPrevSlide || onGoToSlide);

  // Internal state for interactive controls
  const [internalSlide, setInternalSlide] = useState(currentSlide);
  const [autoSlideEnabled, setAutoSlideEnabled] = useState(autoSlide);
  const intervalRef = useRef<number | null>(null);

  // Use internal state if not controlled
  const activeSlide = isControlled ? currentSlide : internalSlide;

  // Auto-slide functionality
  useEffect(() => {
    if (autoSlideEnabled && slideCount > 1) {
      intervalRef.current = setInterval(() => {
        if (isControlled) {
          const nextSlide = (activeSlide + 1) % slideCount;
          onSlideChange?.(nextSlide);
        } else {
          setInternalSlide((prev) => (prev + 1) % slideCount);
        }
      }, interval);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [autoSlideEnabled, interval, slideCount, activeSlide, isControlled, onSlideChange]);

  const handleNext = () => {
    if (onNextSlide) {
      onNextSlide();
    } else if (onSlideChange) {
      const nextSlide = (activeSlide + 1) % slideCount;
      onSlideChange(nextSlide);
    } else {
      setInternalSlide((prev) => (prev + 1) % slideCount);
    }
  };

  const handlePrev = () => {
    if (onPrevSlide) {
      onPrevSlide();
    } else if (onSlideChange) {
      const prevSlide = (activeSlide - 1 + slideCount) % slideCount;
      onSlideChange(prevSlide);
    } else {
      setInternalSlide((prev) => (prev - 1 + slideCount) % slideCount);
    }
  };

  const handleGoTo = (index: number) => {
    if (onGoToSlide) {
      onGoToSlide(index);
    } else if (onSlideChange) {
      onSlideChange(index);
    } else {
      setInternalSlide(index);
    }
  };

  // Controls component
  const renderControls = () => {
    if (!showControls) return null;

    const controlsClass = controlsPosition === "top" ? "-mb-4 -mt-2" : "mt-4";

    return (
      <div class={`flex justify-center items-center gap-4 ${controlsClass}`}>
        {showSlideCounter && (
          <div class="badge badge-primary">
            Slide {activeSlide + 1} of {slideCount}
          </div>
        )}
        {allowAutoSlideToggle && (
          <Button
            size="sm"
            variant={autoSlideEnabled ? "solid" : "outline"}
            color={autoSlideEnabled ? "secondary" : "primary"}
            onClick={() => setAutoSlideEnabled(!autoSlideEnabled)}
          >
            {autoSlideEnabled ? "Stop Auto-slide" : "Start Auto-slide"}
          </Button>
        )}
      </div>
    );
  };

  if (isControlled || showControls) {
    // Controlled mode - for islands
    return (
      <div class="relative">
        {controlsPosition === "top" && renderControls()}
        <div class={carouselClasses} id={id} {...props}>
          {childArray.map((child: ComponentChildren, index: number) => (
            <div
              key={index}
              class={`carousel-item relative w-full ${
                snap === "start"
                  ? "justify-start"
                  : snap === "end"
                  ? "justify-end"
                  : "justify-center"
              } ${index === activeSlide ? "block" : "hidden"}`}
              style={{
                transform: `translateX(${(index - activeSlide) * 100}%)`,
                transition: "transform 0.5s ease-in-out",
              }}
            >
              {child}
            </div>
          ))}
        </div>

        {navigation && slideCount > 1 && (
          <div class="flex justify-between transform -translate-y-1/2 absolute left-5 right-5 top-1/2">
            <Button onClick={handlePrev} circle>❮</Button>
            <Button onClick={handleNext} circle>❯</Button>
          </div>
        )}

        {indicators && slideCount > 1 && (
          <div class="flex justify-center w-full py-2 gap-2">
            {Array.from({ length: slideCount }, (_, index: number) => (
              <button
                key={index}
                onClick={() => handleGoTo(index)}
                class={`btn btn-xs ${index === activeSlide ? "btn-primary" : "btn-outline"}`}
              >
                {index + 1}
              </button>
            ))}
          </div>
        )}

        {controlsPosition === "bottom" && renderControls()}
      </div>
    );
  } else {
    // Uncontrolled mode - for static display with CSS navigation
    return (
      <div class="relative">
        <div class={carouselClasses} id={id} {...props}>
          {childArray.map((child: ComponentChildren, index: number) => (
            <div
              key={index}
              id={`slide${index + 1}`}
              class={`carousel-item relative w-full ${
                snap === "start"
                  ? "justify-start"
                  : snap === "end"
                  ? "justify-end"
                  : "justify-center"
              }`}
            >
              {child}
            </div>
          ))}
        </div>

        {navigation && slideCount > 1 && (
          <div class="flex justify-between transform -translate-y-1/2 absolute left-5 right-5 top-1/2">
            <a href="#slide1" class="btn btn-circle">❮</a>
            <a href={`#slide${slideCount}`} class="btn btn-circle">❯</a>
          </div>
        )}

        {indicators && slideCount > 1 && (
          <div class="flex justify-center w-full py-2 gap-2">
            {Array.from({ length: slideCount }, (_, index: number) => (
              <a
                key={index}
                href={`#slide${index + 1}`}
                class="btn btn-xs"
              >
                {index + 1}
              </a>
            ))}
          </div>
        )}
      </div>
    );
  }
}

export function CarouselItem({
  class: className = "",
  children,
  id,
  ...props
}: CarouselItemProps) {
  return (
    <div class={`carousel-item w-full ${className}`} id={id} {...props}>
      {children}
    </div>
  );
}
