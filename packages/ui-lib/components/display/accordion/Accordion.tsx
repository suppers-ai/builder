import { ComponentChildren } from "preact";
import { BaseComponentProps } from "../../types.ts";

export interface AccordionProps extends BaseComponentProps {
  items: AccordionItemProps[];
  multiple?: boolean;
  defaultOpen?: string[];
  // Controlled mode props
  openItems?: string[];
  onToggle?: (itemId: string, isOpen: boolean) => void;
}

export interface AccordionItemProps {
  id: string;
  title: ComponentChildren;
  content: ComponentChildren;
  disabled?: boolean;
}

export function Accordion({
  class: className = "",
  items = [],
  multiple = false,
  defaultOpen = [],
  openItems,
  onToggle,
  id,
  ...props
}: AccordionProps) {
  const accordionClasses = [
    "collapse-container",
    className,
  ].filter(Boolean).join(" ");

  // Use controlled mode if openItems is provided, otherwise uncontrolled
  const isControlled = openItems !== undefined;
  const currentOpenItems = isControlled ? openItems : defaultOpen;

  const handleToggle = (itemId: string) => {
    if (!isControlled || !onToggle) return;

    const isCurrentlyOpen = currentOpenItems.includes(itemId);
    onToggle(itemId, !isCurrentlyOpen);
  };

  // Ensure items is always an array
  const safeItems = Array.isArray(items) ? items : [];

  return (
    <div class={accordionClasses} id={id} {...props}>
      {safeItems.map((item, index) => {
        const isOpen = currentOpenItems.includes(item.id);
        const collapseId = `collapse-${item.id}`;

        if (isControlled) {
          // Controlled mode - for islands
          return (
            <div
              key={item.id}
              class="collapse collapse-arrow bg-base-200 mb-2"
            >
              <input
                type="checkbox"
                class="sr-only"
                checked={isOpen}
                onChange={() => !item.disabled && handleToggle(item.id)}
                disabled={item.disabled}
              />
              <div
                class={`collapse-title text-xl font-medium ${
                  item.disabled ? "opacity-50 cursor-not-allowed" : ""
                }`}
                onClick={() => !item.disabled && handleToggle(item.id)}
                onKeyDown={(e) => {
                  if ((e.key === "Enter" || e.key === " ") && !item.disabled) {
                    e.preventDefault();
                    handleToggle(item.id);
                  }
                }}
                tabIndex={item.disabled ? -1 : 0}
                role="button"
                aria-expanded={isOpen}
                aria-disabled={item.disabled}
              >
                {item.title}
              </div>
              <div class="collapse-content">
                <div>{item.content}</div>
              </div>
            </div>
          );
        } else {
          // Uncontrolled mode - for static display
          return (
            <div
              key={item.id}
              class="collapse collapse-arrow bg-base-200 mb-2"
            >
              <input
                type={multiple ? "checkbox" : "radio"}
                name={multiple ? undefined : "accordion"}
                id={collapseId}
                defaultChecked={isOpen}
                disabled={item.disabled}
              />
              <div
                class={`collapse-title text-xl font-medium ${
                  item.disabled ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                <label
                  for={collapseId}
                  class="cursor-pointer"
                >
                  {item.title}
                </label>
              </div>
              <div class="collapse-content">
                <div>{item.content}</div>
              </div>
            </div>
          );
        }
      })}
    </div>
  );
}
