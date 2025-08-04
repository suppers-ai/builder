import { useEffect, useState } from "preact/hooks";
import type { JSX } from "preact";
import { Input } from "../input/Input.tsx";
import { Textarea } from "../textarea/Textarea.tsx";
import { Select } from "../select/Select.tsx";

export interface FormField {
  key: string;
  label: string;
  type: "text" | "textarea" | "select" | "json";
  required?: boolean;
  placeholder?: string;
  options?: Array<{ value: string; label: string; description?: string }>;
  validation?: {
    minLength?: number;
    maxLength?: number;
    pattern?: RegExp;
    custom?: (value: any) => string | null;
  };
}

export interface EntityFormProps {
  title: string;
  fields: FormField[];
  initialData?: Record<string, any>;
  onSubmit: (data: Record<string, any>) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
  className?: string;
  submitLabel?: string;
  cancelLabel?: string;
}

export function EntityForm({
  title,
  fields,
  initialData = {},
  onSubmit,
  onCancel,
  isLoading = false,
  className = "",
  submitLabel = "Save",
  cancelLabel = "Cancel",
}: EntityFormProps) {
  const [formData, setFormData] = useState<Record<string, any>>(initialData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [jsonFields, setJsonFields] = useState<Record<string, string>>({});

  // Initialize form data and JSON fields
  useEffect(() => {
    const newFormData = { ...initialData };
    const newJsonFields: Record<string, string> = {};

    fields.forEach((field) => {
      if (field.type === "json") {
        const value = initialData[field.key];
        newJsonFields[field.key] = value ? JSON.stringify(value, null, 2) : "{}";
      }
      if (!(field.key in newFormData)) {
        newFormData[field.key] = field.type === "json" ? {} : "";
      }
    });

    setFormData(newFormData);
    setJsonFields(newJsonFields);
  }, [initialData, fields]);

  const validateField = (field: FormField, value: any): string | null => {
    if (field.required && (!value || (typeof value === "string" && !value.trim()))) {
      return `${field.label} is required`;
    }

    if (field.validation) {
      const { minLength, maxLength, pattern, custom } = field.validation;

      if (typeof value === "string") {
        if (minLength && value.length < minLength) {
          return `${field.label} must be at least ${minLength} characters`;
        }
        if (maxLength && value.length > maxLength) {
          return `${field.label} must be less than ${maxLength} characters`;
        }
        if (pattern && !pattern.test(value)) {
          return `${field.label} format is invalid`;
        }
      }

      if (custom) {
        const customError = custom(value);
        if (customError) return customError;
      }
    }

    // Special validation for JSON fields
    if (field.type === "json") {
      try {
        const jsonValue = jsonFields[field.key] || "{}";
        const parsed = JSON.parse(jsonValue);
        if (typeof parsed !== "object" || parsed === null) {
          return `${field.label} must be a valid JSON object`;
        }
      } catch {
        return `${field.label} must be valid JSON`;
      }
    }

    return null;
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    fields.forEach((field) => {
      const value = field.type === "json" ? jsonFields[field.key] : formData[field.key];
      const error = validateField(field, value);
      if (error) {
        newErrors[field.key] = error;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: FormField, value: string) => {
    if (field.type === "json") {
      setJsonFields((prev) => ({ ...prev, [field.key]: value }));
    } else {
      setFormData((prev) => ({ ...prev, [field.key]: value }));
    }

    // Clear error when user starts typing
    if (errors[field.key]) {
      setErrors((prev) => ({ ...prev, [field.key]: "" }));
    }
  };

  const handleSubmit = async (e: JSX.TargetedEvent<HTMLFormElement, Event>) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      const submitData = { ...formData };

      // Parse JSON fields
      fields.forEach((field) => {
        if (field.type === "json") {
          try {
            submitData[field.key] = JSON.parse(jsonFields[field.key] || "{}");
          } catch {
            // This should not happen due to validation, but just in case
            submitData[field.key] = {};
          }
        }
      });

      await onSubmit(submitData);
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  const renderField = (field: FormField) => {
    const value = field.type === "json" ? jsonFields[field.key] || "{}" : formData[field.key] || "";
    const hasError = !!errors[field.key];

    const baseInputClasses =
      `w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
        hasError ? "border-red-500" : "border-gray-300"
      }`;

    switch (field.type) {
      case "textarea":
        return (
          <Textarea
            value={value}
            onChange={(e) => handleInputChange(field, (e.target as HTMLTextAreaElement).value)}
            rows={3}
            bordered
            placeholder={field.placeholder}
            disabled={isLoading}
          />
        );

      case "select":
        return (
          <div>
            <Select
              value={value}
              onChange={(e) => handleInputChange(field, (e.target as HTMLSelectElement).value)}
              options={field.options || []}
              bordered
              disabled={isLoading}
            />
            {field.options?.find((opt) => opt.value === value)?.description && (
              <p class="mt-1 text-sm text-gray-500">
                {field.options.find((opt) => opt.value === value)?.description}
              </p>
            )}
          </div>
        );

      case "json":
        return (
          <div>
            <Textarea
              value={value}
              onChange={(e) => handleInputChange(field, (e.target as HTMLTextAreaElement).value)}
              rows={8}
              bordered
              class="font-mono text-sm"
              placeholder={field.placeholder || '{"key": "value"}'}
              disabled={isLoading}
            />
            <p class="mt-1 text-sm text-gray-500">
              Enter valid JSON configuration
            </p>
          </div>
        );

      default:
        return (
          <Input
            type="text"
            value={value}
            onChange={(e) => handleInputChange(field, (e.target as HTMLInputElement).value)}
            bordered
            placeholder={field.placeholder}
            disabled={isLoading}
          />
        );
    }
  };

  return (
    <div class={`bg-white rounded-lg shadow-md border border-gray-200 ${className}`}>
      <div class="p-6">
        <h2 class="text-xl font-semibold mb-6">{title}</h2>

        <form onSubmit={handleSubmit} class="space-y-6">
          {fields.map((field) => (
            <div key={field.key}>
              <label htmlFor={field.key} class="block text-sm font-medium text-gray-700 mb-2">
                {field.label} {field.required && "*"}
              </label>
              {renderField(field)}
              {errors[field.key] && <p class="mt-1 text-sm text-red-600">{errors[field.key]}</p>}
            </div>
          ))}

          {/* Actions */}
          <div class="flex items-center gap-4 pt-4 border-t border-gray-200">
            <button
              type="submit"
              disabled={isLoading}
              class="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-md font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? "Saving..." : submitLabel}
            </button>
            <button
              type="button"
              onClick={onCancel}
              disabled={isLoading}
              class="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-md font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {cancelLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EntityForm;
