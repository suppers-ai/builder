import { ComponentChildren } from "preact";
import { BaseComponentProps } from "../../types.ts";

export interface ArtboardProps extends BaseComponentProps {
  /** Child content to display in the artboard */
  children: ComponentChildren;
  /** Artboard size (1, 2, 3, 4, 5, 6) */
  size?: "1" | "2" | "3" | "4" | "5" | "6";
  /** Whether to use horizontal orientation */
  horizontal?: boolean;
  /** Whether to use phone mockup sizing */
  phone?: boolean;
  /** Whether to use demo styling */
  demo?: boolean;
  /** Click handler for the artboard */
  onArtboardClick?: () => void;
  className?: string;
}

export function Artboard({
  children,
  size = "1",
  horizontal = false,
  phone = false,
  demo = false,
  className,
  ...props
}: ArtboardProps) {
  // Build artboard classes
  const artboardClasses = [
    "artboard",
    phone && "phone-" + size,
    !phone && "artboard-" + size,
    horizontal && "artboard-horizontal",
    demo && "artboard-demo",
    className,
  ].filter(Boolean).join(" ");

  return (
    <div className={artboardClasses} {...props}>
      {children}
    </div>
  );
}
