import React from 'react';

/**
 * Global Loading Spinner Component
 * 
 * Implements Single Responsibility Principle by focusing only on loading display.
 * Used for Suspense fallbacks and initial app loading.
 */
export const GlobalLoadingSpinner: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900">
      <div className="flex flex-col items-center space-y-4">
        {/* Spinner */}
        <div className="relative">
          <div className="w-12 h-12 border-4 border-gray-200 dark:border-gray-700 rounded-full animate-spin">
            <div className="absolute top-0 left-0 w-12 h-12 border-4 border-transparent border-t-blue-600 rounded-full animate-spin"></div>
          </div>
        </div>
        
        {/* Loading text */}
        <div className="text-center">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white">
            Loading...
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Please wait while we prepare your dashboard
          </p>
        </div>
      </div>
    </div>
  );
};
