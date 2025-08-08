import React from 'react';

/**
 * Project Progress Chart Component
 * 
 * Displays project progress over time in a chart format.
 * Placeholder implementation - can be enhanced with actual charting library.
 */
export const ProjectProgressChart: React.FC = () => {
  // Sample data for demonstration
  const progressData = [
    { month: 'Jan', completed: 12, total: 15 },
    { month: 'Feb', completed: 18, total: 22 },
    { month: 'Mar', completed: 25, total: 28 },
    { month: 'Apr', completed: 32, total: 35 },
    { month: 'May', completed: 28, total: 30 },
    { month: 'Jun', completed: 35, total: 38 },
  ];

  return (
    <div className="h-64">
      {/* Chart Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Project Completion Rate
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Monthly progress overview
          </p>
        </div>
        <div className="flex items-center space-x-4 text-xs">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
            <span className="text-gray-600 dark:text-gray-400">Completed</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-gray-300 dark:bg-gray-600 rounded-full mr-2"></div>
            <span className="text-gray-600 dark:text-gray-400">Total</span>
          </div>
        </div>
      </div>

      {/* Simple Bar Chart */}
      <div className="flex items-end justify-between h-48 space-x-2">
        {progressData.map((data, index) => {
          const completedHeight = (data.completed / data.total) * 100;
          
          return (
            <div key={index} className="flex-1 flex flex-col items-center">
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-t relative" style={{ height: '160px' }}>
                {/* Total bar */}
                <div className="absolute bottom-0 w-full bg-gray-300 dark:bg-gray-600 rounded-t" style={{ height: '100%' }}></div>
                {/* Completed bar */}
                <div 
                  className="absolute bottom-0 w-full bg-blue-500 rounded-t transition-all duration-300" 
                  style={{ height: `${completedHeight}%` }}
                ></div>
                
                {/* Value labels */}
                <div className="absolute top-2 left-1/2 transform -translate-x-1/2 text-xs font-medium text-white">
                  {data.completed}
                </div>
              </div>
              
              {/* Month label */}
              <div className="mt-2 text-xs text-gray-600 dark:text-gray-400 font-medium">
                {data.month}
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary Stats */}
      <div className="mt-4 grid grid-cols-3 gap-4 text-center">
        <div>
          <div className="text-lg font-bold text-gray-900 dark:text-white">
            {progressData.reduce((sum, data) => sum + data.completed, 0)}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            Total Completed
          </div>
        </div>
        <div>
          <div className="text-lg font-bold text-gray-900 dark:text-white">
            {Math.round((progressData.reduce((sum, data) => sum + data.completed, 0) / progressData.reduce((sum, data) => sum + data.total, 0)) * 100)}%
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            Success Rate
          </div>
        </div>
        <div>
          <div className="text-lg font-bold text-gray-900 dark:text-white">
            +{Math.round(((progressData[progressData.length - 1].completed / progressData[progressData.length - 1].total) - (progressData[0].completed / progressData[0].total)) * 100)}%
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            Growth
          </div>
        </div>
      </div>
    </div>
  );
};
