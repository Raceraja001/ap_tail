import React, { useEffect, useRef } from 'react';

interface KeyboardNavigationProps {
  children: React.ReactNode;
  className?: string;
  onEscape?: () => void;
  trapFocus?: boolean;
  autoFocus?: boolean;
}

/**
 * Keyboard Navigation Helper Component
 * 
 * Features:
 * - Focus trapping for modals and dropdowns
 * - Escape key handling
 * - Auto-focus management
 * - Arrow key navigation support
 * - ARIA compliance
 */
export const KeyboardNavigation: React.FC<KeyboardNavigationProps> = ({
  children,
  className = '',
  onEscape,
  trapFocus = false,
  autoFocus = false,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const firstFocusableRef = useRef<HTMLElement | null>(null);
  const lastFocusableRef = useRef<HTMLElement | null>(null);

  // Get all focusable elements
  const getFocusableElements = (): HTMLElement[] => {
    if (!containerRef.current) return [];

    const focusableSelectors = [
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      'a[href]',
      '[tabindex]:not([tabindex="-1"])',
      '[contenteditable="true"]',
    ].join(', ');

    return Array.from(containerRef.current.querySelectorAll(focusableSelectors));
  };

  // Handle keyboard events
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Handle Escape key
      if (event.key === 'Escape' && onEscape) {
        event.preventDefault();
        onEscape();
        return;
      }

      // Handle Tab key for focus trapping
      if (trapFocus && event.key === 'Tab') {
        const focusableElements = getFocusableElements();
        if (focusableElements.length === 0) return;

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (event.shiftKey) {
          // Shift + Tab
          if (document.activeElement === firstElement) {
            event.preventDefault();
            lastElement.focus();
          }
        } else {
          // Tab
          if (document.activeElement === lastElement) {
            event.preventDefault();
            firstElement.focus();
          }
        }
      }

      // Handle Arrow keys for navigation
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)) {
        const focusableElements = getFocusableElements();
        const currentIndex = focusableElements.indexOf(document.activeElement as HTMLElement);

        if (currentIndex === -1) return;

        let nextIndex = currentIndex;

        switch (event.key) {
          case 'ArrowUp':
            nextIndex = currentIndex > 0 ? currentIndex - 1 : focusableElements.length - 1;
            break;
          case 'ArrowDown':
            nextIndex = currentIndex < focusableElements.length - 1 ? currentIndex + 1 : 0;
            break;
          case 'ArrowLeft':
            nextIndex = currentIndex > 0 ? currentIndex - 1 : focusableElements.length - 1;
            break;
          case 'ArrowRight':
            nextIndex = currentIndex < focusableElements.length - 1 ? currentIndex + 1 : 0;
            break;
        }

        // Only prevent default and focus if we're navigating within a menu or list
        const activeElement = document.activeElement as HTMLElement;
        const isInMenu = activeElement.closest('[role="menu"], [role="listbox"], [role="tablist"]');
        
        if (isInMenu) {
          event.preventDefault();
          focusableElements[nextIndex]?.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onEscape, trapFocus]);

  // Auto-focus first element
  useEffect(() => {
    if (autoFocus && containerRef.current) {
      const focusableElements = getFocusableElements();
      if (focusableElements.length > 0) {
        focusableElements[0].focus();
      }
    }
  }, [autoFocus]);

  // Update focusable element refs
  useEffect(() => {
    const focusableElements = getFocusableElements();
    firstFocusableRef.current = focusableElements[0] || null;
    lastFocusableRef.current = focusableElements[focusableElements.length - 1] || null;
  });

  return (
    <div
      ref={containerRef}
      className={className}
      onKeyDown={(e) => {
        // Allow event bubbling for custom handling
        e.stopPropagation();
      }}
    >
      {children}
    </div>
  );
};

/**
 * Skip Link Component for Screen Readers
 */
export const SkipLink: React.FC<{ href: string; children: React.ReactNode }> = ({ 
  href, 
  children 
}) => (
  <a
    href={href}
    className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-blue-600 text-white px-4 py-2 rounded-md z-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
  >
    {children}
  </a>
);

/**
 * Focus Trap Component for Modals
 */
export const FocusTrap: React.FC<{
  children: React.ReactNode;
  active?: boolean;
  onEscape?: () => void;
}> = ({ children, active = true, onEscape }) => {
  if (!active) {
    return <>{children}</>;
  }

  return (
    <KeyboardNavigation
      trapFocus={true}
      autoFocus={true}
      onEscape={onEscape}
    >
      {children}
    </KeyboardNavigation>
  );
};

/**
 * Roving Tab Index Hook for Complex Widgets
 */
export const useRovingTabIndex = (items: HTMLElement[], activeIndex: number = 0) => {
  useEffect(() => {
    items.forEach((item, index) => {
      if (item) {
        item.tabIndex = index === activeIndex ? 0 : -1;
      }
    });
  }, [items, activeIndex]);

  const handleKeyDown = (event: KeyboardEvent, currentIndex: number, onIndexChange: (index: number) => void) => {
    let nextIndex = currentIndex;

    switch (event.key) {
      case 'ArrowUp':
      case 'ArrowLeft':
        event.preventDefault();
        nextIndex = currentIndex > 0 ? currentIndex - 1 : items.length - 1;
        break;
      case 'ArrowDown':
      case 'ArrowRight':
        event.preventDefault();
        nextIndex = currentIndex < items.length - 1 ? currentIndex + 1 : 0;
        break;
      case 'Home':
        event.preventDefault();
        nextIndex = 0;
        break;
      case 'End':
        event.preventDefault();
        nextIndex = items.length - 1;
        break;
      default:
        return;
    }

    onIndexChange(nextIndex);
    items[nextIndex]?.focus();
  };

  return { handleKeyDown };
};
