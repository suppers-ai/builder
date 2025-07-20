import { useCallback, useState } from "preact/hooks";

export interface FormValidationRule<T = any> {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: T) => string | null;
  message?: string;
}

export interface FormFieldConfig<T = any> {
  initialValue: T;
  validation?: FormValidationRule<T>;
}

export interface FormConfig<T extends Record<string, any>> {
  fields: { [K in keyof T]: FormFieldConfig<T[K]> };
  onSubmit: (data: T) => Promise<void>;
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
}

/**
 * Hook for handling form state, validation, and submission
 */
export function useFormHandler<T extends Record<string, any>>(config: FormConfig<T>) {
  const { fields, onSubmit, onSuccess, onError } = config;

  // Initialize form data with field initial values
  const initialData = Object.entries(fields).reduce((acc, [key, field]) => {
    acc[key] = field.initialValue;
    return acc;
  }, {} as any) as T;

  const [formData, setFormData] = useState<T>(initialData);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const updateField = useCallback((field: keyof T, value: T[keyof T]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Clear field error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }

    // Clear submit error when user makes changes
    if (submitError) {
      setSubmitError(null);
    }
  }, [errors, submitError]);

  const validateField = useCallback((field: keyof T, value: T[keyof T]): string | null => {
    const fieldConfig = fields[field];
    if (!fieldConfig?.validation) return null;

    const { required, minLength, maxLength, pattern, custom, message } = fieldConfig.validation;

    // Required check
    if (required && (!value || (typeof value === "string" && !value.trim()))) {
      return message || `${String(field)} is required`;
    }

    // String-specific validations
    if (typeof value === "string") {
      if (minLength && value.length < minLength) {
        return message || `${String(field)} must be at least ${minLength} characters`;
      }

      if (maxLength && value.length > maxLength) {
        return message || `${String(field)} must be no more than ${maxLength} characters`;
      }

      if (pattern && !pattern.test(value)) {
        return message || `${String(field)} format is invalid`;
      }
    }

    // Custom validation
    if (custom) {
      return custom(value);
    }

    return null;
  }, [fields]);

  const validateForm = useCallback((): boolean => {
    const newErrors: Partial<Record<keyof T, string>> = {};
    let hasErrors = false;

    Object.keys(fields).forEach((field) => {
      const error = validateField(field as keyof T, formData[field as keyof T]);
      if (error) {
        newErrors[field as keyof T] = error;
        hasErrors = true;
      }
    });

    setErrors(newErrors);
    return !hasErrors;
  }, [formData, fields, validateField]);

  const handleSubmit = useCallback(async (e?: Event) => {
    e?.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(false);

    try {
      await onSubmit(formData);
      setSubmitSuccess(true);
      onSuccess?.(formData);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Submit failed";
      setSubmitError(errorMessage);
      onError?.(error as Error);
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, validateForm, onSubmit, onSuccess, onError]);

  const reset = useCallback(() => {
    setFormData(initialData);
    setErrors({});
    setSubmitError(null);
    setSubmitSuccess(false);
  }, [initialData]);

  return {
    formData,
    errors,
    isSubmitting,
    submitError,
    submitSuccess,
    updateField,
    validateField,
    validateForm,
    handleSubmit,
    reset,
  };
}
