import React from 'react';
import { useDashboardSummary, useActivityFeed } from '../../core/project/hooks';
import { usePerformance } from '../../core/performance/usePerformance';
import { ProjectSummaryCards } from '../../components/project/ProjectSummaryCards';
import { ProjectProgressChart } from '../../components/project/ProjectProgressChart';
import { ActivityFeedWidget } from '../../components/project/ActivityFeedWidget';
import { UpcomingDeadlines } from '../../components/project/UpcomingDeadlines';
import { TeamWorkloadChart } from '../../components/project/TeamWorkloadChart';
import { ProjectStatusDistribution } from '../../components/project/ProjectStatusDistribution';
import { GlobalLoadingSpinner } from '../../components/common/GlobalLoadingSpinner';
import { PageHeader } from '../../components/layout/PageHeader';

/**
 * Project Management Dashboard
 * 
 * Main dashboard providing comprehensive project overview and analytics.
 * Implements performance monitoring and responsive design.
 */
export const ProjectManagementDashboard: React.FC = () => {
  const { metrics } = usePerformance({
    componentName: 'ProjectManagementDashboard',
    trackMemory: true,
    enableInProduction: false, // Only in development
  });

  const { 
    data: summary, 
    isLoading: summaryLoading, 
    error: summaryError 
  } = useDashboardSummary();

  const { 
    data: activities, 
    isLoading: activitiesLoading 
  } = useActivityFeed(10);

  if (summaryLoading) {
    return <GlobalLoadingSpinner />;
  }

  if (summaryError) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="text-red-500 mb-2">
            <svg className="w-12 h-12 mx-auto" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Failed to load dashboard
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            Please try refreshing the page
          </p>
        </div>
      </div>
    );
  }

  const handleCreateProject = () => {
    // Navigate to create project page
    console.log('Create new project');
  };

  const handleExportReport = () => {
    // Export dashboard report
    console.log('Export report');
  };

  return (
    <div>
      <PageHeader
        title="Project Dashboard"
        description="Overview of all your projects and team performance"
        actions={[
          {
            label: 'Export Report',
            onClick: handleExportReport,
            variant: 'secondary',
            icon: (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            ),
          },
          {
            label: 'New Project',
            onClick: handleCreateProject,
            variant: 'primary',
            icon: (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            ),
          },
        ]}
      />

      <div className="space-y-6 p-6">
        {/* Summary Cards */}
      {summary && <ProjectSummaryCards summary={summary} />}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Charts */}
        <div className="lg:col-span-2 space-y-6">
          {/* Project Progress Chart */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Project Progress
              </h2>
              <select className="text-sm border border-gray-300 dark:border-gray-600 rounded-md px-3 py-1 bg-white dark:bg-gray-700">
                <option>Last 30 days</option>
                <option>Last 3 months</option>
                <option>Last 6 months</option>
                <option>This year</option>
              </select>
            </div>
            <ProjectProgressChart />
          </div>

          {/* Team Workload */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Team Workload
            </h2>
            <TeamWorkloadChart />
          </div>

          {/* Project Status Distribution */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Project Status Distribution
            </h2>
            <ProjectStatusDistribution />
          </div>
        </div>

        {/* Right Column - Widgets */}
        <div className="space-y-6">
          {/* Upcoming Deadlines */}
          {summary && (
            <UpcomingDeadlines deadlines={summary.upcomingDeadlines} />
          )}

          {/* Activity Feed */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Recent Activity
              </h2>
            </div>
            <div className="p-6">
              {activitiesLoading ? (
                <div className="space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="flex space-x-3">
                        <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : activities ? (
                <ActivityFeedWidget activities={activities} />
              ) : (
                <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                  No recent activity
                </p>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Quick Actions
            </h2>
            <div className="space-y-3">
              <button className="w-full text-left px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mr-3">
                    <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Create Task</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Add a new task to any project</p>
                  </div>
                </div>
              </button>

              <button className="w-full text-left px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mr-3">
                    <svg className="w-4 h-4 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Log Time</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Track time spent on tasks</p>
                  </div>
                </div>
              </button>

              <button className="w-full text-left px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mr-3">
                    <svg className="w-4 h-4 text-purple-600 dark:text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                      <path fillRule="evenodd" d="M4 5a2 2 0 012-2v1a1 1 0 102 0V3h4v1a1 1 0 102 0V3a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">View Calendar</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">See upcoming deadlines</p>
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Debug Info (Development Only) */}
      {import.meta.env.DEV && metrics && (
        <div className="mt-8 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Performance Metrics (Dev Only)
          </h3>
          <div className="text-xs text-gray-600 dark:text-gray-400">
            Render time: {metrics.renderTime.toFixed(2)}ms
            {metrics.memoryUsage && (
              <span className="ml-4">
                Memory: {(metrics.memoryUsage.usedJSHeapSize / 1024 / 1024).toFixed(2)}MB
              </span>
            )}
          </div>
        </div>
      )}
      </div>
    </div>
  );
};

export default ProjectManagementDashboard;
