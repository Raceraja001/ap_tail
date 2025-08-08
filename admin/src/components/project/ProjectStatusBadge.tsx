import React from 'react';
import { ProjectStatus } from '../../core/project/types';

interface ProjectStatusBadgeProps {
  status: ProjectStatus;
  className?: string;
}

/**
 * Project Status Badge Component
 * 
 * Displays project status with appropriate styling and colors.
 */
export const ProjectStatusBadge: React.FC<ProjectStatusBadgeProps> = ({ 
  status, 
  className = '' 
}) => {
  const getStatusConfig = (status: ProjectStatus) => {
    const configs = {
      [ProjectStatus.PLANNING]: {
        label: 'Planning',
        className: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400',
      },
      [ProjectStatus.ACTIVE]: {
        label: 'Active',
        className: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
      },
      [ProjectStatus.ON_HOLD]: {
        label: 'On Hold',
        className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
      },
      [ProjectStatus.COMPLETED]: {
        label: 'Completed',
        className: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
      },
      [ProjectStatus.CANCELLED]: {
        label: 'Cancelled',
        className: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
      },
    };
    
    return configs[status] || configs[ProjectStatus.PLANNING];
  };

  const config = getStatusConfig(status);

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.className} ${className}`}>
      {config.label}
    </span>
  );
};
