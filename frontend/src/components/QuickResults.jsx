import React from 'react';
import { TrendingUp, TrendingDown, Activity, DollarSign, Shield, Zap, AlertCircle, CheckCircle, Info } from 'lucide-react';

const QuickResults = ({ ratios, extractedData }) => {
  if (!ratios || Object.keys(ratios).length === 0) return null;

  const currentYear = extractedData?.current_year || extractedData;
  const previousYear = extractedData?.previous_year;
  const allYears = extractedData?.all_years || [];
  const hasMultiYear = allYears.length > 1 || (previousYear && Object.keys(previousYear).length > 0);

  const getCategoryConfig = (category) => {
    const configs = {
      liquidity: {
        color: '#2196F3',
        bgColor: '#E3F2FD',
        icon: Activity,
        emoji: '💧'
      },
      profitability: {
        color: '#4CAF50',
        bgColor: '#E8F5E9',
        icon: DollarSign,
        emoji: '💰'
      },
      solvency: {
        color: '#7B1FA2',
        bgColor: '#F3E5F5',
        icon: Shield,
        emoji: '🏦'
      },
      efficiency: {
        color: '#FF9800',
        bgColor: '#FFF3E0',
        icon: Zap,
        emoji: '⚡'
      },
    };
    return configs[category] || configs.liquidity;
  };

  const getRatioStatus = (name, value) => {
    const numValue = parseFloat(value);
    
    const thresholds = {
      current_ratio: { good: 1.5, warning: 1.0 },
      quick_ratio: { good: 1.0, warning: 0.5 },
      debt_to_equity: { good: 1.0, warning: 2.0, inverse: true },
      debt_ratio: { good: 50, warning: 70, inverse: true },
      interest_coverage: { good: 2.5, warning: 1.5 },
    };

    const threshold = thresholds[name];
    if (!threshold) return 'neutral';

    if (threshold.inverse) {
      if (numValue <= threshold.good) return 'good';
      if (numValue <= threshold.warning) return 'warning';
      return 'poor';
    } else {
      if (numValue >= threshold.good) return 'good';
      if (numValue >= threshold.warning) return 'warning';
      return 'poor';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'good': return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'warning': return <AlertCircle className="w-5 h-5 text-yellow-600" />;
      case 'poor': return <TrendingDown className="w-5 h-5 text-red-600" />;
      default: return <Info className="w-5 h-5 text-blue-600" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'good': return '#4CAF50';
      case 'warning': return '#FF9800';
      case 'poor': return '#F44336';
      default: return '#9E9E9E';
    }
  };

  const getValuesUsed = (ratioName, data) => {
    if (!data) return [];

    const valueMapping = {
      current_ratio: [
        { label: 'Current Assets', path: 'current_assets.total' },
        { label: 'Current Liabilities', path: 'current_liabilities.total' }
      ],
      quick_ratio: [
        { label: 'Current Assets', path: 'current_assets.total' },
        { label: 'Inventories', path: 'current_assets.breakdown.inventories' },
        { label: 'Current Liabilities', path: 'current_liabilities.total' }
      ],
      gross_profit_margin: [
        { label: 'Gross Profit', path: 'income_statement.gross_profit' },
        { label: 'Revenue', path: 'income_statement.revenue' }
      ],
      net_profit_margin: [
        { label: 'Net Income', path: 'income_statement.net_income' },
        { label: 'Revenue', path: 'income_statement.revenue' }
      ],
      return_on_equity: [
        { label: 'Net Income', path: 'income_statement.net_income' },
        { label: 'Avg Total Equity', path: 'equity.total', isAverage: hasMultiYear }
      ],
      return_on_assets: [
        { label: 'Net Income', path: 'income_statement.net_income' },
        { label: 'Avg Total Assets', path: 'totals.total_assets', isAverage: hasMultiYear }
      ],
      debt_to_equity: [
        { label: 'Total Liabilities', path: 'totals.total_liabilities' },
        { label: 'Total Equity', path: 'equity.total' }
      ],
      debt_ratio: [
        { label: 'Total Liabilities', path: 'totals.total_liabilities' },
        { label: 'Total Assets', path: 'totals.total_assets' }
      ],
      interest_coverage: [
        { label: 'EBIT', path: 'income_statement.ebit' },
        { label: 'Interest Expense', path: 'income_statement.interest_expense' }
      ],
      asset_turnover: [
        { label: 'Revenue', path: 'income_statement.revenue' },
        { label: 'Avg Total Assets', path: 'totals.total_assets', isAverage: hasMultiYear }
      ],
      fixed_asset_turnover: [
        { label: 'Revenue', path: 'income_statement.revenue' },
        { label: 'Avg Fixed Assets', path: 'non_current_assets.breakdown.fixed_assets', isAverage: hasMultiYear }
      ],
      inventory_turnover: [
        { label: 'Revenue', path: 'income_statement.revenue' },
        { label: 'Avg Inventories', path: 'current_assets.breakdown.inventories', isAverage: hasMultiYear }
      ],
    };

    const mapping = valueMapping[ratioName] || [];
    return mapping.map(item => {
      const parts = item.path.split('.');
      let value = data;
      for (const part of parts) {
        value = value?.[part];
      }
      
      if (item.isAverage && previousYear) {
        let prevValue = previousYear;
        for (const part of parts) {
          prevValue = prevValue?.[part];
        }
        if (value !== null && prevValue !== null) {
          value = (value + prevValue) / 2;
        }
      }
      
      return { ...item, value };
    }).filter(v => v.value !== null && v.value !== undefined);
  };

  return (
    <div className="space-y-6">
      {/* Multi-year Indicator */}
      {hasMultiYear && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 animate-fadeIn">
          <div className="flex gap-3">
            <TrendingUp className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-blue-900">Multi-Year Analysis Active</p>
              <p className="text-sm text-blue-700 mt-0.5">
                {allYears.length > 1 
                  ? `Ratios use averaged values from ${allYears.length} years (${allYears.map(y => y.year).join(', ')}) for accuracy.`
                  : `Ratios use averaged values from ${previousYear?.year || 'previous'} & ${currentYear?.year || 'current'} for accuracy.`
                }
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Category Sections */}
      {Object.entries(ratios).map(([category, categoryRatios], catIndex) => {
        if (Object.keys(categoryRatios).length === 0) return null;
        
        const config = getCategoryConfig(category);
        const CategoryIcon = config.icon;

        return (
          <div key={category} className="animate-fadeIn">
            {/* Category Header */}
            <div className="mb-4 p-4 rounded-lg" style={{ backgroundColor: config.bgColor }}>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded flex items-center justify-center" style={{ backgroundColor: config.color + '20' }}>
                  <CategoryIcon className="w-5 h-5" style={{ color: config.color }} />
                </div>
                <div>
                  <h2 className="text-lg font-medium text-gray-900 capitalize">
                    {config.emoji} {category} Ratios
                  </h2>
                  <p className="text-xs text-gray-600 mt-0.5">
                    {Object.keys(categoryRatios).length} metrics
                  </p>
                </div>
              </div>
            </div>

            {/* Ratio Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(categoryRatios).map(([name, data]) => {
                const isNA = data.value === 'N/A' || data.value === null || data.value === undefined;
                const status = isNA ? 'poor' : getRatioStatus(name, data.value);
                const statusColor = getStatusColor(status);
                
                return (
                  <div 
                    key={name}
                    className="bg-white rounded-lg border border-gray-200 shadow-1 hover:shadow-2 transition-all p-4"
                    style={{ borderLeftColor: statusColor, borderLeftWidth: '4px' }}
                  >
                    {/* Header */}
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-sm font-medium text-gray-900 capitalize">
                          {name.replace(/_/g, ' ')}
                        </h3>
                        {data.is_custom && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gradient-to-r from-purple-100 to-indigo-100 text-purple-800 border border-purple-200">
                            Custom
                          </span>
                        )}
                      </div>
                      <div className="text-right flex-shrink-0">
                        {isNA ? (
                          <AlertCircle className="w-5 h-5 text-gray-400" />
                        ) : (
                          getStatusIcon(status)
                        )}
                      </div>
                    </div>

                    {/* Value */}
                    <div className="mb-3">
                      <p className={`text-2xl font-semibold ${isNA ? 'text-gray-400' : 'text-gray-900'}`}>
                        {isNA ? 'N/A' : `${data.value}${data.unit || ''}`}
                      </p>
                      {data.data_quality && data.data_quality !== 'complete' && (
                        <span className="text-xs font-medium px-2 py-1 rounded bg-yellow-100 text-yellow-700 mt-1 inline-block">
                          {data.data_quality}
                        </span>
                      )}
                    </div>

                    {/* Formula */}
                    <div className="text-xs p-2 bg-gray-100 rounded mb-2 border border-gray-200">
                      <span className="font-semibold text-gray-900">Formula:</span>{' '}
                      <span className="text-gray-800 font-mono text-xs">{data.formula}</span>
                    </div>

                    {/* Interpretation */}
                    <p className={`text-xs leading-relaxed ${isNA ? 'text-gray-500 italic' : 'text-gray-700'}`}>
                      {data.interpretation}
                    </p>

                    {/* Missing Fields Warning */}
                    {data.missing_fields && data.missing_fields.filter(f => f).length > 0 && (
                      <div className="mt-2 text-xs text-orange-600 bg-orange-50 p-2 rounded">
                        <strong>Missing:</strong> {data.missing_fields.filter(f => f).join(', ')}
                      </div>
                    )}

                    {/* Note if available */}
                    {data.note && (
                      <div className="mt-2 text-xs text-blue-600 bg-blue-50 p-2 rounded">
                        <strong>Note:</strong> {data.note}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default QuickResults;
