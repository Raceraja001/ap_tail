import React from 'react';

/**
 * Team Workload Chart Component
 * 
 * Displays team member workload distribution.
 * Placeholder implementation - can be enhanced with actual charting library.
 */
export const TeamWorkloadChart: React.FC = () => {
  // Sample data for demonstration
  const teamData = [
    { name: 'Alice Johnson', workload: 85, capacity: 100, role: 'Frontend Dev' },
    { name: 'Bob Smith', workload: 92, capacity: 100, role: 'Backend Dev' },
    { name: 'Carol Davis', workload: 78, capacity: 100, role: 'Designer' },
    { name: 'David Wilson', workload: 95, capacity: 100, role: 'DevOps' },
    { name: 'Eva Brown', workload: 68, capacity: 100, role: 'QA Engineer' },
  ];

  const getWorkloadColor = (workload: number) => {
    if (workload >= 90) return 'bg-red-500';
    if (workload >= 75) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getWorkloadStatus = (workload: number) => {
    if (workload >= 90) return 'Overloaded';
    if (workload >= 75) return 'Busy';
    return 'Available';
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Team Workload Distribution
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Current capacity utilization
          </p>
        </div>
        <div className="flex items-center space-x-4 text-xs">
          <div className="flex items-center">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
            <span className="text-gray-600 dark:text-gray-400">Available</span>
          </div>
          <div className="flex items-center">
            <div className="w-2 h-2 bg-yellow-500 rounded-full mr-1"></div>
            <span className="text-gray-600 dark:text-gray-400">Busy</span>
          </div>
          <div className="flex items-center">
            <div className="w-2 h-2 bg-red-500 rounded-full mr-1"></div>
            <span className="text-gray-600 dark:text-gray-400">Overloaded</span>
          </div>
        </div>
      </div>

      {/* Team Member Workload Bars */}
      <div className="space-y-3">
        {teamData.map((member, index) => (
          <div key={index} className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
                  <span className="text-xs font-medium text-gray-600 dark:text-gray-300">
                    {member.name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    {member.name}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {member.role}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                  member.workload >= 90 
                    ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                    : member.workload >= 75
                    ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                    : 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                }`}>
                  {getWorkloadStatus(member.workload)}
                </span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {member.workload}%
                </span>
              </div>
            </div>
            
            {/* Progress Bar */}
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-300 ${getWorkloadColor(member.workload)}`}
                style={{ width: `${member.workload}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="mt-6 grid grid-cols-3 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="text-center">
          <div className="text-lg font-bold text-gray-900 dark:text-white">
            {Math.round(teamData.reduce((sum, member) => sum + member.workload, 0) / teamData.length)}%
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            Avg Utilization
          </div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-gray-900 dark:text-white">
            {teamData.filter(member => member.workload >= 90).length}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            Overloaded
          </div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-gray-900 dark:text-white">
            {teamData.filter(member => member.workload < 75).length}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            Available
          </div>
        </div>
      </div>
    </div>
  );
};
