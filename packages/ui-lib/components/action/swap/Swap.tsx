import { BaseComponentProps } from "../../types.ts";
import { ComponentChildren } from "preact";

export interface SwapProps extends BaseComponentProps {
  active?: boolean;
  rotate?: boolean;
  flip?: boolean;
  on: ComponentChildren;
  off: ComponentChildren;
  onSwap?: (active: boolean) => void;
}

export function Swap({
  class: className = "",
  active = false,
  rotate = false,
  flip = false,
  on,
  off,
  id,
  ...props
}: SwapProps) {
  const swapClasses = [
    "swap",
    rotate ? "swap-rotate" : "",
    flip ? "swap-flip" : "",
    active ? "swap-active" : "",
    className,
  ].filter(Boolean).join(" ");

  return (
    <label class={swapClasses} id={id} {...props}>
      <input type="checkbox" checked={active} />
      <div class="swap-on">{on}</div>
      <div class="swap-off">{off}</div>
    </label>
  );
}
