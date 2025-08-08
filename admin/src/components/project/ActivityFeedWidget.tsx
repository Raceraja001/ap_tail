import React from 'react';
import { ActivityFeed } from '../../core/project/types';
import { formatDistanceToNow } from 'date-fns';

interface ActivityFeedWidgetProps {
  activities: ActivityFeed[];
  maxItems?: number;
}

/**
 * Activity Feed Widget Component
 * 
 * Displays recent project activities in a timeline format.
 * Implements real-time updates and user-friendly formatting.
 */
export const ActivityFeedWidget: React.FC<ActivityFeedWidgetProps> = ({ 
  activities, 
  maxItems = 10 
}) => {
  const displayedActivities = activities.slice(0, maxItems);

  const getActivityIcon = (type: ActivityFeed['type']) => {
    const iconMap = {
      project_created: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
      ),
      task_completed: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      comment_added: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      ),
      file_uploaded: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
      ),
      milestone_reached: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
        </svg>
      ),
    };
    
    return iconMap[type] || iconMap.project_created;
  };

  const getActivityColor = (type: ActivityFeed['type']) => {
    const colorMap = {
      project_created: 'bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400',
      task_completed: 'bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400',
      comment_added: 'bg-purple-100 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400',
      file_uploaded: 'bg-orange-100 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400',
      milestone_reached: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-400',
    };
    
    return colorMap[type] || colorMap.project_created;
  };

  if (displayedActivities.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-gray-400 dark:text-gray-500 mb-2">
          <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2 2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
        </div>
        <p className="text-gray-500 dark:text-gray-400">No recent activity</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {displayedActivities.map((activity, index) => (
        <div key={activity.id} className="flex items-start space-x-3">
          {/* Activity Icon */}
          <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${getActivityColor(activity.type)}`}>
            {getActivityIcon(activity.type)}
          </div>

          {/* Activity Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {activity.userAvatar ? (
                  <img
                    src={activity.userAvatar}
                    alt={activity.userName}
                    className="w-6 h-6 rounded-full"
                  />
                ) : (
                  <div className="w-6 h-6 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
                    <span className="text-xs font-medium text-gray-600 dark:text-gray-300">
                      {activity.userName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {activity.userName}
                </span>
              </div>
              
              <time className="text-xs text-gray-500 dark:text-gray-400">
                {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
              </time>
            </div>

            <div className="mt-1">
              <p className="text-sm text-gray-900 dark:text-white font-medium">
                {activity.title}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {activity.description}
              </p>
              
              {/* Project/Task Links */}
              <div className="flex items-center space-x-4 mt-2">
                {activity.projectName && (
                  <a
                    href={`/projects/${activity.projectId}`}
                    className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    {activity.projectName}
                  </a>
                )}
                {activity.taskTitle && (
                  <a
                    href={`/tasks/${activity.taskId}`}
                    className="text-xs text-purple-600 dark:text-purple-400 hover:underline"
                  >
                    {activity.taskTitle}
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}

      {activities.length > maxItems && (
        <div className="text-center pt-4 border-t border-gray-200 dark:border-gray-700">
          <button className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
            View all activity ({activities.length - maxItems} more)
          </button>
        </div>
      )}
    </div>
  );
};
