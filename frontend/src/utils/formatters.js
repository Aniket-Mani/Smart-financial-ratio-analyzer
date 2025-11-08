/**
 * Format a number as currency
 * @param {number} value - The number to format
 * @param {string} currency - Currency symbol (default: $)
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (value, currency = '$') => {
  if (value === null || value === undefined) return 'N/A';
  return `${currency}${Number(value).toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;
};

/**
 * Format a number as percentage
 * @param {number} value - The number to format
 * @param {number} decimals - Number of decimal places (default: 2)
 * @returns {string} Formatted percentage string
 */
export const formatPercentage = (value, decimals = 2) => {
  if (value === null || value === undefined) return 'N/A';
  return `${Number(value).toFixed(decimals)}%`;
};

/**
 * Format large numbers with abbreviations (K, M, B)
 * @param {number} value - The number to format
 * @returns {string} Formatted number string
 */
export const formatNumber = (value) => {
  if (value === null || value === undefined) return 'N/A';
  
  const num = Number(value);
  
  if (num >= 1000000000) {
    return `${(num / 1000000000).toFixed(1)}B`;
  }
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  }
  return num.toFixed(0);
};

/**
 * Convert snake_case to Title Case
 * @param {string} str - Snake case string
 * @returns {string} Title case string
 */
export const toTitleCase = (str) => {
  return str
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

/**
 * Get status color based on ratio value
 * @param {string} ratioName - Name of the ratio
 * @param {number} value - Ratio value
 * @returns {object} Object with status and color
 */
export const getRatioStatus = (ratioName, value) => {
  // Liquidity Ratios
  if (ratioName === 'current_ratio') {
    if (value >= 2.0) return { status: 'Good', color: 'green' };
    if (value >= 1.5) return { status: 'Average', color: 'yellow' };
    return { status: 'Poor', color: 'red' };
  }
  
  if (ratioName === 'quick_ratio') {
    if (value >= 1.0) return { status: 'Good', color: 'green' };
    if (value >= 0.7) return { status: 'Average', color: 'yellow' };
    return { status: 'Poor', color: 'red' };
  }

  // Profitability Ratios
  if (ratioName === 'net_profit_margin') {
    if (value >= 10) return { status: 'Good', color: 'green' };
    if (value >= 5) return { status: 'Average', color: 'yellow' };
    return { status: 'Poor', color: 'red' };
  }

  if (ratioName === 'return_on_equity') {
    if (value >= 15) return { status: 'Good', color: 'green' };
    if (value >= 10) return { status: 'Average', color: 'yellow' };
    return { status: 'Poor', color: 'red' };
  }

  // Solvency Ratios
  if (ratioName === 'debt_to_equity') {
    if (value <= 1.0) return { status: 'Good', color: 'green' };
    if (value <= 2.0) return { status: 'Average', color: 'yellow' };
    return { status: 'Poor', color: 'red' };
  }

  if (ratioName === 'interest_coverage') {
    if (value >= 5.0) return { status: 'Good', color: 'green' };
    if (value >= 2.5) return { status: 'Average', color: 'yellow' };
    return { status: 'Poor', color: 'red' };
  }

  // Default
  return { status: 'N/A', color: 'gray' };
};

/**
 * Get color classes for Tailwind CSS based on status color
 * @param {string} color - Color name (green, yellow, red, gray)
 * @returns {object} Object with Tailwind CSS classes
 */
export const getStatusClasses = (color) => {
  const classes = {
    green: {
      bg: 'bg-green-50',
      border: 'border-green-500',
      text: 'text-green-700',
      badge: 'bg-green-100 text-green-800',
    },
    yellow: {
      bg: 'bg-yellow-50',
      border: 'border-yellow-500',
      text: 'text-yellow-700',
      badge: 'bg-yellow-100 text-yellow-800',
    },
    red: {
      bg: 'bg-red-50',
      border: 'border-red-500',
      text: 'text-red-700',
      badge: 'bg-red-100 text-red-800',
    },
    gray: {
      bg: 'bg-gray-50',
      border: 'border-gray-500',
      text: 'text-gray-700',
      badge: 'bg-gray-100 text-gray-800',
    },
  };

  return classes[color] || classes.gray;
};
