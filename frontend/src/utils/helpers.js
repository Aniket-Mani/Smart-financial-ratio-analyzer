/**
 * Smooth scroll to an element with offset
 * @param {string} elementId - The ID of the element to scroll to
 * @param {number} offset - Offset in pixels from the top (default: 100)
 * @param {string} behavior - Scroll behavior: 'smooth' or 'auto' (default: 'smooth')
 */
export const scrollToElement = (elementId, offset = 100, behavior = 'smooth') => {
  const element = document.getElementById(elementId);
  if (element) {
    const elementPosition = element.getBoundingClientRect().top;
    const offsetPosition = elementPosition + window.pageYOffset - offset;

    window.scrollTo({
      top: offsetPosition,
      behavior: behavior
    });
  }
};

/**
 * Smooth scroll to a specific Y position
 * @param {number} position - The Y position to scroll to
 * @param {string} behavior - Scroll behavior: 'smooth' or 'auto' (default: 'smooth')
 */
export const scrollToPosition = (position, behavior = 'smooth') => {
  window.scrollTo({
    top: position,
    behavior: behavior
  });
};

/**
 * Scroll to top of the page
 * @param {string} behavior - Scroll behavior: 'smooth' or 'auto' (default: 'smooth')
 */
export const scrollToTop = (behavior = 'smooth') => {
  window.scrollTo({
    top: 0,
    behavior: behavior
  });
};

/**
 * Scroll to bottom of the page
 * @param {string} behavior - Scroll behavior: 'smooth' or 'auto' (default: 'smooth')
 */
export const scrollToBottom = (behavior = 'smooth') => {
  window.scrollTo({
    top: document.documentElement.scrollHeight,
    behavior: behavior
  });
};

/**
 * Debounce function to limit the rate of function execution
 * @param {Function} func - The function to debounce
 * @param {number} wait - The delay in milliseconds
 * @returns {Function} - The debounced function
 */
export const debounce = (func, wait = 300) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * Throttle function to limit the rate of function execution
 * @param {Function} func - The function to throttle
 * @param {number} limit - The minimum time between executions in milliseconds
 * @returns {Function} - The throttled function
 */
export const throttle = (func, limit = 300) => {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

/**
 * Check if an element is in the viewport
 * @param {HTMLElement} element - The element to check
 * @param {number} offset - Offset in pixels (default: 0)
 * @returns {boolean} - True if element is in viewport
 */
export const isElementInViewport = (element, offset = 0) => {
  if (!element) return false;
  
  const rect = element.getBoundingClientRect();
  return (
    rect.top >= -offset &&
    rect.left >= -offset &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) + offset &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth) + offset
  );
};

/**
 * Add a stagger animation delay to elements
 * @param {NodeList|Array} elements - The elements to animate
 * @param {number} delayIncrement - The delay increment in milliseconds (default: 100)
 * @param {string} property - The CSS property to set (default: 'animationDelay')
 */
export const staggerAnimation = (elements, delayIncrement = 100, property = 'animationDelay') => {
  elements.forEach((element, index) => {
    element.style[property] = `${index * delayIncrement}ms`;
  });
};

/**
 * Generate a unique ID
 * @param {string} prefix - Optional prefix for the ID
 * @returns {string} - A unique ID
 */
export const generateUniqueId = (prefix = 'id') => {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Copy text to clipboard
 * @param {string} text - The text to copy
 * @returns {Promise<boolean>} - True if successful
 */
export const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error('Failed to copy text:', err);
    return false;
  }
};

/**
 * Format a number with commas
 * @param {number} number - The number to format
 * @returns {string} - The formatted number
 */
export const formatNumberWithCommas = (number) => {
  return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

/**
 * Clamp a number between a min and max value
 * @param {number} value - The value to clamp
 * @param {number} min - The minimum value
 * @param {number} max - The maximum value
 * @returns {number} - The clamped value
 */
export const clamp = (value, min, max) => {
  return Math.min(Math.max(value, min), max);
};

/**
 * Linear interpolation between two values
 * @param {number} start - The start value
 * @param {number} end - The end value
 * @param {number} t - The interpolation factor (0-1)
 * @returns {number} - The interpolated value
 */
export const lerp = (start, end, t) => {
  return start * (1 - t) + end * t;
};

/**
 * Wait for a specified amount of time
 * @param {number} ms - Milliseconds to wait
 * @returns {Promise} - Promise that resolves after the delay
 */
export const wait = (ms) => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * Get the scroll percentage of the page
 * @returns {number} - The scroll percentage (0-100)
 */
export const getScrollPercentage = () => {
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
  const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
  return (scrollTop / scrollHeight) * 100;
};

/**
 * Add smooth reveal animation when elements come into view
 * @param {string} selector - CSS selector for elements to observe
 * @param {Object} options - IntersectionObserver options
 */
export const observeElements = (selector, options = {}) => {
  const defaultOptions = {
    threshold: 0.1,
    rootMargin: '0px',
    ...options
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, defaultOptions);

  const elements = document.querySelectorAll(selector);
  elements.forEach(el => observer.observe(el));

  return observer;
};
