import { ComponentChildren } from "preact";
import { BaseComponentProps } from "../../types.ts";

export interface DropdownProps extends BaseComponentProps {
  open?: boolean;
  trigger: ComponentChildren;
  content: ComponentChildren;
  position?:
    | "top"
    | "bottom"
    | "left"
    | "right"
    | "top-start"
    | "top-end"
    | "bottom-start"
    | "bottom-end";
  hover?: boolean;
  forceOpen?: boolean;
  onToggle?: (open: boolean) => void;
  onOpen?: () => void;
  onClose?: () => void;
}

export function Dropdown({
  children,
  class: className = "",
  open = false,
  trigger,
  content,
  position = "bottom",
  hover = false,
  forceOpen = false,
  id,
  onToggle,
  onOpen,
  onClose,
  ...props
}: DropdownProps) {
  const dropdownClasses = [
    "dropdown",
    position.includes("top") ? "dropdown-top" : "",
    position.includes("bottom") ? "dropdown-bottom" : "",
    position.includes("left") ? "dropdown-left" : "",
    position.includes("right") ? "dropdown-right" : "",
    position.includes("end") ? "dropdown-end" : "",
    hover ? "dropdown-hover" : "",
    open || forceOpen ? "dropdown-open" : "",
    className,
  ].filter(Boolean).join(" ");

  return (
    <div class={dropdownClasses} id={id} {...props}>
      <div tabindex={0} role="button" class="dropdown-trigger">
        {trigger}
      </div>
      <ul
        tabindex={0}
        class="dropdown-content menu bg-base-100 rounded-box z-[100] w-52 p-2 shadow"
      >
        {content}
      </ul>
    </div>
  );
}
