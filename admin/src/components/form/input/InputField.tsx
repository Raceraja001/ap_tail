import type React from "react";
import { forwardRef } from "react";
import { clsx } from "clsx";

interface InputProps {
  type?: "text" | "number" | "email" | "password" | "date" | "time" | "tel" | "url" | "search" | string;
  id?: string;
  name?: string;
  placeholder?: string;
  value?: string | number;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  onFocus?: (e: React.FocusEvent<HTMLInputElement>) => void;
  className?: string;
  min?: string;
  max?: string;
  step?: number;
  disabled?: boolean;
  success?: boolean;
  error?: boolean;
  hint?: string;
  required?: boolean;
  autoComplete?: string;
  autoFocus?: boolean;
  readOnly?: boolean;
  maxLength?: number;
  pattern?: string;
  'aria-describedby'?: string;
  'aria-invalid'?: boolean;
  'aria-required'?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const Input = forwardRef<HTMLInputElement, InputProps>(({
  type = "text",
  id,
  name,
  placeholder,
  value,
  onChange,
  onBlur,
  onFocus,
  className = "",
  min,
  max,
  step,
  disabled = false,
  success = false,
  error = false,
  hint,
  required = false,
  autoComplete,
  autoFocus = false,
  readOnly = false,
  maxLength,
  pattern,
  'aria-describedby': ariaDescribedBy,
  'aria-invalid': ariaInvalid,
  'aria-required': ariaRequired,
  size = 'md',
}, ref) => {
  // Size variants
  const sizeClasses = {
    sm: 'h-9 px-3 py-2 text-sm',
    md: 'h-11 px-4 py-2.5 text-sm',
    lg: 'h-12 px-4 py-3 text-base',
  };

  const inputClasses = clsx(
    // Base styles
    'w-full rounded-lg border appearance-none shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-3 transition-colors duration-200',
    'dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30',

    // Size styles
    sizeClasses[size],

    // State styles
    {
      // Disabled state
      'text-gray-500 border-gray-300 opacity-40 bg-gray-100 cursor-not-allowed dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700': disabled,

      // Error state
      'border-error-500 focus:border-error-300 focus:ring-error-500/20 dark:text-error-400 dark:border-error-500 dark:focus:border-error-800': error && !disabled,

      // Success state
      'border-success-500 focus:border-success-300 focus:ring-success-500/20 dark:text-success-400 dark:border-success-500 dark:focus:border-success-800': success && !disabled && !error,

      // Default state
      'bg-transparent text-gray-800 border-gray-300 focus:border-brand-300 focus:ring-brand-500/20 dark:border-gray-700 dark:text-white/90 dark:focus:border-brand-800': !disabled && !error && !success,

      // Read-only state
      'bg-gray-50 dark:bg-gray-800/50': readOnly,
    },

    className
  );

  return (
    <div className="relative">
      <input
        ref={ref}
        type={type}
        id={id}
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        onFocus={onFocus}
        min={min}
        max={max}
        step={step}
        disabled={disabled}
        required={required}
        autoComplete={autoComplete}
        autoFocus={autoFocus}
        readOnly={readOnly}
        maxLength={maxLength}
        pattern={pattern}
        aria-describedby={ariaDescribedBy}
        aria-invalid={ariaInvalid ?? error}
        aria-required={ariaRequired ?? required}
        className={inputClasses}
      />

      {hint && (
        <p
          id={ariaDescribedBy}
          className={clsx(
            'mt-1.5 text-xs',
            {
              'text-error-500 dark:text-error-400': error,
              'text-success-500 dark:text-success-400': success && !error,
              'text-gray-500 dark:text-gray-400': !error && !success,
            }
          )}
        >
          {hint}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
