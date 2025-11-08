import React from 'react';
import { Download } from 'lucide-react';

const RatioSelector = ({ 
  selectedRatios, 
  onToggleRatio, 
  onQuickAnalysis, 
  onGenerateReport,
  disabled 
}) => {
  const ratioCategories = [
    { key: 'liquidity', label: 'Liquidity', icon: '💧' },
    { key: 'profitability', label: 'Profitability', icon: '💰' },
    { key: 'solvency', label: 'Solvency', icon: '🏦' },
    { key: 'efficiency', label: 'Efficiency', icon: '⚡' },
  ];

  return (
    <div className="bg-white rounded-lg shadow-2 p-6 mb-6 animate-fadeIn border border-gray-200">
      <h2 className="text-xl font-medium text-gray-900 mb-6">
        Select Ratios to Calculate
      </h2>
      
      {/* Ratio Checkboxes */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {ratioCategories.map(({ key, label, icon }) => (
          <label 
            key={key} 
            className="flex items-center space-x-3 cursor-pointer p-3 rounded-lg hover:bg-gray-50 transition-colors border border-gray-200 hover:border-blue-300"
            style={{ transition: 'all 250ms cubic-bezier(0.4, 0, 0.2, 1)' }}
          >
            <input
              type="checkbox"
              checked={selectedRatios[key]}
              onChange={() => onToggleRatio(key)}
              disabled={disabled}
              className="w-4 h-4 text-blue-600 rounded cursor-pointer"
            />
            <span className="text-sm text-gray-700 font-medium">
              {icon} {label}
            </span>
          </label>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col md:flex-row gap-3">
        <button
          onClick={onQuickAnalysis}
          disabled={disabled}
          className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white py-2.5 px-4 rounded-lg font-medium text-sm uppercase tracking-wider transition-all duration-200 shadow-2 hover:shadow-4 disabled:shadow-none flex items-center justify-center gap-2"
          style={{ transition: 'all 250ms cubic-bezier(0.4, 0, 0.2, 1)' }}
        >
          Quick Analysis
        </button>
        <button
          onClick={onGenerateReport}
          disabled={disabled}
          className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white py-2.5 px-4 rounded-lg font-medium text-sm uppercase tracking-wider transition-all duration-200 shadow-2 hover:shadow-4 disabled:shadow-none flex items-center justify-center gap-2"
          style={{ transition: 'all 250ms cubic-bezier(0.4, 0, 0.2, 1)' }}
        >
          <Download className="inline-block w-4 h-4" />
          PDF Report
        </button>
      </div>
    </div>
  );
};

export default RatioSelector;
