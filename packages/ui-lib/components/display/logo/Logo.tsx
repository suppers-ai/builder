import { BaseComponentProps, SizeProps } from "../../types.ts";
import { globalTheme } from "../../../utils/signals.ts";

export interface LogoProps extends BaseComponentProps, SizeProps {
  alt?: string;
  variant?: "long" | "short";
  href?: string;
}

export function Logo({
  class: className = "",
  size = "md",
  alt = "Suppers Logo",
  variant = "long",
  href,
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
    
    const themeType = isDark ? "dark" : "light";
    return `https://cdn.suppers.ai/logos/${variant}_${themeType}.png`;
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