import { BaseComponentProps, ColorProps } from "../../types.ts";
import { ComponentChildren } from "preact";
import { Button } from "../../action/button/Button.tsx";

export interface AlertProps extends BaseComponentProps, ColorProps {
  icon?: ComponentChildren;
  dismissible?: boolean;
  actions?: ComponentChildren;
  onDismiss?: () => void;
}

export function Alert({
  children,
  class: className = "",
  color = "info",
  icon,
  dismissible = false,
  actions,
  id,
  onDismiss,
  ...props
}: AlertProps) {
  const alertClasses = [
    "alert",
    color ? `alert-${color}` : "",
    className,
  ].filter(Boolean).join(" ");

  const displayIcon = icon;

  return (
    <div class={alertClasses} id={id} {...props}>
      {displayIcon && <span>{displayIcon}</span>}
      <span>{children}</span>
      {actions && <div>{actions}</div>}
      {dismissible && (
        <Button type="button" size="sm" circle variant="ghost" onClick={onDismiss}>
          ✕
        </Button>
      )}
    </div>
  );
}
