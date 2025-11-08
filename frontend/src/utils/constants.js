/**
 * Industry benchmark ranges for financial ratios
 */
export const RATIO_BENCHMARKS = {
  current_ratio: { good: 2.0, average: 1.5, poor: 1.0 },
  quick_ratio: { good: 1.0, average: 0.7, poor: 0.5 },
  net_profit_margin: { good: 10, average: 5, poor: 2 },
  gross_profit_margin: { good: 30, average: 20, poor: 10 },
  return_on_equity: { good: 15, average: 10, poor: 5 },
  return_on_assets: { good: 8, average: 5, poor: 2 },
  debt_to_equity: { good: 1.0, average: 2.0, poor: 3.0 },
  interest_coverage: { good: 5.0, average: 2.5, poor: 1.5 },
};

/**
 * Ratio category icons
 */
export const RATIO_ICONS = {
  liquidity: '💧',
  profitability: '💰',
  solvency: '🏦',
  efficiency: '⚡',
};

/**
 * Ratio category descriptions
 */
export const RATIO_DESCRIPTIONS = {
  liquidity: 'Measures ability to meet short-term obligations',
  profitability: 'Measures ability to generate profit',
  solvency: 'Measures long-term financial stability',
  efficiency: 'Measures how effectively assets are used',
};

/**
 * Supported file types
 */
export const SUPPORTED_FILE_TYPES = ['.pdf', '.png', '.jpg', '.jpeg', '.tiff', '.bmp'];

/**
 * Maximum file size (in bytes)
 */
export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

/**
 * API endpoints
 */
export const API_ENDPOINTS = {
  ANALYZE: '/analyze',
  CALCULATE_RATIOS: '/calculate-ratios',
  HEALTH: '/health',
};
