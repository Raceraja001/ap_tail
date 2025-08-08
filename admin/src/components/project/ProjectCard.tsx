import React from 'react';
import { Project } from '../../core/project/types';
import { ProjectStatusBadge } from './ProjectStatusBadge';
import { formatDistanceToNow } from 'date-fns';

interface ProjectCardProps {
  project: Project;
  viewMode?: 'grid' | 'list';
  onClick?: () => void;
  className?: string;
}

/**
 * Project Card Component
 * 
 * Displays project information in card or list format.
 */
export const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  viewMode = 'grid',
  onClick,
  className = '',
}) => {
  const isOverdue = new Date(project.endDate) < new Date() && project.status !== 'completed';

  if (viewMode === 'list') {
    return (
      <div
        onClick={onClick}
        className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow cursor-pointer ${className}`}
      >
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {project.name}
              </h3>
              <ProjectStatusBadge status={project.status} />
              {isOverdue && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400">
                  Overdue
                </span>
              )}
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-3">
              {project.description}
            </p>
            <div className="flex items-center space-x-6 text-sm text-gray-500 dark:text-gray-400">
              <span>Progress: {project.progress}%</span>
              <span>Budget: ${project.spentBudget.toLocaleString()} / ${project.budget.toLocaleString()}</span>
              <span>Due: {formatDistanceToNow(new Date(project.endDate), { addSuffix: true })}</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {project.progress}%
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Complete
              </div>
            </div>
            
            <div className="w-16 h-16">
              <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-gray-200 dark:text-gray-700"
                  stroke="currentColor"
                  strokeWidth="3"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-blue-600 dark:text-blue-400"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeDasharray={`${project.progress}, 100`}
                  strokeLinecap="round"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={onClick}
      className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow cursor-pointer ${className}`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            {project.name}
          </h3>
          <ProjectStatusBadge status={project.status} />
        </div>
        
        {isOverdue && (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400">
            Overdue
          </span>
        )}
      </div>

      {/* Description */}
      <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
        {project.description}
      </p>

      {/* Progress */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="text-gray-500 dark:text-gray-400">Progress</span>
          <span className="font-medium text-gray-900 dark:text-white">{project.progress}%</span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${project.progress}%` }}
          />
        </div>
      </div>

      {/* Tags */}
      {project.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-4">
          {project.tags.slice(0, 3).map((tag, index) => (
            <span
              key={index}
              className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
            >
              {tag}
            </span>
          ))}
          {project.tags.length > 3 && (
            <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400">
              +{project.tags.length - 3}
            </span>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
        <div className="flex items-center space-x-4">
          <span>${project.spentBudget.toLocaleString()}</span>
          <span>{project.actualHours}h logged</span>
        </div>
        
        <span>
          Due {formatDistanceToNow(new Date(project.endDate), { addSuffix: true })}
        </span>
      </div>
    </div>
  );
};
