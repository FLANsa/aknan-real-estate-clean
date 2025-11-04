// Performance optimization utilities

/**
 * Optimize Firebase Storage image URLs with query parameters
 */
export const optimizeImages = {
  // Generate optimized image URLs for different sizes
  getOptimizedUrl: (url: string, width?: number, height?: number, quality: number = 80) => {
    if (!url || url.includes('placeholder')) return url;
    
    // For Firebase Storage URLs, add resize parameters
    if (url.includes('firebasestorage.googleapis.com') || url.includes('storage.googleapis.com')) {
      const baseUrl = url.split('?')[0];
      const params = new URLSearchParams();
      
      // Add existing params if any
      const existingParams = url.includes('?') ? url.split('?')[1] : '';
      if (existingParams) {
        existingParams.split('&').forEach(param => {
          const [key, value] = param.split('=');
          if (key && value && key !== 'w' && key !== 'h' && key !== 'q') {
            params.append(key, value);
          }
        });
      }
      
      // Add optimization params
      params.append('alt', 'media');
      if (width) params.append('w', width.toString());
      if (height) params.append('h', height.toString());
      params.append('q', quality.toString());
      
      return `${baseUrl}?${params.toString()}`;
    }
    
    return url;
  },
  
  // Generate blur placeholder from SVG
  generateBlurDataURL: (width = 10, height = 10, color = '#f3f4f6') => {
    const svg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="${color}"/>
    </svg>`;
    return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
  },

  // Generate a simple blur placeholder (light gray)
  getSimpleBlurDataURL: () => {
    return 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q==';
  }
};

// Debounce utility for search and filters
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

// Lazy loading utility with Intersection Observer
export const lazyLoad = (callback: () => void, options?: IntersectionObserverInit) => {
  if (typeof window === 'undefined') return;
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        callback();
        observer.disconnect();
      }
    });
  }, {
    rootMargin: '50px',
    threshold: 0.01,
    ...options
  });
  
  return observer;
};

// Conditional logging - only log in development
export const logger = {
  log: (...args: any[]) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(...args);
    }
  },
  error: (...args: any[]) => {
    if (process.env.NODE_ENV === 'development') {
      console.error(...args);
    }
  },
  warn: (...args: any[]) => {
    if (process.env.NODE_ENV === 'development') {
      console.warn(...args);
    }
  }
};
