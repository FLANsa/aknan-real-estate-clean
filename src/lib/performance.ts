// Performance optimization utilities
export const optimizeImages = {
  // Generate optimized image URLs for different sizes
  getOptimizedUrl: (url: string, width: number, height: number) => {
    if (!url || url.includes('placeholder')) return url;
    
    // For Firebase Storage URLs, add resize parameters
    if (url.includes('firebasestorage.googleapis.com')) {
      const baseUrl = url.split('?')[0];
      return `${baseUrl}?alt=media&w=${width}&h=${height}&q=80`;
    }
    
    return url;
  },
  
  // Generate blur placeholder
  generateBlurDataURL: (width = 10, height = 10) => {
    return `data:image/svg+xml;base64,${Buffer.from(
      `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="#f3f4f6"/>
      </svg>`
    ).toString('base64')}`;
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

// Lazy loading utility
export const lazyLoad = (callback: () => void, options?: IntersectionObserverInit) => {
  if (typeof window === 'undefined') return;
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        callback();
        observer.disconnect();
      }
    });
  }, options);
  
  return observer;
};
