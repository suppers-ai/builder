import { ComponentChildren } from "preact";
import { BaseComponentProps } from "../../types.ts";

export interface JoinProps extends BaseComponentProps {
  /** Child elements to group together */
  children: ComponentChildren;
  /** Whether to display items vertically */
  vertical?: boolean;
  /** Whether to be responsive (vertical on mobile, horizontal on desktop) */
  responsive?: boolean;
  // Join doesn't need additional interactive props
  className?: string;
}

export function Join({
  children,
  vertical = false,
  responsive = true,
  className,
  ...props
}: JoinProps) {
  // Build join classes
  const joinClasses = [
    "join",
    vertical && "join-vertical",
    responsive && "join-vertical lg:join-horizontal",
    className,
  ].filter(Boolean).join(" ");

  // Process children to add join-item class
  const processedChildren = Array.isArray(children)
    ? children.map((child, index) => {
      if (child && typeof child === "object" && "props" in child) {
        // Add join-item class to child elements
        return {
          ...child,
          props: {
            ...child.props,
            className: `${child.props.className || ""} join-item`.trim(),
          },
        };
      }
      return child;
    })
    : children;

  return (
    <div className={joinClasses} {...props}>
      {processedChildren}
    </div>
  );
}
