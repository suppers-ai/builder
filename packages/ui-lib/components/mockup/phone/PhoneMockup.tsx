import { BaseComponentProps } from "../../types.ts";
import { ComponentChildren } from "preact";

// Phone Mockup interfaces
export interface PhoneMockupProps extends BaseComponentProps {
  /** Child content to display in the phone */
  children: ComponentChildren;
  /** Phone variant/model */
  _variant?: "iphone" | "android" | "classic";
  /** Phone orientation */
  orientation?: "portrait" | "landscape";
  /** Phone color */
  color?: "black" | "white" | "silver" | "gold";
  /** Click handler for the mockup */
  onMockupClick?: () => void;
}

export function PhoneMockup({
  children,
  _variant = "iphone",
  orientation = "portrait",
  color = "black",
  class: className,
  ...props
}: PhoneMockupProps) {
  // Build mockup classes
  const mockupClasses = [
    "mockup-phone",
    orientation === "landscape" && "mockup-phone-landscape",
    color === "white" && "border-white",
    color === "silver" && "border-gray-300",
    color === "gold" && "border-yellow-400",
    className,
  ].filter(Boolean).join(" ");

  return (
    <div className={mockupClasses} {...props}>
      <div className="camera"></div>
      <div className="display">
        <div className="artboard artboard-demo phone-1">
          {children}
        </div>
      </div>
    </div>
  );
}
