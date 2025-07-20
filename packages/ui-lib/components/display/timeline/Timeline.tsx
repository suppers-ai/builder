import { BaseComponentProps, SizeProps } from "../../types.ts";
import { ComponentChildren } from "preact";

export interface TimelineItem {
  id?: string;
  title?: string;
  subtitle?: string;
  content?: ComponentChildren;
  startContent?: ComponentChildren;
  icon?: ComponentChildren;
  iconColor?: string;
  badge?: string;
  badgeColor?: string;
  timestamp?: string;
}

export interface TimelineProps extends BaseComponentProps, SizeProps {
  items: TimelineItem[];
  variant?: "vertical" | "horizontal";
  showConnectors?: boolean;
  // Controlled mode props
  onItemClick?: (item: TimelineItem, index: number) => void;
}

export function Timeline({
  class: className = "",
  items,
  variant = "vertical",
  size = "md",
  showConnectors = true,
  onItemClick,
  id,
  ...props
}: TimelineProps) {
  const sizeClasses = {
    xs: "timeline-xs",
    sm: "timeline-sm",
    md: "timeline-md",
    lg: "timeline-lg",
    xl: "timeline-xl",
  };

  const timelineClasses = [
    "timeline",
    variant === "horizontal" ? "timeline-horizontal" : "timeline-vertical",
    sizeClasses[size],
    className,
  ].filter(Boolean).join(" ");

  const handleItemClick = (item: TimelineItem, index: number) => {
    onItemClick?.(item, index);
  };

  return (
    <ul class={timelineClasses} id={id} {...props}>
      {items.map((item, index) => (
        <li key={item.id || index}>
          {index > 0 && showConnectors && <hr />}

          <div class="timeline-start">
            {item.startContent && (
              <div class="text-sm opacity-70">
                {item.startContent}
              </div>
            )}
          </div>

          <div class="timeline-middle">
            <div
              class={`timeline-icon ${item.iconColor || ""} ${
                onItemClick ? "cursor-pointer hover:scale-110 transition-transform" : ""
              }`}
              onClick={() => handleItemClick(item, index)}
            >
              {item.icon || (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  class="w-5 h-5"
                >
                  <path
                    fill-rule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.236 4.53L8.001 10.75a.75.75 0 00-1.06 1.061l1.666 1.667a.75.75 0 001.137-.089l3.857-5.398z"
                    clip-rule="evenodd"
                  />
                </svg>
              )}
            </div>
          </div>

          <div class="timeline-end">
            <div
              class={`timeline-box ${
                onItemClick ? "cursor-pointer hover:shadow-lg transition-shadow" : ""
              }`}
              onClick={() => handleItemClick(item, index)}
            >
              {item.title && <div class="font-semibold">{item.title}</div>}
              {item.subtitle && <div class="text-sm opacity-70 mb-2">{item.subtitle}</div>}
              {item.content && <div>{item.content}</div>}
              {item.badge && (
                <div class="mt-2">
                  <span class={`badge ${item.badgeColor || "badge-primary"}`}>
                    {item.badge}
                  </span>
                </div>
              )}
            </div>
          </div>

          {index < items.length - 1 && showConnectors && <hr />}
        </li>
      ))}
    </ul>
  );
}
