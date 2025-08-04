import { Input } from "../input/Input.tsx";
import { InputProps } from "../input/Input.schema.ts";

// Compatibility wrapper - use Input with type="number" instead
export interface NumberInputProps extends Omit<InputProps, "type" | "value" | "onChange"> {
  value?: number;
  onChange?: (value: number) => void;
  onIncrement?: () => void;
  onDecrement?: () => void;
}

export function NumberInput(props: NumberInputProps) {
  // Extract NumberInput-specific props and pass everything else to Input
  const { onChange, onIncrement, onDecrement, ...inputProps } = props;

  // Convert the number-specific onChange to the generic event onChange
  const handleChange = onChange
    ? (event: Event) => {
      const target = event.target as HTMLInputElement;
      const numValue = parseFloat(target.value);
      if (!isNaN(numValue)) {
        onChange(numValue);
      }
    }
    : undefined;

  return <Input type="number" onChange={handleChange} {...inputProps} />;
}
