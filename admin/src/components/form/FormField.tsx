import React from 'react';
import { clsx } from 'clsx';
import { UseFormReturn, FieldPath, FieldValues } from 'react-hook-form';
import Label from './Label';
import Input from './input/InputField';

/**
 * Form Field Component
 * 
 * Implements Single Responsibility Principle by handling form field rendering.
 * Provides consistent styling and error handling across all form fields.
 */

interface FormFieldProps<T extends FieldValues> {
  name: FieldPath<T>;
  label?: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  form: UseFormReturn<T>;
  size?: 'sm' | 'md' | 'lg';
  autoComplete?: string;
  autoFocus?: boolean;
  readOnly?: boolean;
  maxLength?: number;
  pattern?: string;
  min?: string;
  max?: string;
  step?: number;
  children?: React.ReactNode;
  renderInput?: (props: any) => React.ReactNode;
}

export function FormField<T extends FieldValues>({
  name,
  label,
  type = 'text',
  placeholder,
  required = false,
  disabled = false,
  className,
  form,
  size = 'md',
  autoComplete,
  autoFocus = false,
  readOnly = false,
  maxLength,
  pattern,
  min,
  max,
  step,
  children,
  renderInput,
}: FormFieldProps<T>) {
  const {
    register,
    formState: { errors },
  } = form;

  const error = errors[name];
  const errorMessage = error?.message as string;
  const hasError = !!error;

  const fieldId = `field-${name}`;
  const errorId = `${fieldId}-error`;

  const inputProps = {
    id: fieldId,
    type,
    placeholder,
    required,
    disabled,
    size,
    autoComplete,
    autoFocus,
    readOnly,
    maxLength,
    pattern,
    min,
    max,
    step,
    error: hasError,
    hint: errorMessage,
    'aria-describedby': hasError ? errorId : undefined,
    'aria-invalid': hasError,
    'aria-required': required,
    ...register(name),
  };

  return (
    <div className={clsx('space-y-2', className)}>
      {label && (
        <Label htmlFor={fieldId} required={required}>
          {label}
        </Label>
      )}
      
      <div className="relative">
        {renderInput ? (
          renderInput(inputProps)
        ) : children ? (
          React.cloneElement(children as React.ReactElement, inputProps)
        ) : (
          <Input {...inputProps} />
        )}
      </div>
    </div>
  );
}

/**
 * Textarea Field Component
 */
interface TextareaFieldProps<T extends FieldValues> extends Omit<FormFieldProps<T>, 'type' | 'renderInput'> {
  rows?: number;
  cols?: number;
  resize?: 'none' | 'both' | 'horizontal' | 'vertical';
}

export function TextareaField<T extends FieldValues>({
  name,
  label,
  placeholder,
  required = false,
  disabled = false,
  className,
  form,
  rows = 4,
  cols,
  resize = 'vertical',
  maxLength,
  readOnly = false,
}: TextareaFieldProps<T>) {
  const {
    register,
    formState: { errors },
  } = form;

  const error = errors[name];
  const errorMessage = error?.message as string;
  const hasError = !!error;

  const fieldId = `field-${name}`;
  const errorId = `${fieldId}-error`;

  const textareaClasses = clsx(
    'w-full rounded-lg border px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-3 transition-colors duration-200',
    'dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30',
    {
      // Disabled state
      'text-gray-500 border-gray-300 opacity-40 bg-gray-100 cursor-not-allowed dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700': disabled,
      
      // Error state
      'border-error-500 focus:border-error-300 focus:ring-error-500/20 dark:text-error-400 dark:border-error-500 dark:focus:border-error-800': hasError && !disabled,
      
      // Default state
      'bg-transparent text-gray-800 border-gray-300 focus:border-brand-300 focus:ring-brand-500/20 dark:border-gray-700 dark:text-white/90 dark:focus:border-brand-800': !disabled && !hasError,
      
      // Read-only state
      'bg-gray-50 dark:bg-gray-800/50': readOnly,
    },
    {
      'resize-none': resize === 'none',
      'resize': resize === 'both',
      'resize-x': resize === 'horizontal',
      'resize-y': resize === 'vertical',
    }
  );

  return (
    <div className={clsx('space-y-2', className)}>
      {label && (
        <Label htmlFor={fieldId} required={required}>
          {label}
        </Label>
      )}
      
      <div className="relative">
        <textarea
          id={fieldId}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          readOnly={readOnly}
          rows={rows}
          cols={cols}
          maxLength={maxLength}
          aria-describedby={hasError ? errorId : undefined}
          aria-invalid={hasError}
          aria-required={required}
          className={textareaClasses}
          {...register(name)}
        />
        
        {errorMessage && (
          <p
            id={errorId}
            className="mt-1.5 text-xs text-error-500 dark:text-error-400"
          >
            {errorMessage}
          </p>
        )}
      </div>
    </div>
  );
}

/**
 * Select Field Component
 */
interface SelectFieldProps<T extends FieldValues> extends Omit<FormFieldProps<T>, 'type' | 'renderInput'> {
  options: Array<{ value: string | number; label: string; disabled?: boolean }>;
  emptyOption?: string;
}

export function SelectField<T extends FieldValues>({
  name,
  label,
  required = false,
  disabled = false,
  className,
  form,
  options,
  emptyOption,
}: SelectFieldProps<T>) {
  const {
    register,
    formState: { errors },
  } = form;

  const error = errors[name];
  const errorMessage = error?.message as string;
  const hasError = !!error;

  const fieldId = `field-${name}`;
  const errorId = `${fieldId}-error`;

  const selectClasses = clsx(
    'w-full h-11 rounded-lg border px-4 py-2.5 text-sm shadow-theme-xs focus:outline-hidden focus:ring-3 transition-colors duration-200',
    'dark:bg-gray-900 dark:text-white/90',
    {
      // Disabled state
      'text-gray-500 border-gray-300 opacity-40 bg-gray-100 cursor-not-allowed dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700': disabled,
      
      // Error state
      'border-error-500 focus:border-error-300 focus:ring-error-500/20 dark:text-error-400 dark:border-error-500 dark:focus:border-error-800': hasError && !disabled,
      
      // Default state
      'bg-transparent text-gray-800 border-gray-300 focus:border-brand-300 focus:ring-brand-500/20 dark:border-gray-700 dark:text-white/90 dark:focus:border-brand-800': !disabled && !hasError,
    }
  );

  return (
    <div className={clsx('space-y-2', className)}>
      {label && (
        <Label htmlFor={fieldId} required={required}>
          {label}
        </Label>
      )}
      
      <div className="relative">
        <select
          id={fieldId}
          required={required}
          disabled={disabled}
          aria-describedby={hasError ? errorId : undefined}
          aria-invalid={hasError}
          aria-required={required}
          className={selectClasses}
          {...register(name)}
        >
          {emptyOption && (
            <option value="">
              {emptyOption}
            </option>
          )}
          {options.map((option) => (
            <option
              key={option.value}
              value={option.value}
              disabled={option.disabled}
            >
              {option.label}
            </option>
          ))}
        </select>
        
        {errorMessage && (
          <p
            id={errorId}
            className="mt-1.5 text-xs text-error-500 dark:text-error-400"
          >
            {errorMessage}
          </p>
        )}
      </div>
    </div>
  );
}
