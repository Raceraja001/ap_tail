import React, { useState } from 'react';
import { useTimeEntries, useLogTime } from '../../core/project/hooks';
import { useUser } from '../../core/auth/hooks';
import { GlobalLoadingSpinner } from '../../components/common/GlobalLoadingSpinner';

/**
 * Time Tracking Page
 * 
 * Track time spent on projects and tasks with detailed logging.
 */
export const TimeTracking: React.FC = () => {
  const { user } = useUser();
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0],
  });
  
  const { data: timeEntries, isLoading, error } = useTimeEntries(user?.id || '', dateRange);
  const logTimeMutation = useLogTime();

  const [isLogging, setIsLogging] = useState(false);
  const [currentTimer, setCurrentTimer] = useState<{
    startTime: Date;
    description: string;
    projectId?: string;
    taskId?: string;
  } | null>(null);

  const startTimer = () => {
    setCurrentTimer({
      startTime: new Date(),
      description: '',
    });
    setIsLogging(true);
  };

  const stopTimer = () => {
    if (currentTimer) {
      const hours = (Date.now() - currentTimer.startTime.getTime()) / (1000 * 60 * 60);
      
      logTimeMutation.mutate({
        userId: user?.id || '',
        projectId: currentTimer.projectId || '',
        taskId: currentTimer.taskId,
        description: currentTimer.description || 'Time tracking session',
        hours: Math.round(hours * 100) / 100,
        date: new Date().toISOString().split('T')[0],
        billable: true,
      });
    }
    
    setCurrentTimer(null);
    setIsLogging(false);
  };

  if (isLoading) {
    return <GlobalLoadingSpinner />;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="text-red-500 mb-2">
            <svg className="w-12 h-12 mx-auto" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Failed to load time entries
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            Please try refreshing the page
          </p>
        </div>
      </div>
    );
  }

  const totalHours = timeEntries?.reduce((sum, entry) => sum + entry.hours, 0) || 0;

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Time Tracking
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Track time spent on projects and tasks
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              From:
            </label>
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
              className="border border-gray-300 dark:border-gray-600 rounded-md px-3 py-1 text-sm bg-white dark:bg-gray-700"
            />
          </div>
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              To:
            </label>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
              className="border border-gray-300 dark:border-gray-600 rounded-md px-3 py-1 text-sm bg-white dark:bg-gray-700"
            />
          </div>
        </div>
      </div>

      {/* Timer Widget */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Time Tracker
            </h2>
            {currentTimer && (
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Started at {currentTimer.startTime.toLocaleTimeString()}
              </p>
            )}
          </div>
          
          <div className="flex items-center space-x-4">
            {isLogging ? (
              <>
                <div className="text-2xl font-mono font-bold text-green-600 dark:text-green-400">
                  {currentTimer && (
                    <span>
                      {Math.floor((Date.now() - currentTimer.startTime.getTime()) / (1000 * 60 * 60))}:
                      {Math.floor(((Date.now() - currentTimer.startTime.getTime()) % (1000 * 60 * 60)) / (1000 * 60)).toString().padStart(2, '0')}:
                      {Math.floor(((Date.now() - currentTimer.startTime.getTime()) % (1000 * 60)) / 1000).toString().padStart(2, '0')}
                    </span>
                  )}
                </div>
                <button
                  onClick={stopTimer}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  Stop
                </button>
              </>
            ) : (
              <button
                onClick={startTimer}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                <div className="flex items-center space-x-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h1m4 0h1m6-10V7a3 3 0 11-6 0V4h6zM4 20h16" />
                  </svg>
                  <span>Start Timer</span>
                </div>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
              <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Hours</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalHours.toFixed(1)}h</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
              <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Entries</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{timeEntries?.length || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
              <svg className="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg/Day</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {timeEntries && timeEntries.length > 0 ? (totalHours / 7).toFixed(1) : '0.0'}h
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
              <svg className="w-5 h-5 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Billable</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {timeEntries?.filter(entry => entry.billable).reduce((sum, entry) => sum + entry.hours, 0).toFixed(1) || '0.0'}h
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Time Entries List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Time Entries
          </h2>
        </div>
        <div className="p-6">
          {timeEntries && timeEntries.length > 0 ? (
            <div className="space-y-4">
              {timeEntries.map((entry) => (
                <div
                  key={entry.id}
                  className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-600 rounded-lg"
                >
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 dark:text-white">
                      {entry.description}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {new Date(entry.date).toLocaleDateString()}
                    </p>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      entry.billable
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
                    }`}>
                      {entry.billable ? 'Billable' : 'Non-billable'}
                    </span>
                    
                    <span className="font-mono font-medium text-gray-900 dark:text-white">
                      {entry.hours.toFixed(2)}h
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-gray-400 dark:text-gray-500 mb-2">
                <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-gray-500 dark:text-gray-400">No time entries found for this period</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TimeTracking;
