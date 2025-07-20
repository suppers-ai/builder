import { BaseComponentProps, SizeProps } from "../../types.ts";

// Menu interfaces
export interface MenuProps extends BaseComponentProps, SizeProps {
  horizontal?: boolean;
  compact?: boolean;
  items: MenuItemProps[];
}

export interface MenuItemProps {
  label: string;
  href?: string;
  active?: boolean;
  disabled?: boolean;
  children?: MenuItemProps[];
}

export function Menu({
  class: className = "",
  size = "md",
  horizontal = false,
  compact = false,
  items,
  id,
  ...props
}: MenuProps) {
  const menuClasses = [
    "menu",
    size ? `menu-${size}` : "",
    horizontal ? "menu-horizontal" : "",
    compact ? "menu-compact" : "",
    "bg-base-200 rounded-box",
    className,
  ].filter(Boolean).join(" ");

  const renderMenuItem = (item: MenuItemProps, index: number) => {
    const hasChildren = item.children && item.children.length > 0;

    if (hasChildren) {
      return (
        <li key={index}>
          <details>
            <summary class={item.disabled ? "disabled" : ""}>
              {item.label}
            </summary>
            <ul>
              {item.children!.map((child, childIndex) => renderMenuItem(child, childIndex))}
            </ul>
          </details>
        </li>
      );
    }

    if (item.href) {
      return (
        <li key={index}>
          <a
            href={item.href}
            class={`${item.active ? "active" : ""} ${item.disabled ? "disabled" : ""}`}
          >
            {item.label}
          </a>
        </li>
      );
    }

    return (
      <li key={index}>
        <span class={`${item.active ? "active" : ""} ${item.disabled ? "disabled" : ""}`}>
          {item.label}
        </span>
      </li>
    );
  };

  return (
    <ul class={menuClasses} id={id} {...props}>
      {items.map((item, index) => renderMenuItem(item, index))}
    </ul>
  );
}
