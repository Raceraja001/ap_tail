import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';

/**
 * Virtual Scrolling Component
 * 
 * Implements Virtual Scrolling for performance optimization with large lists.
 * Follows Single Responsibility Principle by handling only virtualization logic.
 */

interface VirtualScrollProps<T> {
  items: T[];
  itemHeight: number | ((index: number, item: T) => number);
  containerHeight: number;
  renderItem: (item: T, index: number, style: React.CSSProperties) => React.ReactNode;
  overscan?: number;
  className?: string;
  onScroll?: (scrollTop: number) => void;
  scrollToIndex?: number;
  scrollToAlignment?: 'start' | 'center' | 'end' | 'auto';
}

interface VirtualScrollState {
  scrollTop: number;
  isScrolling: boolean;
}

export function VirtualScroll<T>({
  items,
  itemHeight,
  containerHeight,
  renderItem,
  overscan = 5,
  className = '',
  onScroll,
  scrollToIndex,
  scrollToAlignment = 'auto',
}: VirtualScrollProps<T>) {
  const [state, setState] = useState<VirtualScrollState>({
    scrollTop: 0,
    isScrolling: false,
  });

  const containerRef = useRef<HTMLDivElement>(null);
  const scrollTimeoutRef = useRef<number>();

  // Calculate item heights and positions
  const itemMetadata = useMemo(() => {
    const metadata: Array<{ offset: number; size: number }> = [];
    let offset = 0;

    for (let i = 0; i < items.length; i++) {
      const size = typeof itemHeight === 'function' ? itemHeight(i, items[i]) : itemHeight;
      metadata[i] = { offset, size };
      offset += size;
    }

    return metadata;
  }, [items, itemHeight]);

  const totalHeight = useMemo(() => {
    return itemMetadata.length > 0 
      ? itemMetadata[itemMetadata.length - 1].offset + itemMetadata[itemMetadata.length - 1].size
      : 0;
  }, [itemMetadata]);

  // Binary search to find the start index
  const findStartIndex = useCallback((scrollTop: number) => {
    let low = 0;
    let high = itemMetadata.length - 1;

    while (low <= high) {
      const mid = Math.floor((low + high) / 2);
      const offset = itemMetadata[mid].offset;

      if (offset === scrollTop) {
        return mid;
      } else if (offset < scrollTop) {
        low = mid + 1;
      } else {
        high = mid - 1;
      }
    }

    return Math.max(0, high);
  }, [itemMetadata]);

  // Calculate visible range
  const visibleRange = useMemo(() => {
    const startIndex = findStartIndex(state.scrollTop);
    let endIndex = startIndex;
    let visibleHeight = 0;

    while (endIndex < itemMetadata.length && visibleHeight < containerHeight) {
      visibleHeight += itemMetadata[endIndex].size;
      endIndex++;
    }

    return {
      start: Math.max(0, startIndex - overscan),
      end: Math.min(itemMetadata.length - 1, endIndex + overscan),
    };
  }, [state.scrollTop, containerHeight, itemMetadata, overscan, findStartIndex]);

  // Handle scroll events
  const handleScroll = useCallback((event: React.UIEvent<HTMLDivElement>) => {
    const scrollTop = event.currentTarget.scrollTop;
    
    setState(prev => ({
      ...prev,
      scrollTop,
      isScrolling: true,
    }));

    onScroll?.(scrollTop);

    // Clear scrolling state after a delay
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }

    scrollTimeoutRef.current = window.setTimeout(() => {
      setState(prev => ({ ...prev, isScrolling: false }));
    }, 150);
  }, [onScroll]);

  // Scroll to specific index
  const scrollToItem = useCallback((index: number, alignment: string = 'auto') => {
    if (!containerRef.current || index < 0 || index >= itemMetadata.length) {
      return;
    }

    const itemMetadata_ = itemMetadata[index];
    const containerScrollTop = state.scrollTop;
    const containerHeight_ = containerHeight;

    let scrollTop: number;

    switch (alignment) {
      case 'start':
        scrollTop = itemMetadata_.offset;
        break;
      case 'end':
        scrollTop = itemMetadata_.offset + itemMetadata_.size - containerHeight_;
        break;
      case 'center':
        scrollTop = itemMetadata_.offset + (itemMetadata_.size - containerHeight_) / 2;
        break;
      default: // 'auto'
        if (itemMetadata_.offset < containerScrollTop) {
          scrollTop = itemMetadata_.offset;
        } else if (itemMetadata_.offset + itemMetadata_.size > containerScrollTop + containerHeight_) {
          scrollTop = itemMetadata_.offset + itemMetadata_.size - containerHeight_;
        } else {
          return; // Item is already visible
        }
    }

    containerRef.current.scrollTop = Math.max(0, Math.min(scrollTop, totalHeight - containerHeight_));
  }, [itemMetadata, state.scrollTop, containerHeight, totalHeight]);

  // Effect for scrollToIndex prop
  useEffect(() => {
    if (scrollToIndex !== undefined) {
      scrollToItem(scrollToIndex, scrollToAlignment);
    }
  }, [scrollToIndex, scrollToAlignment, scrollToItem]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  // Render visible items
  const visibleItems = useMemo(() => {
    const items_ = [];
    
    for (let i = visibleRange.start; i <= visibleRange.end; i++) {
      if (i >= 0 && i < items.length) {
        const item = items[i];
        const metadata = itemMetadata[i];
        
        const style: React.CSSProperties = {
          position: 'absolute',
          top: metadata.offset,
          left: 0,
          right: 0,
          height: metadata.size,
        };

        items_.push(
          <div key={i} style={style}>
            {renderItem(item, i, style)}
          </div>
        );
      }
    }

    return items_;
  }, [visibleRange, items, itemMetadata, renderItem]);

  return (
    <div
      ref={containerRef}
      className={`overflow-auto ${className}`}
      style={{ height: containerHeight }}
      onScroll={handleScroll}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        {visibleItems}
      </div>
    </div>
  );
}

/**
 * Virtual Grid Component
 */
interface VirtualGridProps<T> {
  items: T[];
  itemWidth: number;
  itemHeight: number;
  containerWidth: number;
  containerHeight: number;
  renderItem: (item: T, index: number, style: React.CSSProperties) => React.ReactNode;
  overscan?: number;
  className?: string;
  gap?: number;
}

export function VirtualGrid<T>({
  items,
  itemWidth,
  itemHeight,
  containerWidth,
  containerHeight,
  renderItem,
  overscan = 5,
  className = '',
  gap = 0,
}: VirtualGridProps<T>) {
  const [scrollTop, setScrollTop] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const columnsCount = Math.floor((containerWidth + gap) / (itemWidth + gap));
  const rowsCount = Math.ceil(items.length / columnsCount);

  const totalHeight = rowsCount * (itemHeight + gap) - gap;
  const totalWidth = columnsCount * (itemWidth + gap) - gap;

  const startRow = Math.max(0, Math.floor(scrollTop / (itemHeight + gap)) - overscan);
  const endRow = Math.min(
    rowsCount - 1,
    Math.floor((scrollTop + containerHeight) / (itemHeight + gap)) + overscan
  );

  const startCol = Math.max(0, Math.floor(scrollLeft / (itemWidth + gap)) - overscan);
  const endCol = Math.min(
    columnsCount - 1,
    Math.floor((scrollLeft + containerWidth) / (itemWidth + gap)) + overscan
  );

  const visibleItems = useMemo(() => {
    const items_ = [];

    for (let row = startRow; row <= endRow; row++) {
      for (let col = startCol; col <= endCol; col++) {
        const index = row * columnsCount + col;
        
        if (index < items.length) {
          const item = items[index];
          const style: React.CSSProperties = {
            position: 'absolute',
            left: col * (itemWidth + gap),
            top: row * (itemHeight + gap),
            width: itemWidth,
            height: itemHeight,
          };

          items_.push(
            <div key={index} style={style}>
              {renderItem(item, index, style)}
            </div>
          );
        }
      }
    }

    return items_;
  }, [startRow, endRow, startCol, endCol, items, itemWidth, itemHeight, gap, columnsCount, renderItem]);

  const handleScroll = useCallback((event: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(event.currentTarget.scrollTop);
    setScrollLeft(event.currentTarget.scrollLeft);
  }, []);

  return (
    <div
      className={`overflow-auto ${className}`}
      style={{ width: containerWidth, height: containerHeight }}
      onScroll={handleScroll}
    >
      <div style={{ width: totalWidth, height: totalHeight, position: 'relative' }}>
        {visibleItems}
      </div>
    </div>
  );
}
