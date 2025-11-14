import axios from 'axios';

// API Base URL - reads from environment variable or defaults to localhost
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 60000, // 60 second timeout for file uploads
});

// API Service object with all methods
const api = {
  /**
   * Upload and analyze financial statement(s) - supports multiple files
   * @param {File|File[]} files - The image/PDF file(s) to analyze
   * @returns {Promise} - Analysis results
   */
  analyzeStatement: async (files) => {
    const formData = new FormData();
    
    // Handle both single file and array of files
    if (Array.isArray(files)) {
      files.forEach(file => {
        formData.append('files', file);
      });
    } else {
      formData.append('files', files);
    }
    
    try {
      const response = await apiClient.post('/analyze', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * Calculate ratios from manually entered financial data
   * @param {Object} financialData - Financial data object
   * @returns {Promise} - Calculated ratios
   */
  calculateRatios: async (financialData) => {
    try {
      const response = await apiClient.post('/calculate-ratios', financialData);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * Health check endpoint
   * @returns {Promise} - Server health status
   */
  healthCheck: async () => {
    try {
      const response = await axios.get('http://localhost:8000/health');
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // ==================== CUSTOM RATIOS API ====================

  /**
   * Recalculate ratios with custom ratios
   * @param {Object} extractedData - Financial data from analysis
   * @param {Array} customRatios - Array of custom ratio objects
   * @param {boolean} devMode - Whether developer mode is enabled
   * @returns {Promise} - Recalculated ratios
   */
  recalculateRatios: async (extractedData, customRatios = [], devMode = false) => {
    try {
      const response = await apiClient.post('/recalculate', {
        extracted_data: extractedData,
        custom_ratios: customRatios,
        dev_mode: devMode,
      });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * Load custom ratios from backend
   * @param {string} userId - User ID (default: 'default')
   * @returns {Promise} - Array of custom ratios
   */
  loadCustomRatios: async (userId = 'default') => {
    try {
      const response = await apiClient.get(`/custom-ratios/${userId}`);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * Save custom ratios to backend (replaces all)
   * @param {Array} ratios - Array of custom ratio objects
   * @param {string} userId - User ID (default: 'default')
   * @returns {Promise} - Save confirmation
   */
  saveCustomRatios: async (ratios, userId = 'default') => {
    try {
      const response = await apiClient.post('/custom-ratios', {
        ratios,
        user_id: userId,
      });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * Add a single custom ratio
   * @param {Object} ratio - Custom ratio object
   * @param {string} userId - User ID (default: 'default')
   * @returns {Promise} - Add confirmation with updated list
   */
  addCustomRatio: async (ratio, userId = 'default') => {
    try {
      const response = await apiClient.post('/custom-ratios/add', {
        ratio,
        user_id: userId,
      });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * Delete a custom ratio
   * @param {string} ratioId - ID of ratio to delete
   * @param {string} userId - User ID (default: 'default')
   * @returns {Promise} - Delete confirmation
   */
  deleteCustomRatio: async (ratioId, userId = 'default') => {
    try {
      const response = await apiClient.delete(`/custom-ratios/${ratioId}`, {
        params: { user_id: userId },
      });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * Clear all custom ratios
   * @param {string} userId - User ID (default: 'default')
   * @returns {Promise} - Clear confirmation
   */
  clearCustomRatios: async (userId = 'default') => {
    try {
      const response = await apiClient.delete('/custom-ratios', {
        params: { user_id: userId },
      });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * Get available variables for formula building
   * @returns {Promise} - List of available financial variables
   */
  getAvailableVariables: async () => {
    try {
      const response = await apiClient.get('/available-variables');
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },
};

/**
 * Handle API errors and format them consistently
 * @param {Error} error - Axios error object
 * @returns {Error} - Formatted error
 */
const handleApiError = (error) => {
  if (error.response) {
    // Server responded with error status
    const message = error.response.data?.detail || error.response.data?.message || 'Server error occurred';
    return new Error(message);
  } else if (error.request) {
    // Request made but no response
    return new Error('No response from server. Please check if the backend is running.');
  } else {
    // Something else happened
    return new Error(error.message || 'An unexpected error occurred');
  }
};

export default api;

// Named exports for individual methods
export const { 
  analyzeStatement, 
  calculateRatios, 
  healthCheck,
  recalculateRatios,
  loadCustomRatios,
  saveCustomRatios,
  addCustomRatio,
  deleteCustomRatio,
  clearCustomRatios,
  getAvailableVariables,
} = api;
