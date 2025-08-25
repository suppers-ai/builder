import { BaseComponentProps, SizeProps } from "../../types.ts";
import { globalTheme } from "../../../utils/signals.ts";

export interface LogoProps extends BaseComponentProps, SizeProps {
  alt?: string;
  variant?: "long" | "short";
  href?: string;
  lightSrc?: string;
  darkSrc?: string;
}

export function Logo({
  class: className = "",
  size = "md",
  alt = "Suppers Logo",
  variant = "long",
  href,
  lightSrc,
  darkSrc,
  id,
  ...props
}: LogoProps) {
  const getSizeClasses = (size: string) => {
    switch (size) {
      case "xs":
        return "h-4";
      case "sm":
        return "h-6";
      case "md":
        return "h-8";
      case "lg":
        return "h-12";
      case "xl":
        return "h-16";
      default:
        return "h-8";
    }
  };

  const getLogoSrc = () => {
    const currentTheme = globalTheme.value;
    const isDark = currentTheme === "dark" ||
      currentTheme === "synthwave" ||
      currentTheme === "halloween" ||
      currentTheme === "forest" ||
      currentTheme === "black" ||
      currentTheme === "luxury" ||
      currentTheme === "dracula" ||
      currentTheme === "business" ||
      currentTheme === "night" ||
      currentTheme === "coffee";

    // Use custom sources if provided
    if (lightSrc && darkSrc) {
      return isDark ? darkSrc : lightSrc;
    }

    // Fall back to default logo paths
    const themeType = isDark ? "dark" : "light";
    const baseUrl = typeof Deno !== "undefined" 
      ? Deno.env.get("STATIC_ASSETS_URL") || "http://localhost:8001"
      : "http://localhost:8001";
    return `${baseUrl}/static/logos/${variant}_${themeType}.png`;
  };

  const sizeClass = getSizeClasses(size);
  const classes = `w-auto object-contain ${sizeClass} ${className}`.trim();

  const logoElement = (
    <img
      src={getLogoSrc()}
      alt={alt}
      class={classes}
      id={id}
      {...props}
    />
  );

  if (href) {
    return (
      <a
        href={href}
        class="inline-block hover:opacity-80 transition-opacity"
      >
        {logoElement}
      </a>
    );
  }

  return logoElement;
}
