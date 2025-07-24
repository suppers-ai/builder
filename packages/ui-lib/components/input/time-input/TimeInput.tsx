import { Input } from "../input/Input.tsx";
import { InputProps } from "../input/Input.schema.ts";

// Compatibility wrapper - use Input with type="time" instead
export interface TimeInputProps extends Omit<InputProps, 'type'> {}

export function TimeInput(props: TimeInputProps) {
  return <Input type="time" {...props} />;
}
