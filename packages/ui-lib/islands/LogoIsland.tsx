import { useSignal, useComputed } from "@preact/signals";
import { useEffect } from "preact/hooks";
import { BaseComponentProps, SizeProps } from "../components/types.ts";
import { globalTheme } from "../utils/signals.ts";

export interface LogoIslandProps extends BaseComponentProps, SizeProps {
  alt?: string;
  variant?: "long" | "short";
  href?: string;
}

export default function LogoIsland({
  class: className = "",
  size = "md",
  alt = "Suppers Logo",
  variant = "long",
  href,
  id,
  ...props
}: LogoIslandProps) {
  const currentTheme = useSignal(globalTheme.value);

  useEffect(() => {
    const unsubscribe = globalTheme.subscribe((value) => {
      currentTheme.value = value;
    });
    return () => unsubscribe();
  }, []);

  const logoSrc = useComputed(() => {
    const isDark = currentTheme.value === "dark" ||
      currentTheme.value === "synthwave" ||
      currentTheme.value === "halloween" ||
      currentTheme.value === "forest" ||
      currentTheme.value === "black" ||
      currentTheme.value === "luxury" ||
      currentTheme.value === "dracula" ||
      currentTheme.value === "business" ||
      currentTheme.value === "night" ||
      currentTheme.value === "coffee";

    const themeType = isDark ? "dark" : "light";
    const baseUrl = typeof Deno !== "undefined" 
      ? Deno.env.get("STATIC_ASSETS_URL") || "http://localhost:8001"
      : "http://localhost:8001";
    return `${baseUrl}/static/logos/${variant}_${themeType}.png`;
  });

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

  const sizeClass = getSizeClasses(size);
  const classes = `w-auto object-contain ${sizeClass} ${className}`.trim();

  const logoElement = (
    <img
      src={logoSrc.value}
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