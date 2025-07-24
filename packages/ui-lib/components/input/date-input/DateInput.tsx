import { Input } from "../input/Input.tsx";
import { InputProps } from "../input/Input.schema.ts";

// Compatibility wrapper - use Input with type="date" instead
export interface DateInputProps extends Omit<InputProps, 'type'> {}

export function DateInput(props: DateInputProps) {
  return <Input type="date" {...props} />;
}
