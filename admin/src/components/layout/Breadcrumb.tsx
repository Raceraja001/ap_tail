import React from 'react';
import { Link, useLocation } from 'react-router';

interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: React.ReactNode;
}

interface BreadcrumbProps {
  items?: BreadcrumbItem[];
  className?: string;
}

/**
 * Accessible Breadcrumb Navigation Component
 * 
 * Features:
 * - ARIA navigation landmarks
 * - Screen reader support
 * - Keyboard navigation
 * - Auto-generation from route
 * - Custom breadcrumb items
 */
export const Breadcrumb: React.FC<BreadcrumbProps> = ({ items, className = '' }) => {
  const location = useLocation();

  // Auto-generate breadcrumbs from route if no items provided
  const generateBreadcrumbs = (): BreadcrumbItem[] => {
    const pathSegments = location.pathname.split('/').filter(Boolean);
    const breadcrumbs: BreadcrumbItem[] = [
      { label: 'Dashboard', href: '/projects', icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
        </svg>
      )}
    ];

    let currentPath = '';
    
    pathSegments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      
      // Skip if it's the last segment (current page)
      if (index === pathSegments.length - 1) {
        breadcrumbs.push({ label: formatSegment(segment) });
      } else {
        breadcrumbs.push({ 
          label: formatSegment(segment), 
          href: currentPath 
        });
      }
    });

    return breadcrumbs;
  };

  const formatSegment = (segment: string): string => {
    // Convert URL segments to readable labels
    const segmentMap: Record<string, string> = {
      'projects': 'Projects',
      'list': 'All Projects',
      'create': 'Create Project',
      'tasks': 'Tasks',
      'board': 'Kanban Board',
      'my-tasks': 'My Tasks',
      'teams': 'Teams',
      'time-tracking': 'Time Tracking',
      'reports': 'Reports',
      'calendar': 'Calendar',
      'settings': 'Settings',
      'profile': 'Profile',
    };

    return segmentMap[segment] || segment.charAt(0).toUpperCase() + segment.slice(1);
  };

  const breadcrumbItems = items || generateBreadcrumbs();

  if (breadcrumbItems.length <= 1) {
    return null;
  }

  return (
    <nav 
      aria-label="Breadcrumb navigation"
      className={`flex items-center space-x-1 text-sm text-gray-500 dark:text-gray-400 ${className}`}
    >
      <ol className="flex items-center space-x-1" role="list">
        {breadcrumbItems.map((item, index) => (
          <li key={index} className="flex items-center">
            {index > 0 && (
              <svg 
                className="w-4 h-4 mx-2 text-gray-400" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            )}
            
            {item.href ? (
              <Link
                to={item.href}
                className="flex items-center space-x-1 hover:text-gray-700 dark:hover:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-1 py-0.5"
                aria-current={index === breadcrumbItems.length - 1 ? 'page' : undefined}
              >
                {item.icon && <span className="flex-shrink-0">{item.icon}</span>}
                <span>{item.label}</span>
              </Link>
            ) : (
              <span 
                className="flex items-center space-x-1 text-gray-900 dark:text-white font-medium"
                aria-current="page"
              >
                {item.icon && <span className="flex-shrink-0">{item.icon}</span>}
                <span>{item.label}</span>
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};
