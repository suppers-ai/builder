import { BaseComponentProps, ColorProps, DisabledProps, SizeProps } from "../../types.ts";

export interface TextareaProps extends BaseComponentProps, SizeProps, ColorProps, DisabledProps {
  value?: string;
  placeholder?: string;
  rows?: number;
  bordered?: boolean;
  ghost?: boolean;
  onChange?: (event: Event) => void;
  onInput?: (event: Event) => void;
}

export function Textarea({
  class: className = "",
  size = "md",
  color,
  disabled = false,
  value,
  placeholder,
  rows = 3,
  bordered = true,
  ghost = false,
  onChange,
  onInput,
  id,
  ...props
}: TextareaProps) {
  const textareaClasses = [
    "textarea",
    size ? `textarea-${size}` : "",
    color ? `textarea-${color}` : "",
    bordered ? "textarea-bordered" : "",
    ghost ? "textarea-ghost" : "",
    "w-full",
    className,
  ].filter(Boolean).join(" ");

  return (
    <textarea
      class={textareaClasses}
      value={value}
      placeholder={placeholder}
      rows={rows}
      disabled={disabled}
      onChange={onChange}
      onInput={onInput}
      id={id}
      {...props}
    />
  );
}
