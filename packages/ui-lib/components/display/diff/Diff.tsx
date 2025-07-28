import { BaseComponentProps } from "../../types.ts";
import { ComponentChildren } from "preact";

export interface DiffProps extends BaseComponentProps {
  children: ComponentChildren;
}

export function Diff({
  class: className = "",
  children,
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
      {children}
    </div>
  );
}

export interface DiffItemProps extends BaseComponentProps {
  children: ComponentChildren;
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
  children: ComponentChildren;
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
