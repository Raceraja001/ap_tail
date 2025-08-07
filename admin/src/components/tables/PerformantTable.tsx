import React, { useMemo, useState, useCallback } from 'react';
import { VirtualScroll } from '../common/VirtualScroll';

/**
 * Performance Optimized Table Component
 * 
 * Implements Virtual Scrolling for large datasets.
 * Follows Single Responsibility Principle by focusing on table rendering.
 */

export interface Column<T> {
  key: keyof T | string;
  title: string;
  width?: number;
  minWidth?: number;
  maxWidth?: number;
  sortable?: boolean;
  filterable?: boolean;
  render?: (value: any, record: T, index: number) => React.ReactNode;
  align?: 'left' | 'center' | 'right';
  fixed?: 'left' | 'right';
  className?: string;
}

export interface TableProps<T> {
  data: T[];
  columns: Column<T>[];
  height?: number;
  rowHeight?: number;
  loading?: boolean;
  empty?: React.ReactNode;
  onRowClick?: (record: T, index: number) => void;
  onSort?: (key: string, direction: 'asc' | 'desc') => void;
  onFilter?: (filters: Record<string, any>) => void;
  sortKey?: string;
  sortDirection?: 'asc' | 'desc';
  filters?: Record<string, any>;
  className?: string;
  rowClassName?: string | ((record: T, index: number) => string);
  headerClassName?: string;
  virtualized?: boolean;
  stickyHeader?: boolean;
  resizable?: boolean;
  selectable?: boolean;
  selectedRows?: Set<number>;
  onSelectionChange?: (selectedRows: Set<number>) => void;
}

export function PerformantTable<T extends Record<string, any>>({
  data,
  columns,
  height = 400,
  rowHeight = 48,
  loading = false,
  empty,
  onRowClick,
  onSort,
  onFilter,
  sortKey,
  sortDirection,
  filters = {},
  className = '',
  rowClassName = '',
  headerClassName = '',
  virtualized = true,
  stickyHeader = true,
  resizable = false,
  selectable = false,
  selectedRows = new Set(),
  onSelectionChange,
}: TableProps<T>) {
  const [columnWidths, setColumnWidths] = useState<Record<string, number>>({});

  // Calculate column widths
  const calculatedColumns = useMemo(() => {
    return columns.map(col => ({
      ...col,
      width: columnWidths[col.key as string] || col.width || 150,
    }));
  }, [columns, columnWidths]);

  const totalWidth = calculatedColumns.reduce((sum, col) => sum + (col.width || 150), 0);

  // Handle sorting
  const handleSort = useCallback((key: string) => {
    if (!onSort) return;
    
    const newDirection = sortKey === key && sortDirection === 'asc' ? 'desc' : 'asc';
    onSort(key, newDirection);
  }, [onSort, sortKey, sortDirection]);

  // Handle row selection
  const handleRowSelect = useCallback((index: number, selected: boolean) => {
    if (!onSelectionChange) return;
    
    const newSelection = new Set(selectedRows);
    if (selected) {
      newSelection.add(index);
    } else {
      newSelection.delete(index);
    }
    onSelectionChange(newSelection);
  }, [selectedRows, onSelectionChange]);

  const handleSelectAll = useCallback((selected: boolean) => {
    if (!onSelectionChange) return;
    
    const newSelection = selected ? new Set(data.map((_, index) => index)) : new Set();
    onSelectionChange(newSelection);
  }, [data, onSelectionChange]);

  // Render table header
  const renderHeader = () => (
    <div
      className={`flex bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 ${
        stickyHeader ? 'sticky top-0 z-10' : ''
      } ${headerClassName}`}
      style={{ width: totalWidth }}
    >
      {selectable && (
        <div className="flex items-center justify-center w-12 px-3 py-3">
          <input
            type="checkbox"
            checked={selectedRows.size === data.length && data.length > 0}
            onChange={(e) => handleSelectAll(e.target.checked)}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
        </div>
      )}
      {calculatedColumns.map((column) => (
        <div
          key={column.key as string}
          className={`flex items-center px-3 py-3 text-sm font-medium text-gray-900 dark:text-white ${
            column.align === 'center' ? 'justify-center' : 
            column.align === 'right' ? 'justify-end' : 'justify-start'
          } ${column.sortable ? 'cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700' : ''}`}
          style={{ width: column.width, minWidth: column.minWidth, maxWidth: column.maxWidth }}
          onClick={() => column.sortable && handleSort(column.key as string)}
        >
          <span>{column.title}</span>
          {column.sortable && sortKey === column.key && (
            <span className="ml-1">
              {sortDirection === 'asc' ? '↑' : '↓'}
            </span>
          )}
        </div>
      ))}
    </div>
  );

  // Render table row
  const renderRow = useCallback((record: T, index: number, style: React.CSSProperties) => {
    const isSelected = selectedRows.has(index);
    const rowClass = typeof rowClassName === 'function' ? rowClassName(record, index) : rowClassName;

    return (
      <div
        style={style}
        className={`flex border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 ${
          isSelected ? 'bg-blue-50 dark:bg-blue-900/20' : ''
        } ${rowClass}`}
        onClick={() => onRowClick?.(record, index)}
      >
        {selectable && (
          <div className="flex items-center justify-center w-12 px-3">
            <input
              type="checkbox"
              checked={isSelected}
              onChange={(e) => handleRowSelect(index, e.target.checked)}
              onClick={(e) => e.stopPropagation()}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
          </div>
        )}
        {calculatedColumns.map((column) => {
          const value = record[column.key as keyof T];
          const content = column.render ? column.render(value, record, index) : value;

          return (
            <div
              key={column.key as string}
              className={`flex items-center px-3 py-3 text-sm text-gray-900 dark:text-white ${
                column.align === 'center' ? 'justify-center' : 
                column.align === 'right' ? 'justify-end' : 'justify-start'
              } ${column.className || ''}`}
              style={{ width: column.width, minWidth: column.minWidth, maxWidth: column.maxWidth }}
            >
              {content}
            </div>
          );
        })}
      </div>
    );
  }, [calculatedColumns, selectedRows, rowClassName, onRowClick, selectable, handleRowSelect]);

  // Loading state
  if (loading) {
    return (
      <div className={`border border-gray-200 dark:border-gray-700 rounded-lg ${className}`}>
        {renderHeader()}
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600 dark:text-gray-400">Loading...</span>
        </div>
      </div>
    );
  }

  // Empty state
  if (data.length === 0) {
    return (
      <div className={`border border-gray-200 dark:border-gray-700 rounded-lg ${className}`}>
        {renderHeader()}
        <div className="flex items-center justify-center py-12">
          {empty || (
            <div className="text-center text-gray-500 dark:text-gray-400">
              <svg className="w-12 h-12 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2 2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
              <p>No data available</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden ${className}`}>
      {renderHeader()}
      
      {virtualized ? (
        <VirtualScroll
          items={data}
          itemHeight={rowHeight}
          containerHeight={height - 48} // Subtract header height
          renderItem={renderRow}
          className="bg-white dark:bg-gray-900"
        />
      ) : (
        <div 
          className="overflow-auto bg-white dark:bg-gray-900"
          style={{ height: height - 48, width: totalWidth }}
        >
          {data.map((record, index) => 
            renderRow(record, index, { height: rowHeight })
          )}
        </div>
      )}
    </div>
  );
}
