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
      case "xs": return "w-6 h-6";
      case "sm": return "w-8 h-8";
      case "lg": return "w-16 h-16";
      case "xl": return "w-24 h-24";
      default: return "w-12 h-12"; // md
    }
  };

  const avatarClasses = [
    "avatar",
    "relative",
    className,
  ].filter(Boolean).join(" ");

  const wrapperClasses = [
    getSizeClasses(size),
    "rounded-full",
    ring ? "ring-primary ring-offset-base-100 ring-2 ring-offset-2" : "",
  ].filter(Boolean).join(" ");

  const imageClasses = "w-full h-full rounded-full";

  const content = src
    ? <img src={src} alt={alt} class={imageClasses} />
    : (
      <div class="bg-neutral text-neutral-content !flex items-center justify-center w-full h-full rounded-full">
        <span class={size === "xs" ? "text-[8px]" : size === "sm" ? "text-xs" : size === "lg" ? "text-lg" : size === "xl" ? "text-2xl" : "text-xl"}>
          {initials || placeholder || "?"}
        </span>
      </div>
    );

  return (
    <div class={avatarClasses} id={id} {...props}>
      <div class={wrapperClasses}>
        {content}
      </div>
      {online && (
        <span class="absolute bottom-0 right-0 block h-3 w-3 rounded-full bg-green-500 ring-2 ring-white"></span>
      )}
      {offline && (
        <span class="absolute bottom-0 right-0 block h-3 w-3 rounded-full bg-gray-400 ring-2 ring-white"></span>
      )}
    </div>
  );
}
