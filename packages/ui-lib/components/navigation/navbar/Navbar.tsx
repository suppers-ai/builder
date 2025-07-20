import { BaseComponentProps } from "../../types.ts";
import { ComponentChildren } from "preact";

// Navbar interfaces
export interface NavbarProps extends BaseComponentProps {
  start?: ComponentChildren;
  center?: ComponentChildren;
  end?: ComponentChildren;
}

export function Navbar({
  class: className = "",
  start,
  center,
  end,
  children,
  id,
  ...props
}: NavbarProps) {
  const navbarClasses = [
    "navbar",
    "bg-base-100",
    className,
  ].filter(Boolean).join(" ");

  return (
    <div class={navbarClasses} id={id} {...props}>
      {start && (
        <div class="navbar-start">
          {start}
        </div>
      )}

      {center && (
        <div class="navbar-center">
          {center}
        </div>
      )}

      {end && (
        <div class="navbar-end">
          {end}
        </div>
      )}

      {!start && !center && !end && children && (
        <div class="flex-1">
          {children}
        </div>
      )}
    </div>
  );
}
