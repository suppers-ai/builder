import { ComponentChildren } from "preact";
import { BaseComponentProps } from "../../types.ts";

export interface StackProps extends BaseComponentProps {
  /** Child elements to stack */
  children: ComponentChildren;
  /** Direction of stacking */
  direction?: "horizontal" | "vertical";
  /** Gap between stacked elements */
  gap?: "xs" | "sm" | "md" | "lg" | "xl";
  /** Alignment of stacked elements */
  align?: "start" | "center" | "end" | "stretch";
  /** Justification of stacked elements */
  justify?: "start" | "center" | "end" | "between" | "around" | "evenly";
  /** Whether to wrap elements */
  wrap?: boolean;
  /** Click handler for the stack container */
  onStackClick?: () => void;
}

export function Stack({
  children,
  direction = "vertical",
  gap = "md",
  align = "start",
  justify = "start",
  wrap = false,
  class: className,
  ...props
}: StackProps) {
  // Build stack classes
  const stackClasses = [
    "flex",
    direction === "vertical" ? "flex-col" : "flex-row",
    wrap && "flex-wrap",
    // Gap classes
    {
      "xs": "gap-1",
      "sm": "gap-2",
      "md": "gap-4",
      "lg": "gap-6",
      "xl": "gap-8",
    }[gap],
    // Alignment classes
    direction === "vertical"
      ? {
        "start": "items-start",
        "center": "items-center",
        "end": "items-end",
        "stretch": "items-stretch",
      }[align]
      : {
        "start": "items-start",
        "center": "items-center",
        "end": "items-end",
        "stretch": "items-stretch",
      }[align],
    // Justify classes
    {
      "start": "justify-start",
      "center": "justify-center",
      "end": "justify-end",
      "between": "justify-between",
      "around": "justify-around",
      "evenly": "justify-evenly",
    }[justify],
    className,
  ].filter(Boolean).join(" ");

  return (
    <div className={stackClasses} {...props}>
      {children}
    </div>
  );
}
