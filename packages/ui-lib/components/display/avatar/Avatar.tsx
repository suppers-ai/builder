import { BaseComponentProps, SizeProps } from "../../types.ts";

export interface AvatarProps extends BaseComponentProps, SizeProps {
  src?: string;
  alt?: string;
  placeholder?: string;
  ring?: boolean;
  online?: boolean;
  offline?: boolean;
  initials?: string;
}

export function Avatar({
  class: className = "",
  size = "md",
  src,
  alt = "",
  placeholder,
  ring = false,
  online = false,
  offline = false,
  initials,
  id,
  ...props
}: AvatarProps) {
  const getSizeClasses = (size: string) => {
    switch (size) {
      case "xs": return "w-6";
      case "sm": return "w-8";
      case "lg": return "w-16";
      case "xl": return "w-24";
      default: return "w-12"; // md
    }
  };

  const avatarClasses = [
    "avatar",
    online ? "online" : "",
    offline ? "offline" : "",
    className,
  ].filter(Boolean).join(" ");

  const imageClasses = [
    ring ? "ring ring-primary ring-offset-base-100 ring-offset-2" : "",
    "rounded-full",
    getSizeClasses(size),
  ].filter(Boolean).join(" ");

  const placeholderClasses = [
    "placeholder !flex items-center justify-center",
    ring ? "ring ring-primary ring-offset-base-100 ring-offset-2" : "",
    "rounded-full",
    getSizeClasses(size),
    "bg-neutral text-neutral-content",
  ].filter(Boolean).join(" ");

  const content = src
    ? <img src={src} alt={alt} class={imageClasses} />
    : (
      <div class={placeholderClasses}>
        <span class={size === "xs" ? "text-xs" : size === "sm" ? "text-sm" : "text-xl"}>
          {initials || placeholder || "?"}
        </span>
      </div>
    );

  return (
    <div class={avatarClasses} id={id} {...props}>
      {content}
      {online && (
        <span class="absolute bottom-0 right-0 block h-3 w-3 rounded-full bg-green-500 ring-2 ring-white"></span>
      )}
      {offline && (
        <span class="absolute bottom-0 right-0 block h-3 w-3 rounded-full bg-slate-400 ring-2 ring-white"></span>
      )}
    </div>
  );
}
