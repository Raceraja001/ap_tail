import { useForm as useReactHookForm, UseFormProps, UseFormReturn } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';

/**
 * Enhanced Form Hook
 * 
 * Implements Single Responsibility Principle by focusing on form state management.
 * Provides additional features like auto-save, persistence, and enhanced error handling.
 */

export interface UseFormOptions<T extends Record<string, any>> extends UseFormProps<T> {
  schema?: z.ZodSchema<T>;
  onSubmit?: (data: T) => Promise<void> | void;
  onError?: (error: any) => void;
  autoSave?: boolean;
  autoSaveDelay?: number;
  persistKey?: string;
  resetOnSubmitSuccess?: boolean;
  showSuccessToast?: boolean;
  showErrorToast?: boolean;
  successMessage?: string;
}

export interface EnhancedFormReturn<T extends Record<string, any>> extends UseFormReturn<T> {
  isSubmitting: boolean;
  submitError: string | null;
  onSubmit: (e?: React.BaseSyntheticEvent) => Promise<void>;
  clearSubmitError: () => void;
  resetForm: () => void;
  saveToStorage: () => void;
  loadFromStorage: () => void;
  clearStorage: () => void;
}

export function useForm<T extends Record<string, any>>(
  options: UseFormOptions<T> = {}
): EnhancedFormReturn<T> {
  const {
    schema,
    onSubmit,
    onError,
    autoSave = false,
    autoSaveDelay = 1000,
    persistKey,
    resetOnSubmitSuccess = false,
    showSuccessToast = true,
    showErrorToast = true,
    successMessage = 'Form submitted successfully',
    ...formOptions
  } = options;

  // Set up resolver if schema is provided
  const resolverOptions = schema ? { resolver: zodResolver(schema) } : {};

  const form = useReactHookForm<T>({
    ...formOptions,
    ...resolverOptions,
  });

  const {
    handleSubmit,
    reset,
    watch,
    formState: { isSubmitting, errors },
    setError,
    clearErrors,
  } = form;

  // Enhanced state
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Watch all form values for auto-save
  const watchedValues = watch();

  // Auto-save functionality
  useEffect(() => {
    if (!autoSave || !persistKey) return;

    const timeoutId = setTimeout(() => {
      saveToStorage();
    }, autoSaveDelay);

    return () => clearTimeout(timeoutId);
  }, [watchedValues, autoSave, autoSaveDelay, persistKey]);

  // Load persisted data on mount
  useEffect(() => {
    if (persistKey) {
      loadFromStorage();
    }
  }, [persistKey]);

  const saveToStorage = useCallback(() => {
    if (!persistKey) return;
    
    try {
      const data = form.getValues();
      localStorage.setItem(`form_${persistKey}`, JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save form data to storage:', error);
    }
  }, [persistKey, form]);

  const loadFromStorage = useCallback(() => {
    if (!persistKey) return;
    
    try {
      const saved = localStorage.getItem(`form_${persistKey}`);
      if (saved) {
        const data = JSON.parse(saved);
        reset(data);
      }
    } catch (error) {
      console.error('Failed to load form data from storage:', error);
    }
  }, [persistKey, reset]);

  const clearStorage = useCallback(() => {
    if (!persistKey) return;
    
    try {
      localStorage.removeItem(`form_${persistKey}`);
    } catch (error) {
      console.error('Failed to clear form data from storage:', error);
    }
  }, [persistKey]);

  const clearSubmitError = useCallback(() => {
    setSubmitError(null);
    clearErrors();
  }, [clearErrors]);

  const resetForm = useCallback(() => {
    reset();
    setSubmitError(null);
    clearErrors();
    if (persistKey) {
      clearStorage();
    }
  }, [reset, clearErrors, persistKey, clearStorage]);

  const enhancedOnSubmit = useCallback(
    async (data: T) => {
      try {
        setSubmitError(null);
        clearErrors();

        if (onSubmit) {
          await onSubmit(data);
        }

        if (showSuccessToast) {
          toast.success(successMessage);
        }

        if (resetOnSubmitSuccess) {
          resetForm();
        } else if (persistKey) {
          // Clear storage on successful submit if not resetting
          clearStorage();
        }
      } catch (error: any) {
        console.error('Form submission error:', error);
        
        const errorMessage = error.message || 'An error occurred while submitting the form';
        setSubmitError(errorMessage);

        if (showErrorToast) {
          toast.error(errorMessage);
        }

        // Handle field-specific errors
        if (error.fieldErrors) {
          Object.entries(error.fieldErrors).forEach(([field, message]) => {
            setError(field as any, { message: message as string });
          });
        }

        if (onError) {
          onError(error);
        }
      }
    },
    [
      onSubmit,
      onError,
      showSuccessToast,
      showErrorToast,
      successMessage,
      resetOnSubmitSuccess,
      persistKey,
      clearErrors,
      setError,
      resetForm,
      clearStorage,
    ]
  );

  const wrappedHandleSubmit = useCallback(
    (e?: React.BaseSyntheticEvent) => {
      return handleSubmit(enhancedOnSubmit)(e);
    },
    [handleSubmit, enhancedOnSubmit]
  );

  return {
    ...form,
    isSubmitting,
    submitError,
    onSubmit: wrappedHandleSubmit,
    clearSubmitError,
    resetForm,
    saveToStorage,
    loadFromStorage,
    clearStorage,
  };
}

/**
 * Form Field Error Helper
 */
export const getFieldError = (
  errors: Record<string, any>,
  fieldName: string
): string | undefined => {
  const error = errors[fieldName];
  return error?.message;
};

/**
 * Form Validation Helper
 */
export const validateField = <T>(
  schema: z.ZodSchema<T>,
  fieldName: keyof T,
  value: any
): string | undefined => {
  try {
    const fieldSchema = schema.shape[fieldName as string];
    if (fieldSchema) {
      fieldSchema.parse(value);
    }
    return undefined;
  } catch (error) {
    if (error instanceof z.ZodError) {
      return error.errors[0]?.message;
    }
    return 'Invalid value';
  }
};

// Import useState
import { useState } from 'react';
