import React from 'react';
import { ProjectStatus } from '../../core/project/types';

/**
 * Project Status Distribution Component
 * 
 * Displays project status distribution in a donut chart format.
 * Placeholder implementation - can be enhanced with actual charting library.
 */
export const ProjectStatusDistribution: React.FC = () => {
  // Sample data for demonstration
  const statusData = [
    { status: ProjectStatus.ACTIVE, count: 12, color: 'text-green-500', bgColor: 'bg-green-500' },
    { status: ProjectStatus.PLANNING, count: 5, color: 'text-gray-500', bgColor: 'bg-gray-500' },
    { status: ProjectStatus.COMPLETED, count: 18, color: 'text-blue-500', bgColor: 'bg-blue-500' },
    { status: ProjectStatus.ON_HOLD, count: 3, color: 'text-yellow-500', bgColor: 'bg-yellow-500' },
    { status: ProjectStatus.CANCELLED, count: 2, color: 'text-red-500', bgColor: 'bg-red-500' },
  ];

  const total = statusData.reduce((sum, item) => sum + item.count, 0);

  const getStatusLabel = (status: ProjectStatus) => {
    const labels = {
      [ProjectStatus.ACTIVE]: 'Active',
      [ProjectStatus.PLANNING]: 'Planning',
      [ProjectStatus.COMPLETED]: 'Completed',
      [ProjectStatus.ON_HOLD]: 'On Hold',
      [ProjectStatus.CANCELLED]: 'Cancelled',
    };
    return labels[status];
  };

  return (
    <div className="flex items-center space-x-8">
      {/* Donut Chart Placeholder */}
      <div className="relative w-32 h-32">
        <div className="w-32 h-32 rounded-full border-8 border-gray-200 dark:border-gray-700 relative overflow-hidden">
          {/* This would be replaced with an actual donut chart */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {total}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Total
              </div>
            </div>
          </div>
          
          {/* Simple visual representation */}
          <div className="absolute inset-2 rounded-full bg-gradient-to-r from-green-500 via-blue-500 to-gray-500 opacity-20"></div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex-1 space-y-3">
        {statusData.map((item, index) => {
          const percentage = Math.round((item.count / total) * 100);
          
          return (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`w-3 h-3 rounded-full ${item.bgColor}`}></div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {getStatusLabel(item.status)}
                </span>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <div className="text-sm font-bold text-gray-900 dark:text-white">
                    {item.count}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {percentage}%
                  </div>
                </div>
                
                {/* Mini progress bar */}
                <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${item.bgColor} transition-all duration-300`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
