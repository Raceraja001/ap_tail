import React from 'react';
import { Breadcrumb } from './Breadcrumb';

interface PageAction {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  icon?: React.ReactNode;
  disabled?: boolean;
}

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: PageAction[];
  breadcrumbItems?: Array<{ label: string; href?: string; icon?: React.ReactNode }>;
  children?: React.ReactNode;
  className?: string;
}

/**
 * Page Header Component
 * 
 * Features:
 * - Page title and description
 * - Breadcrumb navigation
 * - Action buttons
 * - Responsive design
 * - Accessibility support
 */
export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  description,
  actions = [],
  breadcrumbItems,
  children,
  className = '',
}) => {
  const getActionButtonClasses = (variant: PageAction['variant'] = 'secondary') => {
    const baseClasses = 'inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors';
    
    const variantClasses = {
      primary: 'bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500',
      secondary: 'bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:ring-blue-500',
      danger: 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500',
    };

    return `${baseClasses} ${variantClasses[variant]}`;
  };

  return (
    <div className={`bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 ${className}`}>
      <div className="px-4 sm:px-6 lg:px-8 py-6">
        {/* Breadcrumb */}
        <div className="mb-4">
          <Breadcrumb items={breadcrumbItems} />
        </div>

        {/* Header content */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl">
              {title}
            </h1>
            {description && (
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 max-w-4xl">
                {description}
              </p>
            )}
          </div>

          {/* Actions */}
          {actions.length > 0 && (
            <div className="mt-4 sm:mt-0 sm:ml-4 flex flex-col sm:flex-row gap-3">
              {actions.map((action, index) => (
                <button
                  key={index}
                  onClick={action.onClick}
                  disabled={action.disabled}
                  className={getActionButtonClasses(action.variant)}
                  aria-label={action.label}
                >
                  {action.icon && (
                    <span className="mr-2 flex-shrink-0" aria-hidden="true">
                      {action.icon}
                    </span>
                  )}
                  {action.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Additional content */}
        {children && (
          <div className="mt-6">
            {children}
          </div>
        )}
      </div>
    </div>
  );
};

export default PageHeader;
