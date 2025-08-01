import { BaseComponentProps } from "../../types.ts";
import { ComponentChildren } from "preact";

// Window Mockup interfaces
export interface WindowMockupProps extends BaseComponentProps {
  /** Child content to display in the window */
  children: ComponentChildren;
  /** Window title */
  title?: string;
  /** Window variant */
  variant?: "default" | "bordered" | "shadow";
  /** Whether to show window controls */
  showControls?: boolean;
  /** Click handler for the mockup */
  onMockupClick?: () => void;
}

export function WindowMockup({
  children,
  title = "Window",
  variant = "default",
  showControls = true,
  class: className,
  ...props
}: WindowMockupProps) {
  // Build mockup classes
  const mockupClasses = [
    "mockup-window",
    variant === "bordered" && "border",
    variant === "shadow" && "shadow-2xl",
    "bg-base-300",
    className,
  ].filter(Boolean).join(" ");

  return (
    <div className={mockupClasses} {...props}>
      {showControls && (
        <div className="flex justify-between items-center px-4 py-2 bg-base-200 border-b">
          <div className="flex space-x-2">
            <div className="w-3 h-3 bg-error rounded-full"></div>
            <div className="w-3 h-3 bg-warning rounded-full"></div>
            <div className="w-3 h-3 bg-success rounded-full"></div>
          </div>
          <div className="text-sm font-medium">{title}</div>
          <div className="w-12"></div>
        </div>
      )}
      <div className="flex justify-center px-4 py-16 bg-base-200">
        {children}
      </div>
    </div>
  );
}
