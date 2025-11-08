/**
 * LocalStorage Service
 * Handles persistence of custom ratios and developer mode state
 */

const STORAGE_KEYS = {
  DEV_MODE: 'financial_analyzer_dev_mode',
  CUSTOM_RATIOS: 'financial_analyzer_custom_ratios',
  USER_ID: 'financial_analyzer_user_id',
};

class LocalStorageService {
  /**
   * Get developer mode state
   * @returns {boolean} Developer mode enabled/disabled
   */
  getDevMode() {
    try {
      const value = localStorage.getItem(STORAGE_KEYS.DEV_MODE);
      return value === 'true';
    } catch (error) {
      console.error('Error reading dev mode from localStorage:', error);
      return false;
    }
  }

  /**
   * Set developer mode state
   * @param {boolean} enabled - Whether dev mode is enabled
   */
  setDevMode(enabled) {
    try {
      localStorage.setItem(STORAGE_KEYS.DEV_MODE, enabled.toString());
    } catch (error) {
      console.error('Error saving dev mode to localStorage:', error);
    }
  }

  /**
   * Get custom ratios from localStorage
   * @returns {Array} Array of custom ratio objects
   */
  getCustomRatios() {
    try {
      const ratios = localStorage.getItem(STORAGE_KEYS.CUSTOM_RATIOS);
      return ratios ? JSON.parse(ratios) : [];
    } catch (error) {
      console.error('Error reading custom ratios from localStorage:', error);
      return [];
    }
  }

  /**
   * Save custom ratios to localStorage
   * @param {Array} ratios - Array of custom ratio objects
   */
  setCustomRatios(ratios) {
    try {
      localStorage.setItem(STORAGE_KEYS.CUSTOM_RATIOS, JSON.stringify(ratios));
    } catch (error) {
      console.error('Error saving custom ratios to localStorage:', error);
      throw error;
    }
  }

  /**
   * Add a single custom ratio
   * @param {Object} ratio - Custom ratio object
   */
  addCustomRatio(ratio) {
    try {
      const ratios = this.getCustomRatios();
      ratios.push(ratio);
      this.setCustomRatios(ratios);
    } catch (error) {
      console.error('Error adding custom ratio:', error);
      throw error;
    }
  }

  /**
   * Update an existing custom ratio
   * @param {string} ratioId - ID of ratio to update
   * @param {Object} updatedRatio - Updated ratio object
   * @returns {boolean} Success status
   */
  updateCustomRatio(ratioId, updatedRatio) {
    try {
      const ratios = this.getCustomRatios();
      const index = ratios.findIndex(r => r.id === ratioId);
      
      if (index === -1) {
        console.warn(`Ratio with id ${ratioId} not found`);
        return false;
      }
      
      ratios[index] = { ...ratios[index], ...updatedRatio };
      this.setCustomRatios(ratios);
      return true;
    } catch (error) {
      console.error('Error updating custom ratio:', error);
      throw error;
    }
  }

  /**
   * Delete a custom ratio
   * @param {string} ratioId - ID of ratio to delete
   * @returns {boolean} Success status
   */
  deleteCustomRatio(ratioId) {
    try {
      const ratios = this.getCustomRatios();
      const filtered = ratios.filter(r => r.id !== ratioId);
      
      if (filtered.length === ratios.length) {
        console.warn(`Ratio with id ${ratioId} not found`);
        return false;
      }
      
      this.setCustomRatios(filtered);
      return true;
    } catch (error) {
      console.error('Error deleting custom ratio:', error);
      throw error;
    }
  }

  /**
   * Clear all custom ratios
   */
  clearCustomRatios() {
    try {
      localStorage.removeItem(STORAGE_KEYS.CUSTOM_RATIOS);
    } catch (error) {
      console.error('Error clearing custom ratios:', error);
      throw error;
    }
  }

  /**
   * Export custom ratios as JSON string
   * @returns {string} JSON string of custom ratios
   */
  exportCustomRatios() {
    try {
      const ratios = this.getCustomRatios();
      return JSON.stringify(ratios, null, 2);
    } catch (error) {
      console.error('Error exporting custom ratios:', error);
      throw error;
    }
  }

  /**
   * Import custom ratios from JSON string
   * @param {string} jsonString - JSON string containing ratios
   * @param {boolean} merge - Whether to merge with existing ratios or replace
   * @returns {number} Number of ratios imported
   */
  importCustomRatios(jsonString, merge = false) {
    try {
      const importedRatios = JSON.parse(jsonString);
      
      if (!Array.isArray(importedRatios)) {
        throw new Error('Imported data must be an array of ratios');
      }
      
      if (merge) {
        const existingRatios = this.getCustomRatios();
        const existingIds = new Set(existingRatios.map(r => r.id));
        
        // Add only new ratios (avoid duplicates by ID)
        const newRatios = importedRatios.filter(r => !existingIds.has(r.id));
        const mergedRatios = [...existingRatios, ...newRatios];
        
        this.setCustomRatios(mergedRatios);
        return newRatios.length;
      } else {
        this.setCustomRatios(importedRatios);
        return importedRatios.length;
      }
    } catch (error) {
      console.error('Error importing custom ratios:', error);
      throw error;
    }
  }

  /**
   * Get user ID (for backend API calls)
   * @returns {string} User ID
   */
  getUserId() {
    try {
      let userId = localStorage.getItem(STORAGE_KEYS.USER_ID);
      if (!userId) {
        userId = 'default'; // Default user ID for single-user setup
        localStorage.setItem(STORAGE_KEYS.USER_ID, userId);
      }
      return userId;
    } catch (error) {
      console.error('Error reading user ID:', error);
      return 'default';
    }
  }

  /**
   * Get all stored data (for debugging)
   * @returns {Object} All stored data
   */
  getAllData() {
    return {
      devMode: this.getDevMode(),
      customRatios: this.getCustomRatios(),
      userId: this.getUserId(),
    };
  }

  /**
   * Clear all data
   */
  clearAll() {
    try {
      Object.values(STORAGE_KEYS).forEach(key => {
        localStorage.removeItem(key);
      });
    } catch (error) {
      console.error('Error clearing all data:', error);
      throw error;
    }
  }
}

// Export singleton instance
export default new LocalStorageService();
