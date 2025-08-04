import { Input } from "../input/Input.tsx";
import { InputProps } from "../input/Input.schema.ts";

// Compatibility wrapper - use Input with type="password" instead
export interface PasswordInputProps extends Omit<InputProps, "type"> {
  showToggle?: boolean;
  onVisibilityToggle?: (visible: boolean) => void;
}

export function PasswordInput(props: PasswordInputProps) {
  // Extract PasswordInput-specific props and pass everything else to Input
  const { showToggle = true, onVisibilityToggle, showPasswordToggle, ...inputProps } = props;

  return <Input type="password" showPasswordToggle={showToggle} {...inputProps} />;
}
