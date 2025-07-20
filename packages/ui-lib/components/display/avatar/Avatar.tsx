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
  const avatarClasses = [
    "avatar",
    online ? "online" : "",
    offline ? "offline" : "",
    className,
  ].filter(Boolean).join(" ");

  const imageClasses = [
    ring ? "ring ring-primary ring-offset-base-100 ring-offset-2" : "",
    "rounded-full",
    size === "xs" ? "w-6 h-6" : "",
    size === "sm" ? "w-8 h-8" : "",
    size === "md" ? "w-12 h-12" : "",
    size === "lg" ? "w-16 h-16" : "",
    size === "xl" ? "w-24 h-24" : "",
  ].filter(Boolean).join(" ");

  const content = src
    ? <img src={src} alt={alt} class={imageClasses} />
    : (
      <div class={`placeholder ${imageClasses} bg-neutral text-neutral-content`}>
        <span class={size === "xs" ? "text-xs" : size === "sm" ? "text-sm" : "text-xl"}>
          {initials || placeholder || "?"}
        </span>
      </div>
    );

  return (
    <div class={avatarClasses} id={id} {...props}>
      {content}
    </div>
  );
}
