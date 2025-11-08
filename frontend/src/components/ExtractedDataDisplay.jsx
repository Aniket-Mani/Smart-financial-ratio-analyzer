import React, { useState } from 'react';
import { 
  ChevronDown, 
  ChevronRight, 
  Calendar, 
  TrendingUp, 
  Layers,
  DollarSign,
  FileText,
  BarChart3,
  Briefcase,
  Shield,
  Wallet
} from 'lucide-react';

const ExtractedDataDisplay = ({ data }) => {
  const [selectedYearIndex, setSelectedYearIndex] = useState(0);
  const [expanded, setExpanded] = useState({
    current_assets: true,
    non_current_assets: false,
    current_liabilities: false,
    non_current_liabilities: false,
    equity: false,
    income_statement: false,
  });

  if (!data) return null;

  // Support both all_years array and legacy current_year/previous_year structure
  const allYears = data.all_years && data.all_years.length > 0 
    ? data.all_years 
    : [data.current_year || data, data.previous_year].filter(y => y && Object.keys(y).length > 0);
  
  const displayData = allYears[selectedYearIndex] || allYears[0];
  const hasMultipleYears = allYears.length > 1;

  const toggleSection = (section) => {
    setExpanded(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const getSectionConfig = (sectionKey) => {
    const configs = {
      current_assets: {
        icon: Wallet,
        color: '#00897B',
        lightBg: '#E0F2F1',
        borderColor: '#4DB6AC',
      },
      non_current_assets: {
        icon: Briefcase,
        color: '#1976D2',
        lightBg: '#E3F2FD',
        borderColor: '#64B5F6',
      },
      current_liabilities: {
        icon: FileText,
        color: '#F57C00',
        lightBg: '#FFF3E0',
        borderColor: '#FFB74D',
      },
      non_current_liabilities: {
        icon: Shield,
        color: '#C2185B',
        lightBg: '#FCE4EC',
        borderColor: '#F48FB1',
      },
      equity: {
        icon: TrendingUp,
        color: '#7B1FA2',
        lightBg: '#F3E5F5',
        borderColor: '#CE93D8',
      },
      income_statement: {
        icon: BarChart3,
        color: '#0097A7',
        lightBg: '#E0F7FA',
        borderColor: '#80DEEA',
      },
    };
    return configs[sectionKey] || configs.current_assets;
  };

  const renderSection = (title, sectionData, sectionKey) => {
    if (!sectionData) return null;

    const isExpanded = expanded[sectionKey];
    const total = sectionData.total;
    const breakdown = sectionData.breakdown || {};
    const config = getSectionConfig(sectionKey);
    const IconComponent = config.icon;

    return (
      <div key={sectionKey} className="mb-4 animate-fadeIn" style={{ transition: 'all 250ms cubic-bezier(0.4, 0, 0.2, 1)' }}>
        {/* Section Header - Collapsible */}
        <div 
          onClick={() => toggleSection(sectionKey)}
          className="bg-white rounded-lg border border-gray-200 shadow-1 hover:shadow-2 cursor-pointer transition-all duration-200"
          style={{ padding: '1.5rem' }}
        >
          <div className="flex items-center justify-between gap-4">
            {/* Left Side - Icon + Title */}
            <div className="flex items-center gap-3 flex-1 min-w-0">
              {/* Icon Background */}
              <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: config.lightBg }}>
                <IconComponent className="w-5 h-5" style={{ color: config.color }} />
              </div>

              {/* Title + Chevron */}
              <div className="flex items-center gap-2 min-w-0">
                <ChevronDown className={`w-5 h-5 flex-shrink-0 transition-transform duration-200 ${
                  isExpanded ? '' : '-rotate-90'
                }`} style={{ color: config.color }} />
                <h3 className="text-sm font-medium text-gray-900 truncate">{title}</h3>
              </div>
            </div>

            {/* Right Side - Total Amount */}
            {total !== null && total !== undefined && (
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className="text-xs text-gray-500 uppercase tracking-wider font-medium">Total</span>
                <span className="text-lg font-semibold" style={{ color: config.color }}>
                  ${total.toLocaleString()}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Expanded Breakdown Content */}
        {isExpanded && Object.keys(breakdown).length > 0 && (
          <div className="mt-2 ml-6 space-y-2 pl-4 border-l-2" style={{ borderColor: config.borderColor }}>
            {Object.entries(breakdown).map(([key, value]) => 
              value !== null && value !== undefined && (
                <div 
                  key={key}
                  className="bg-gray-50 rounded-md p-3 flex justify-between items-center hover:bg-gray-100 transition-colors"
                >
                  <span className="text-sm text-gray-700 capitalize">
                    {key.replace(/_/g, ' ')}
                  </span>
                  <span className="text-sm font-medium text-gray-900">
                    ${value.toLocaleString()}
                  </span>
                </div>
              )
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-2 border border-gray-200 p-6 animate-fadeIn">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <Layers className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h2 className="text-xl font-medium text-gray-900">
              Extracted Financial Data
            </h2>
            <p className="text-sm text-gray-500 mt-0.5">AI-powered data extraction</p>
          </div>
        </div>

        {/* Year Selector */}
        {hasMultipleYears && (
          <div className="mt-4 bg-gray-100 rounded-lg p-1 flex gap-2 inline-flex flex-wrap">
            {allYears.map((year, index) => (
              <button
                key={index}
                onClick={() => setSelectedYearIndex(index)}
                className={`flex items-center gap-2 py-2 px-3 rounded-md font-medium text-sm transition-all duration-200 ${
                  selectedYearIndex === index
                    ? 'bg-white text-blue-600 shadow-1'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Calendar className="w-4 h-4" />
                {year?.year || `Year ${index + 1}`}
              </button>
            ))}
          </div>
        )}

        {/* Multi-year Indicator */}
        {hasMultipleYears && (
          <div className="mt-3 bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-900 font-medium">
              💡 Multi-year data detected ({allYears.length} years). Ratios calculated using averaged values.
            </p>
          </div>
        )}
      </div>

      {/* Sections */}
      <div className="space-y-6">
        {/* Assets */}
        <div>
          <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-3">Assets</h3>
          <div className="space-y-2">
            {renderSection('Current Assets', displayData.current_assets, 'current_assets')}
            {renderSection('Non-Current Assets', displayData.non_current_assets, 'non_current_assets')}
          </div>
        </div>

        {/* Liabilities */}
        <div>
          <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-3">Liabilities</h3>
          <div className="space-y-2">
            {renderSection('Current Liabilities', displayData.current_liabilities, 'current_liabilities')}
            {renderSection('Non-Current Liabilities', displayData.non_current_liabilities, 'non_current_liabilities')}
          </div>
        </div>

        {/* Equity */}
        <div>
          <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-3">Equity</h3>
          <div className="space-y-2">
            {renderSection('Equity', displayData.equity, 'equity')}
          </div>
        </div>

        {/* Income Statement */}
        <div>
          <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-3">Income Statement</h3>
          <div className="space-y-2">
            {renderSection('Income Statement', displayData.income_statement, 'income_statement')}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExtractedDataDisplay;