import { ComponentChildren } from "preact";
import { BaseComponentProps } from "../../types.ts";

// Hero interfaces
export interface HeroProps extends BaseComponentProps {
  /** Hero title/heading */
  title: string;
  /** Hero subtitle/description */
  subtitle?: string;
  /** Title text color */
  titleColor?: string;
  /** Subtitle text color */
  subtitleColor?: string;
  /** Primary call-to-action button */
  primaryCTA?: {
    text: string;
    href?: string;
    onClick?: () => void;
  };
  /** Secondary call-to-action button */
  secondaryCTA?: {
    text: string;
    href?: string;
    onClick?: () => void;
  };
  /** Hero content (usually an image or illustration) */
  content?: ComponentChildren;
  /** Hero layout variant */
  variant?: "default" | "centered" | "split" | "overlay" | "minimal";
  /** Background variant */
  background?: "default" | "gradient" | "image" | "video";
  /** Background image URL */
  backgroundImage?: string;
  /** Background video URL */
  backgroundVideo?: string;
  /** Size variant */
  size?: "sm" | "md" | "lg" | "full";
  /** Content alignment */
  align?: "left" | "center" | "right";
  /** Whether to show content on right side (for split layout) */
  contentPosition?: "left" | "right";
  /** Additional interaction callbacks */
  onPrimaryCTAClick?: () => void;
  onSecondaryCTAClick?: () => void;
  className?: string;
}

export function Hero({
  title,
  subtitle,
  titleColor,
  subtitleColor,
  primaryCTA,
  secondaryCTA,
  content,
  variant = "default",
  background = "default",
  backgroundImage,
  backgroundVideo,
  size = "lg",
  align = "center",
  contentPosition = "right",
  className,
  ...props
}: HeroProps) {
  // Build background classes
  const backgroundClasses = {
    default: "bg-base-100",
    gradient: "bg-gradient-to-br from-primary/20 to-secondary/20",
    image: backgroundImage ? `bg-cover bg-center bg-no-repeat` : "bg-base-100",
    video: "relative overflow-hidden",
  };

  // Build size classes
  const sizeClasses = {
    sm: "min-h-[50vh] py-16",
    md: "min-h-[60vh] py-20",
    lg: "min-h-[75vh] py-24",
    full: "min-h-screen py-32",
  };

  // Build layout classes based on variant
  const getLayoutClasses = () => {
    switch (variant) {
      case "centered":
        return "flex flex-col items-center justify-center text-center";
      case "split":
        return "flex flex-col lg:flex-row items-center justify-between gap-12";
      case "overlay":
        return "relative flex flex-col items-center justify-center text-center";
      case "minimal":
        return "flex flex-col items-center justify-center text-center py-16";
      default:
        return "flex flex-col items-center justify-center text-center lg:text-left lg:items-start";
    }
  };

  // Build content alignment classes
  const alignClasses = {
    left: "text-left items-start",
    center: "text-center items-center",
    right: "text-right items-end",
  };

  const heroClasses = [
    "hero",
    sizeClasses[size],
    backgroundClasses[background],
    className,
  ].filter(Boolean).join(" ");

  const heroContentClasses = [
    "hero-content",
    "max-w-7xl",
    "mx-auto",
    "px-4",
    "sm:px-6",
    "lg:px-8",
    getLayoutClasses(),
    variant !== "split" && alignClasses[align],
  ].filter(Boolean).join(" ");

  const renderCTAButtons = () => {
    if (!primaryCTA && !secondaryCTA) return null;

    return (
      <div className="flex flex-col sm:flex-row gap-4 mt-8 justify-center">
        {primaryCTA && (
          <a
            href={primaryCTA.href}
            onClick={primaryCTA.onClick}
            className="btn btn-primary btn-lg"
          >
            {primaryCTA.text}
          </a>
        )}
        {secondaryCTA && (
          <a
            href={secondaryCTA.href}
            onClick={secondaryCTA.onClick}
            className="btn btn-outline btn-lg"
          >
            {secondaryCTA.text}
          </a>
        )}
      </div>
    );
  };

  const renderTextContent = () => (
    <div className={variant === "split" ? "flex-1" : "max-w-4xl"}>
      <h1 
        className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6"
        style={titleColor ? { color: titleColor } : {}}
      >
        {title}
      </h1>
      {subtitle && (
        <p 
          className="text-lg sm:text-xl lg:text-2xl opacity-80 mb-8 leading-relaxed"
          style={subtitleColor ? { color: subtitleColor } : {}}
        >
          {subtitle}
        </p>
      )}
      {renderCTAButtons()}
    </div>
  );

  const renderVisualContent = () => {
    if (!content) return null;

    return (
      <div className={variant === "split" ? "flex-1" : "mt-12"}>
        {content}
      </div>
    );
  };

  const backgroundStyle = background === "image" && backgroundImage
    ? { backgroundImage: `url(${backgroundImage})` }
    : {};

  return (
    <div
      className={heroClasses}
      style={backgroundStyle}
      {...props}
    >
      {/* Background Video */}
      {background === "video" && backgroundVideo && (
        <>
          <video
            className="absolute inset-0 w-full h-full object-cover"
            autoPlay
            muted
            loop
            playsInline
          >
            <source src={backgroundVideo} type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-black/40"></div>
        </>
      )}

      {/* Hero Content */}
      <div className={heroContentClasses}>
        {variant === "split"
          ? (
            <>
              {contentPosition === "left"
                ? (
                  <>
                    {renderVisualContent()}
                    {renderTextContent()}
                  </>
                )
                : (
                  <>
                    {renderTextContent()}
                    {renderVisualContent()}
                  </>
                )}
            </>
          )
          : (
            <>
              {renderTextContent()}
              {renderVisualContent()}
            </>
          )}
      </div>

      {/* Overlay for better text readability */}
      {(background === "image" || background === "video") && variant === "overlay" && (
        <div className="absolute inset-0 bg-black/30"></div>
      )}
    </div>
  );
}
