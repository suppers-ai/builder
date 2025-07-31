import { ComponentChildren } from "preact";
import { BaseComponentProps } from "../../types.ts";

export interface CardProps extends BaseComponentProps {
  title?: string;
  image?: string;
  imageAlt?: string;
  compact?: boolean;
  side?: boolean;
  glass?: boolean;
  bordered?: boolean;
  actions?: ComponentChildren;
}

export function Card({
  children,
  class: className = "",
  title,
  image,
  imageAlt = "",
  compact = false,
  side = false,
  glass = false,
  bordered = false,
  actions,
  id,
  ...props
}: CardProps) {
  const cardClasses = [
    "card",
    compact ? "card-compact" : "",
    side ? "card-side" : "",
    glass ? "glass" : "",
    bordered ? "card-bordered" : "",
    "bg-base-100",
    // Enhanced shadow for DaisyUI 5 - use shadow-xl as default, but allow override
    className.includes("shadow-") ? "" : "shadow-xl",
    className,
  ].filter(Boolean).join(" ");

  return (
    <div class={cardClasses} id={id} {...props}>
      {image && (
        <figure>
          <img src={image} alt={imageAlt} />
        </figure>
      )}

      <div class="card-body">
        {title && <h2 class="card-title">{title}</h2>}
        {children}

        {actions && (
          <div class="card-actions justify-end">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}
