import { BaseComponentProps, SizeProps } from "../../types.ts";

// Breadcrumbs interfaces
export interface BreadcrumbsProps extends BaseComponentProps, SizeProps {
  items: BreadcrumbItemProps[];
}

export interface BreadcrumbItemProps {
  label: string;
  href?: string;
  active?: boolean;
  disabled?: boolean;
}

export function Breadcrumbs({
  class: className = "",
  size = "md",
  items,
  id,
  ...props
}: BreadcrumbsProps) {
  const breadcrumbsClasses = [
    "breadcrumbs",
    size ? `text-${size}` : "",
    className,
  ].filter(Boolean).join(" ");

  return (
    <div class={breadcrumbsClasses} id={id} {...props}>
      <ul>
        {items.map((item, index) => (
          <li key={index}>
            {item.href && !item.disabled
              ? (
                <a
                  href={item.href}
                  class={`${item.active ? "text-primary font-semibold" : ""} ${
                    item.disabled ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  {item.label}
                </a>
              )
              : (
                <span
                  class={`${item.active ? "text-primary font-semibold" : ""} ${
                    item.disabled ? "opacity-50" : ""
                  }`}
                >
                  {item.label}
                </span>
              )}
          </li>
        ))}
      </ul>
    </div>
  );
}
