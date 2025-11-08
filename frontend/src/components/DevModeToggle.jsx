import React from 'react';
import { Code } from 'lucide-react';

/**
 * DevModeToggle Component
 * Toggle button for enabling/disabling developer mode
 * Shows custom ratio management features when enabled
 */
const DevModeToggle = ({ devMode, onToggle, className = '' }) => {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <button
        onClick={onToggle}
        className={`
          relative inline-flex items-center gap-2 px-4 py-2 rounded-lg
          font-medium text-sm transition-all duration-200
          ${devMode 
            ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50' 
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-300'
          }
        `}
        title={devMode ? 'Disable Developer Mode' : 'Enable Developer Mode'}
      >
        <Code className="w-4 h-4" />
        <span>Developer Mode</span>
        {devMode && (
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
        )}
      </button>

      {devMode && (
        <div className="flex items-center gap-2 px-3 py-1.5 bg-purple-50 border border-purple-200 rounded-lg text-xs text-purple-700">
          <span className="font-medium">Custom Ratios Active</span>
        </div>
      )}
    </div>
  );
};

export default DevModeToggle;
