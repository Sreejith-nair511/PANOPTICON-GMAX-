/**
 * Performance optimization utilities for low-end systems
 * Configures reduced animations and optimized rendering
 */

export const PERFORMANCE_CONFIG = {
  // Reduce animation durations for faster perceived performance
  animationDuration: {
    fast: 0.15, // Quick transitions
    normal: 0.2, // Standard transitions
    slow: 0.3, // Slower transitions (rarely used)
  },

  // Disable heavy animations on low-end systems
  reduceMotion: false, // Set to true to disable all animations

  // Lazy loading thresholds
  lazyLoadOffset: 200, // px before element enters viewport

  // Query configuration
  query: {
    staleTime: 30_000, // 30 seconds
    cacheTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    retry: 1,
  },

  // Image optimization
  image: {
    quality: 75, // JPEG quality
    placeholder: 'blur', // or 'empty' for no placeholder
  },
};

/**
 * Get animation variant based on performance settings
 */
export function getAnimationVariant(type: 'fade' | 'slide' | 'scale' = 'fade') {
  if (PERFORMANCE_CONFIG.reduceMotion) {
    return {
      initial: {},
      animate: {},
      exit: {},
    };
  }

  const duration = PERFORMANCE_CONFIG.animationDuration.fast;

  switch (type) {
    case 'fade':
      return {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
        transition: { duration },
      };
    case 'slide':
      return {
        initial: { opacity: 0, y: 8 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: 8 },
        transition: { duration },
      };
    case 'scale':
      return {
        initial: { opacity: 0, scale: 0.96 },
        animate: { opacity: 1, scale: 1 },
        exit: { opacity: 0, scale: 0.96 },
        transition: { duration },
      };
    default:
      return {};
  }
}

/**
 * Debounce function for input handlers
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };

    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle function for scroll/resize handlers
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;

  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * Check if user prefers reduced motion
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Lazy load component helper
 */
export function lazyWithPreload<T extends React.ComponentType<any>>(
  factory: () => Promise<{ default: T }>
) {
  const LazyComponent = React.lazy(factory);
  (LazyComponent as any).preload = factory;
  return LazyComponent;
}

// Export React for lazy helper
import React from 'react';
