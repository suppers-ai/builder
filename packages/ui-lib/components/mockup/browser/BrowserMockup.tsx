import { ComponentChildren } from "preact";
import { BaseComponentProps } from "../../types.ts";

export interface BrowserMockupProps extends BaseComponentProps {
  /** Child content to display in the browser */
  children: ComponentChildren;
  /** Browser title/URL */
  url?: string;
  /** Browser variant */
  variant?: "default" | "dark" | "minimal";
  /** Whether to show navigation buttons */
  showControls?: boolean;
  /** Click handler for the mockup */
  onMockupClick?: () => void;
}

export function BrowserMockup({
  children,
  url = "https://example.com",
  variant = "default",
  showControls = true,
  class: className,
  ...props
}: BrowserMockupProps) {
  // Build mockup classes
  const mockupClasses = [
    "mockup-browser",
    variant === "dark" && "bg-base-300",
    variant === "minimal" && "border-base-300",
    className,
  ].filter(Boolean).join(" ");

  return (
    <div className={mockupClasses} {...props}>
      {showControls && (
        <div className="mockup-browser-toolbar">
          <div className="input">{url}</div>
        </div>
      )}
      <div className="flex justify-center px-4 py-16 bg-base-200">
        {children}
      </div>
    </div>
  );
}
