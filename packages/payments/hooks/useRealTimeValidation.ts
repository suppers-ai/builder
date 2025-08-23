import { useCallback, useEffect, useState } from "preact/hooks";
import { type MetadataSchema, validateMetadata } from "../../api/supabase/functions/api/lib/metadata-validation.ts";

export interface ValidationState {
  isValidating: boolean;
  isValid: boolean;
  errors: Record<string, string[]>;
  warnings: Record<string, string[]>;
  fieldStatus: Record<string, "valid" | "invalid" | "warning" | "pending">;
  lastValidated: number;
}

export interface UseRealTimeValidationOptions {
  debounceMs?: number;
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
  showWarnings?: boolean;
}

export function useRealTimeValidation(
  schema: MetadataSchema | null,
  initialData: Record<string, any> = {},
  options: UseRealTimeValidationOptions = {},
) {
  const {
    debounceMs = 300,
    validateOnChange = true,
    validateOnBlur = true,
    showWarnings = true,
  } = options;

  const [data, setData] = useState<Record<string, any>>(initialData);
  const [validationState, setValidationState] = useState<ValidationState>({
    isValidating: false,
    isValid: true,
    errors: {},
    warnings: {},
    fieldStatus: {},
    lastValidated: 0,
  });

  const [debounceTimeout, setDebounceTimeout] = useState<number | null>(null);

  // Validation function
  const validateData = useCallback(async (dataToValidate: Record<string, any>) => {
    if (!schema) return;

    setValidationState((prev) => ({ ...prev, isValidating: true }));

    try {
      const result = validateMetadata(dataToValidate, schema);

      // Process errors by field
      const errorsByField: Record<string, string[]> = {};
      const warningsByField: Record<string, string[]> = {};
      const fieldStatus: Record<string, "valid" | "invalid" | "warning" | "pending"> = {};

      // Group validation errors by field
      result.errors.forEach((error) => {
        const fieldMatch = error.match(/Field '([^']+)'/);
        const fieldName = fieldMatch ? fieldMatch[1] : "_general";

        if (!errorsByField[fieldName]) {
          errorsByField[fieldName] = [];
        }
        errorsByField[fieldName].push(error);
      });

      // Determine field status
      Object.keys(schema.fields).forEach((fieldName) => {
        if (errorsByField[fieldName]) {
          fieldStatus[fieldName] = "invalid";
        } else if (warningsByField[fieldName]) {
          fieldStatus[fieldName] = "warning";
        } else if (dataToValidate[fieldName] !== undefined) {
          fieldStatus[fieldName] = "valid";
        }
      });

      // Generate warnings for optional improvements
      if (showWarnings) {
        Object.entries(schema.fields).forEach(([fieldName, fieldConfig]) => {
          const value = dataToValidate[fieldName];

          // Warning for empty optional fields that could improve discoverability
          if (!fieldConfig.required && !value && fieldConfig.type === "text") {
            if (!warningsByField[fieldName]) warningsByField[fieldName] = [];
            warningsByField[fieldName].push(
              `Consider adding ${fieldConfig.label} to improve discoverability`,
            );
            if (!fieldStatus[fieldName]) fieldStatus[fieldName] = "warning";
          }

          // Warning for short descriptions
          if (
            fieldName === "description" && value && typeof value === "string" && value.length < 50
          ) {
            if (!warningsByField[fieldName]) warningsByField[fieldName] = [];
            warningsByField[fieldName].push("Consider adding more detail to the description");
            if (!fieldStatus[fieldName] || fieldStatus[fieldName] === "valid") {
              fieldStatus[fieldName] = "warning";
            }
          }

          // Warning for arrays with only one item
          if (fieldConfig.type === "array" && Array.isArray(value) && value.length === 1) {
            if (!warningsByField[fieldName]) warningsByField[fieldName] = [];
            warningsByField[fieldName].push(
              "Consider adding more options for better categorization",
            );
            if (!fieldStatus[fieldName] || fieldStatus[fieldName] === "valid") {
              fieldStatus[fieldName] = "warning";
            }
          }
        });
      }

      setValidationState({
        isValidating: false,
        isValid: result.isValid,
        errors: errorsByField,
        warnings: warningsByField,
        fieldStatus,
        lastValidated: Date.now(),
      });
    } catch (error) {
      console.error("Validation error:", error);
      setValidationState((prev) => ({
        ...prev,
        isValidating: false,
        errors: { _general: ["Validation failed due to an internal error"] },
      }));
    }
  }, [schema, showWarnings]);

  // Debounced validation
  const debouncedValidate = useCallback((dataToValidate: Record<string, any>) => {
    if (debounceTimeout) {
      clearTimeout(debounceTimeout);
    }

    const timeout = setTimeout(() => {
      validateData(dataToValidate);
    }, debounceMs);

    setDebounceTimeout(timeout);
  }, [validateData, debounceMs, debounceTimeout]);

  // Update field value with optional validation
  const updateField = useCallback((fieldName: string, value: any, validate = validateOnChange) => {
    const newData = { ...data, [fieldName]: value };
    setData(newData);

    if (validate && schema) {
      debouncedValidate(newData);
    }
  }, [data, validateOnChange, schema, debouncedValidate]);

  // Validate field on blur
  const validateField = useCallback((fieldName: string) => {
    if (validateOnBlur && schema) {
      validateData(data);
    }
  }, [data, validateOnBlur, schema, validateData]);

  // Validate all data immediately
  const validateNow = useCallback(() => {
    if (schema) {
      validateData(data);
    }
  }, [data, schema, validateData]);

  // Reset validation state
  const resetValidation = useCallback(() => {
    setValidationState({
      isValidating: false,
      isValid: true,
      errors: {},
      warnings: {},
      fieldStatus: {},
      lastValidated: 0,
    });
  }, []);

  // Clear validation for specific field
  const clearFieldValidation = useCallback((fieldName: string) => {
    setValidationState((prev) => {
      const newErrors = { ...prev.errors };
      const newWarnings = { ...prev.warnings };
      const newFieldStatus = { ...prev.fieldStatus };

      delete newErrors[fieldName];
      delete newWarnings[fieldName];
      delete newFieldStatus[fieldName];

      return {
        ...prev,
        errors: newErrors,
        warnings: newWarnings,
        fieldStatus: newFieldStatus,
      };
    });
  }, []);

  // Auto-validate when schema changes
  useEffect(() => {
    if (schema && Object.keys(data).length > 0) {
      debouncedValidate(data);
    }
  }, [schema, debouncedValidate]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (debounceTimeout) {
        clearTimeout(debounceTimeout);
      }
    };
  }, [debounceTimeout]);

  // Helper functions for UI
  const getFieldError = useCallback((fieldName: string): string | null => {
    const errors = validationState.errors[fieldName];
    return errors && errors.length > 0 ? errors[0] : null;
  }, [validationState.errors]);

  const getFieldWarning = useCallback((fieldName: string): string | null => {
    const warnings = validationState.warnings[fieldName];
    return warnings && warnings.length > 0 ? warnings[0] : null;
  }, [validationState.warnings]);

  const getFieldStatus = useCallback(
    (fieldName: string): "valid" | "invalid" | "warning" | "pending" | null => {
      return validationState.fieldStatus[fieldName] || null;
    },
    [validationState.fieldStatus],
  );

  const hasErrors = useCallback((fieldName?: string): boolean => {
    if (fieldName) {
      return validationState.errors[fieldName]?.length > 0;
    }
    return Object.keys(validationState.errors).length > 0;
  }, [validationState.errors]);

  const hasWarnings = useCallback((fieldName?: string): boolean => {
    if (fieldName) {
      return validationState.warnings[fieldName]?.length > 0;
    }
    return Object.keys(validationState.warnings).length > 0;
  }, [validationState.warnings]);

  // Get validation summary
  const getValidationSummary = useCallback(() => {
    const totalFields = Object.keys(schema?.fields || {}).length;
    const validFields = Object.values(validationState.fieldStatus).filter((status) =>
      status === "valid"
    ).length;
    const invalidFields =
      Object.values(validationState.fieldStatus).filter((status) => status === "invalid").length;
    const warningFields =
      Object.values(validationState.fieldStatus).filter((status) => status === "warning").length;

    return {
      totalFields,
      validFields,
      invalidFields,
      warningFields,
      completeness: totalFields > 0 ? Math.round((validFields / totalFields) * 100) : 0,
    };
  }, [schema, validationState.fieldStatus]);

  return {
    // Data management
    data,
    setData,
    updateField,

    // Validation state
    validationState,
    isValidating: validationState.isValidating,
    isValid: validationState.isValid,

    // Validation actions
    validateNow,
    validateField,
    resetValidation,
    clearFieldValidation,

    // Helper functions
    getFieldError,
    getFieldWarning,
    getFieldStatus,
    hasErrors,
    hasWarnings,
    getValidationSummary,
  };
}
