import { BaseComponentProps, ColorProps, DisabledProps, SizeProps } from "../../types.ts";

export interface FileInputProps extends BaseComponentProps, SizeProps, ColorProps, DisabledProps {
  accept?: string;
  multiple?: boolean;
  bordered?: boolean;
  ghost?: boolean;
  // Controlled mode props
  onChange?: (files: FileList | null) => void;
  onSelect?: (files: File[]) => void;
}

export function FileInput({
  class: className = "",
  size = "md",
  color,
  disabled = false,
  accept,
  multiple = false,
  bordered = true,
  ghost = false,
  onChange,
  onSelect,
  id,
  children,
  ...props
}: FileInputProps) {
  const fileInputClasses = [
    "file-input",
    bordered ? "file-input-bordered" : "",
    ghost ? "file-input-ghost" : "",
    size === "xs" ? "file-input-xs" : "",
    size === "sm" ? "file-input-sm" : "",
    size === "lg" ? "file-input-lg" : "",
    color ? `file-input-${color}` : "",
    disabled ? "file-input-disabled" : "",
    "w-full max-w-xs",
    className,
  ].filter(Boolean).join(" ");

  const handleChange = (event: Event) => {
    const target = event.target as HTMLInputElement;
    const files = target.files;

    onChange?.(files);

    if (onSelect && files) {
      const fileArray = Array.from(files);
      onSelect(fileArray);
    }
  };

  return (
    <input
      type="file"
      class={fileInputClasses}
      id={id}
      accept={accept}
      multiple={multiple}
      disabled={disabled}
      onChange={handleChange}
      {...props}
    />
  );
}
