import { Input } from "../input/Input.tsx";
import { InputProps } from "../input/Input.schema.ts";

// Compatibility wrapper - use Input with type="email" instead
export interface EmailInputProps extends Omit<InputProps, "type"> {
  onValidationChange?: (isValid: boolean) => void;
}

export function EmailInput(props: EmailInputProps) {
  // Extract EmailInput-specific props and pass everything else to Input
  const { onValidationChange, ...inputProps } = props;

  return <Input type="email" {...inputProps} />;
}
