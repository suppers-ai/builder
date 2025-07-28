import { BaseComponentProps } from "../../types.ts";

export interface DiffProps extends BaseComponentProps {
  item1Content?: string;
  item2Content?: string;
  item1Label?: string;
  item2Label?: string;
  item1Class?: string;
  item2Class?: string;
}

export function Diff({
  class: className = "",
  item1Content = "BEFORE",
  item2Content = "AFTER", 
  item1Label,
  item2Label,
  item1Class = "bg-primary text-primary-content font-bold text-xl flex items-center justify-center",
  item2Class = "bg-secondary text-secondary-content font-bold text-xl flex items-center justify-center",
  id,
  ...props
}: DiffProps) {
  const diffClasses = [
    "diff",
    "aspect-[16/9]",
    className,
  ].filter(Boolean).join(" ");

  return (
    <div class={diffClasses} id={id} {...props}>
      <div class="diff-item-1">
        <div class={`diff-resizer ${item1Class}`}>
          {item1Label && <div class="text-sm opacity-75 mb-2">{item1Label}</div>}
          {item1Content}
        </div>
      </div>
      <div class="diff-item-2">
        <div class={`diff-resizer ${item2Class}`}>
          {item2Label && <div class="text-sm opacity-75 mb-2">{item2Label}</div>}
          {item2Content}
        </div>
      </div>
    </div>
  );
}

// Keep the individual components for advanced usage
export interface DiffItemProps extends BaseComponentProps {
  children: any;
  item: 1 | 2;
}

export function DiffItem({
  class: className = "",
  children,
  item,
  id,
  ...props
}: DiffItemProps) {
  const itemClasses = [
    `diff-item-${item}`,
    className,
  ].filter(Boolean).join(" ");

  return (
    <div class={itemClasses} id={id} {...props}>
      {children}
    </div>
  );
}

export interface DiffResizerProps extends BaseComponentProps {
  children: any;
}

export function DiffResizer({
  class: className = "",
  children,
  id,
  ...props
}: DiffResizerProps) {
  const resizerClasses = [
    "diff-resizer",
    className,
  ].filter(Boolean).join(" ");

  return (
    <div class={resizerClasses} id={id} {...props}>
      {children}
    </div>
  );
}
