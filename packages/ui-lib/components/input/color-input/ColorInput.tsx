import { Input } from "../input/Input.tsx";
import { InputProps } from "../input/Input.schema.ts";

// Compatibility wrapper - use Input with type="color" instead
export interface ColorInputProps extends Omit<InputProps, "type"> {
  showPreview?: boolean;
}

export function ColorInput(props: ColorInputProps) {
  // Extract ColorInput-specific props and pass everything else to Input
  const { showPreview = true, showColorPreview, ...inputProps } = props;

  return <Input type="color" showColorPreview={showPreview} {...inputProps} />;
}
