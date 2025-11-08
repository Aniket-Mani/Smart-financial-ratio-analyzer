import React, { useState } from 'react';
import { FileText, BarChart3, GitCompare } from 'lucide-react';
import ExtractedDataDisplay from './ExtractedDataDisplay';
import QuickResults from './QuickResults';

const TabbedView = ({ extractedData, ratios }) => {
  const [activeTab, setActiveTab] = useState('data');

  // Get all years for multi-year comparison
  const allYears = extractedData?.all_years || [];
  const currentYear = extractedData?.current_year || extractedData;
  const previousYear = extractedData?.previous_year;
  
  // Check if we have multiple years - either from all_years array OR from previous_year being populated
  const hasPreviousYearData = previousYear && typeof previousYear === 'object' && 
    Object.keys(previousYear).length > 0 && 
    Object.keys(previousYear).some(key => key !== 'year' && previousYear[key] !== null && previousYear[key] !== undefined);
  
  const hasMultipleYears = allYears.length > 1 || hasPreviousYearData;
  
  // Build years array for comparison - use all_years if available, otherwise construct from current/previous
  const yearsForComparison = allYears.length > 0 ? allYears : 
    (hasPreviousYearData ? [currentYear, previousYear] : [currentYear]);

  const tabs = [
    {
      id: 'data',
      label: 'Extracted Data',
      icon: FileText,
      badge: null,
    },
    {
      id: 'ratios',
      label: 'Financial Ratios',
      icon: BarChart3,
      badge: ratios ? Object.values(ratios).reduce((sum, cat) => sum + Object.keys(cat).length, 0) : 0,
    },
    {
      id: 'comparison',
      label: 'Year Comparison',
      icon: GitCompare,
      badge: hasMultipleYears ? `${yearsForComparison.length}Y` : null,
      disabled: !hasMultipleYears,
    },
  ];

  const renderComparison = () => {
    if (!hasMultipleYears) {
      return (
        <div className="text-center py-20">
          <GitCompare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg font-medium">No multi-year data available</p>
          <p className="text-gray-400 text-sm mt-2">Upload financial statements with multiple years to see comparisons</p>
        </div>
      );
    }

    const compareMetrics = [
      { label: 'Total Assets', path: 'totals.total_assets' },
      { label: 'Total Liabilities', path: 'totals.total_liabilities' },
      { label: 'Total Equity', path: 'totals.total_equity' },
      { label: 'Revenue', path: 'income_statement.revenue' },
      { label: 'Net Income', path: 'income_statement.net_income' },
      { label: 'Gross Profit', path: 'income_statement.gross_profit' },
      { label: 'Current Assets', path: 'current_assets.total' },
      { label: 'Current Liabilities', path: 'current_liabilities.total' },
    ];

    const getNestedValue = (obj, path) => {
      // Add null check to prevent crashes
      if (!obj) return null;
      return path.split('.').reduce((current, prop) => current?.[prop], obj);
    };

    // Calculate change percentages between consecutive years
    const getChange = (newer, older) => {
      if (newer === null || newer === undefined || older === null || older === undefined || older === 0) return 'N/A';
      const numNewer = typeof newer === 'number' ? newer : parseFloat(newer);
      const numOlder = typeof older === 'number' ? older : parseFloat(older);
      if (isNaN(numNewer) || isNaN(numOlder)) return 'N/A';
      return (((numNewer - numOlder) / numOlder) * 100).toFixed(1);
    };

    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-6 text-white">
          <div className="flex items-center gap-3 mb-2">
            <GitCompare className="w-6 h-6" />
            <h2 className="text-xl font-bold">Multi-Year Comparison</h2>
          </div>
          <p className="text-blue-100 text-sm">
            Comparing {yearsForComparison.length} years: {yearsForComparison.map(y => y?.year || 'N/A').join(' → ')}
          </p>
        </div>

        {/* Comparison Table */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider sticky left-0 bg-gray-50">
                  Metric
                </th>
                {yearsForComparison.map((year, index) => (
                  <th key={index} className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    {year?.year || `Year ${index + 1}`}
                  </th>
                ))}
                {yearsForComparison.length > 1 && (
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider bg-blue-50">
                    Overall Change
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {compareMetrics.map((metric, metricIndex) => {
                const values = yearsForComparison.map(year => getNestedValue(year, metric.path));
                
                // Skip if all values are null
                if (values.every(v => v === null || v === undefined)) return null;

                const firstValue = values[0];
                const lastValue = values[values.length - 1];
                const overallChange = getChange(lastValue, firstValue);
                const isPositive = overallChange !== 'N/A' && parseFloat(overallChange) > 0;
                const isNegative = overallChange !== 'N/A' && parseFloat(overallChange) < 0;

                return (
                  <tr key={metricIndex} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900 sticky left-0 bg-white">
                      {metric.label}
                    </td>
                    {values.map((value, valueIndex) => (
                      <td key={valueIndex} className={`px-6 py-4 text-sm text-right font-mono ${
                        valueIndex === 0 ? 'text-gray-600' : 'text-gray-900 font-semibold'
                      }`}>
                        ${value != null && value !== undefined ? value.toLocaleString() : 'N/A'}
                      </td>
                    ))}
                    {yearsForComparison.length > 1 && (
                      <td className={`px-6 py-4 text-sm text-right font-mono font-bold bg-blue-50 ${
                        isPositive ? 'text-green-600' : isNegative ? 'text-red-600' : 'text-gray-600'
                      }`}>
                        {overallChange !== 'N/A' ? (
                          <>
                            {parseFloat(overallChange) > 0 && '+'}
                            {overallChange}%
                          </>
                        ) : 'N/A'}
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Visual Indicators */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {['totals.total_assets', 'income_statement.revenue', 'income_statement.net_income'].map((path, idx) => {
            const prevValue = getNestedValue(previousYear, path);
            const currValue = getNestedValue(currentYear, path);
            const change = (currValue || 0) - (prevValue || 0);
            const changePercent = prevValue !== 0 && prevValue !== null && prevValue !== undefined
              ? ((change / prevValue) * 100).toFixed(1)
              : 0;

            const labels = ['Total Assets', 'Revenue', 'Net Income'];
            const isPositive = change > 0;

            return (
              <div key={idx} className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                <p className="text-sm font-medium text-gray-600 mb-2">{labels[idx]}</p>
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-2xl font-bold text-gray-900">
                      ${currValue != null && currValue !== undefined ? (currValue / 1000).toFixed(1) : '0'}K
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      vs ${prevValue != null && prevValue !== undefined ? (prevValue / 1000).toFixed(1) : '0'}K
                    </p>
                  </div>
                  <div className={`text-right ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                    <p className="text-lg font-bold">
                      {parseFloat(changePercent) > 0 && '+'}{changePercent}%
                    </p>
                    <p className="text-xs">YoY</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Tab Navigation */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-2">
        <div className="flex gap-2 overflow-x-auto">
          {tabs.map((tab) => {
            const IconComponent = tab.icon;
            const isActive = activeTab === tab.id;
            const isDisabled = tab.disabled;

            return (
              <button
                key={tab.id}
                onClick={() => !isDisabled && setActiveTab(tab.id)}
                disabled={isDisabled}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md'
                    : isDisabled
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
                style={{ transition: 'all 250ms cubic-bezier(0.4, 0, 0.2, 1)' }}
              >
                <IconComponent className="w-4 h-4" />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                    isActive ? 'bg-white/20 text-white' : 'bg-blue-100 text-blue-700'
                  }`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div className="animate-fadeIn">
        {activeTab === 'data' && (
          <ExtractedDataDisplay data={extractedData} />
        )}

        {activeTab === 'ratios' && ratios && (
          <div className="space-y-4">
            <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
              <h2 className="text-xl font-semibold text-gray-900">Financial Ratios Analysis</h2>
              <p className="text-sm text-gray-500 mt-1">
                Comprehensive financial metrics and performance indicators
              </p>
            </div>
            <QuickResults ratios={ratios} extractedData={extractedData} />
          </div>
        )}

        {activeTab === 'comparison' && renderComparison()}
      </div>
    </div>
  );
};

export default TabbedView;
