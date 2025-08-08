import React, { useState, useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { SkipLink } from '../accessibility/KeyboardNavigation';
import { useLiveRegion } from '../accessibility/LiveRegion';

interface AppLayoutProps {
  children: React.ReactNode;
}

/**
 * Main Application Layout Component
 * 
 * Features:
 * - Responsive sidebar navigation
 * - Mobile-friendly header
 * - Keyboard navigation support
 * - Focus management
 * - Accessibility compliance
 */
export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { announce, LiveRegionComponent } = useLiveRegion();

  // Close sidebar on escape key
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isSidebarOpen) {
        setIsSidebarOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isSidebarOpen]);

  // Close sidebar on route change (mobile)
  useEffect(() => {
    const handleRouteChange = () => {
      if (window.innerWidth < 1024) {
        setIsSidebarOpen(false);
      }
    };

    // Listen for route changes
    window.addEventListener('popstate', handleRouteChange);
    return () => window.removeEventListener('popstate', handleRouteChange);
  }, []);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleSidebar = () => {
    const newState = !isSidebarOpen;
    setIsSidebarOpen(newState);
    announce(newState ? 'Navigation menu opened' : 'Navigation menu closed');
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
    announce('Navigation menu closed');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Skip to main content link for screen readers */}
      <SkipLink href="#main-content">
        Skip to main content
      </SkipLink>

      {/* Live region for announcements */}
      <LiveRegionComponent />

      <div className="flex h-screen">
        {/* Sidebar */}
        <Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} />

        {/* Main content area */}
        <div className="flex-1 flex flex-col overflow-hidden lg:ml-0">
          {/* Header */}
          <Header onMenuToggle={toggleSidebar} isSidebarOpen={isSidebarOpen} />

          {/* Main content */}
          <main 
            id="main-content"
            className="flex-1 overflow-y-auto focus:outline-none"
            tabIndex={-1}
            role="main"
            aria-label="Main content"
          >
            <div className="h-full">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default AppLayout;
