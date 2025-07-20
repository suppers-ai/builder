import { ComponentChildren } from "preact";
import { Search } from "lucide-preact";
import { Button } from "../button/Button.tsx";
import { Kbd } from "../../display/kbd/Kbd.tsx";

export interface SearchButtonProps {
  onClick: () => void;
  variant?:
    | "primary"
    | "secondary"
    | "accent"
    | "ghost"
    | "link"
    | "info"
    | "success"
    | "warning"
    | "error";
  size?: "xs" | "sm" | "md" | "lg";
  shape?: "circle" | "square";
  class?: string;
  showKeyboardHint?: boolean;
  keyboardHint?: string;
  tooltip?: string;
  children?: ComponentChildren;
  disabled?: boolean;
}

export function SearchButton({
  onClick,
  variant = "ghost",
  size = "md",
  shape = "square",
  class: className = "",
  showKeyboardHint = false,
  keyboardHint = "⌘K",
  tooltip,
  children,
  disabled = false,
  ...props
}: SearchButtonProps) {
  const searchIcon = (
    <Search size={size === "xs" ? 14 : size === "sm" ? 16 : size === "lg" ? 20 : 18} />
  );

  const buttonContent = children || (
    <>
      {searchIcon}
      {showKeyboardHint && (
        <span class="hidden lg:flex items-center gap-1 ml-2 text-xs text-base-content/60">
          <Kbd size="sm">{keyboardHint}</Kbd>
        </span>
      )}
    </>
  );

  if (tooltip) {
    return (
      <div class="tooltip tooltip-bottom" data-tip={tooltip}>
        <Button
          variant={variant}
          size={size}
          shape={shape}
          class={className}
          onClick={onClick}
          disabled={disabled}
          {...props}
        >
          {buttonContent}
        </Button>
      </div>
    );
  }

  return (
    <Button
      variant={variant}
      size={size}
      shape={shape}
      class={className}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {buttonContent}
    </Button>
  );
}
