import React from 'react';
import { formatDistanceToNow } from 'date-fns';

interface Deadline {
  projectId: string;
  projectName: string;
  dueDate: string;
  daysRemaining: number;
}

interface UpcomingDeadlinesProps {
  deadlines: Deadline[];
}

/**
 * Upcoming Deadlines Component
 * 
 * Displays upcoming project deadlines with urgency indicators.
 */
export const UpcomingDeadlines: React.FC<UpcomingDeadlinesProps> = ({ deadlines }) => {
  // Sample data if no deadlines provided
  const sampleDeadlines: Deadline[] = [
    {
      projectId: '1',
      projectName: 'E-commerce Platform',
      dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
      daysRemaining: 2,
    },
    {
      projectId: '2',
      projectName: 'Mobile App Redesign',
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      daysRemaining: 7,
    },
    {
      projectId: '3',
      projectName: 'API Integration',
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      daysRemaining: 14,
    },
  ];

  const displayDeadlines = deadlines.length > 0 ? deadlines : sampleDeadlines;

  const getUrgencyColor = (daysRemaining: number) => {
    if (daysRemaining <= 3) return 'text-red-600 dark:text-red-400';
    if (daysRemaining <= 7) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-green-600 dark:text-green-400';
  };

  const getUrgencyBg = (daysRemaining: number) => {
    if (daysRemaining <= 3) return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800';
    if (daysRemaining <= 7) return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800';
    return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800';
  };

  const getUrgencyIcon = (daysRemaining: number) => {
    if (daysRemaining <= 3) {
      return (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
      );
    }
    if (daysRemaining <= 7) {
      return (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
    }
    return (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    );
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Upcoming Deadlines
          </h2>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Next 30 days
          </span>
        </div>
      </div>

      <div className="p-6">
        {displayDeadlines.length > 0 ? (
          <div className="space-y-4">
            {displayDeadlines.slice(0, 5).map((deadline, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border ${getUrgencyBg(deadline.daysRemaining)}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <div className={getUrgencyColor(deadline.daysRemaining)}>
                        {getUrgencyIcon(deadline.daysRemaining)}
                      </div>
                      <h3 className="font-medium text-gray-900 dark:text-white">
                        {deadline.projectName}
                      </h3>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Due {formatDistanceToNow(new Date(deadline.dueDate), { addSuffix: true })}
                      </div>
                      
                      <div className={`text-sm font-medium ${getUrgencyColor(deadline.daysRemaining)}`}>
                        {deadline.daysRemaining === 0 
                          ? 'Due today'
                          : deadline.daysRemaining === 1
                          ? '1 day left'
                          : `${deadline.daysRemaining} days left`
                        }
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {displayDeadlines.length > 5 && (
              <div className="text-center pt-4 border-t border-gray-200 dark:border-gray-700">
                <button className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
                  View all deadlines ({displayDeadlines.length - 5} more)
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="text-gray-400 dark:text-gray-500 mb-2">
              <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="text-gray-500 dark:text-gray-400">No upcoming deadlines</p>
          </div>
        )}
      </div>
    </div>
  );
};
