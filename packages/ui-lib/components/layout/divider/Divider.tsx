import { BaseComponentProps } from "../../types.ts";

export interface DividerProps extends BaseComponentProps {
  text?: string;
  position?: "start" | "center" | "end";
  responsive?: boolean;
  vertical?: boolean;
  // Divider doesn't need additional interactive props
}

export function Divider({
  class: className = "",
  text,
  position = "center",
  responsive = false,
  vertical = false,
  id,
  ...props
}: DividerProps) {
  const dividerClasses = [
    "divider",
    vertical ? "divider-vertical" : "divider-horizontal",
    position === "start" ? "divider-start" : position === "end" ? "divider-end" : "",
    responsive ? "divider-responsive" : "",
    className,
  ].filter(Boolean).join(" ");

  return (
    <div class={dividerClasses} id={id} {...props}>
      {text}
    </div>
  );
}
