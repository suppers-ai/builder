import { useEffect, useState } from "preact/hooks";

interface MetadataField {
  type: "text" | "number" | "boolean" | "date" | "time" | "select" | "array" | "object";
  label: string;
  required?: boolean;
  min?: number;
  max?: number;
  options?: string[];
  default?: any;
  properties?: Record<string, MetadataField>;
}

interface MetadataSchema {
  fields: Record<string, MetadataField>;
}

interface DynamicMetadataFormProps {
  schema: MetadataSchema | null;
  data: Record<string, any>;
  onChange: (data: Record<string, any>) => void;
  className?: string;
}

export default function DynamicMetadataForm({
  schema,
  data,
  onChange,
  className = "",
}: DynamicMetadataFormProps) {
  const [formData, setFormData] = useState(data);

  useEffect(() => {
    setFormData(data);
  }, [data]);

  const updateField = (fieldName: string, value: any) => {
    const newData = { ...formData, [fieldName]: value };
    setFormData(newData);
    onChange(newData);
  };

  const renderField = (fieldName: string, field: MetadataField) => {
    const value = formData[fieldName] ?? field.default ?? "";

    switch (field.type) {
      case "text":
        return (
          <input
            type="text"
            class="input input-bordered"
            placeholder={field.label}
            value={value}
            onInput={(e) => updateField(fieldName, e.currentTarget.value)}
            required={field.required}
            minLength={field.min}
            maxLength={field.max}
          />
        );

      case "number":
        return (
          <input
            type="number"
            class="input input-bordered"
            placeholder={field.label}
            value={value}
            onInput={(e) => updateField(fieldName, parseFloat(e.currentTarget.value) || 0)}
            required={field.required}
            min={field.min}
            max={field.max}
          />
        );

      case "boolean":
        return (
          <input
            type="checkbox"
            class="checkbox"
            checked={Boolean(value)}
            onChange={(e) => updateField(fieldName, e.currentTarget.checked)}
          />
        );

      case "date":
        return (
          <input
            type="date"
            class="input input-bordered"
            value={value}
            onChange={(e) => updateField(fieldName, e.currentTarget.value)}
            required={field.required}
          />
        );

      case "time":
        return (
          <input
            type="time"
            class="input input-bordered"
            value={value}
            onChange={(e) => updateField(fieldName, e.currentTarget.value)}
            required={field.required}
          />
        );

      case "select":
        return (
          <select
            class="select select-bordered"
            value={value}
            onChange={(e) => updateField(fieldName, e.currentTarget.value)}
            required={field.required}
          >
            <option value="">Select {field.label}</option>
            {field.options?.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        );

      case "array":
        const arrayValue = Array.isArray(value) ? value : [];
        return (
          <div class="space-y-2">
            {field.options?.map((option) => (
              <label key={option} class="label cursor-pointer justify-start gap-2">
                <input
                  type="checkbox"
                  class="checkbox checkbox-sm"
                  checked={arrayValue.includes(option)}
                  onChange={(e) => {
                    const newArray = e.currentTarget.checked
                      ? [...arrayValue, option]
                      : arrayValue.filter((item) =>
                        item !== option
                      );
                    updateField(fieldName, newArray);
                  }}
                />
                <span class="label-text">{option}</span>
              </label>
            ))}
          </div>
        );

      case "object":
        return (
          <div class="border p-3 rounded bg-base-100">
            <div class="text-sm font-medium mb-2">{field.label} Properties</div>
            {field.properties &&
              Object.entries(field.properties).map(([propName, propField]) => (
                <div key={propName} class="form-control mb-2">
                  <label class="label">
                    <span class="label-text text-xs">{propField.label}</span>
                  </label>
                  {renderField(`${fieldName}.${propName}`, propField)}
                </div>
              ))}
          </div>
        );

      default:
        return (
          <input
            type="text"
            class="input input-bordered"
            placeholder={field.label}
            value={value}
            onInput={(e) => updateField(fieldName, e.currentTarget.value)}
          />
        );
    }
  };

  if (!schema || !schema.fields || Object.keys(schema.fields).length === 0) {
    return (
      <div class={`text-center text-gray-500 italic py-4 ${className}`}>
        No metadata fields defined for this type
      </div>
    );
  }

  return (
    <div class={`space-y-4 ${className}`}>
      <h3 class="text-lg font-semibold mb-4">Additional Information</h3>
      {Object.entries(schema.fields).map(([fieldName, field]) => (
        <div key={fieldName} class="form-control">
          <label class="label">
            <span class="label-text">
              {field.label}
              {field.required && <span class="text-error ml-1">*</span>}
            </span>
          </label>
          {renderField(fieldName, field)}
          {field.type === "boolean" && (
            <label class="label">
              <span class="label-text-alt">{field.label}</span>
            </label>
          )}
        </div>
      ))}
    </div>
  );
}
