import React, { useState, useEffect, useRef } from 'react';
import { Save, X, TestTube, AlertCircle, CheckCircle, Info, Plus } from 'lucide-react';
import axios from 'axios';
import { getAvailableVariables } from '../services/api';

/**
 * CustomRatioEditor Component
 * Form for creating/editing custom financial ratios
 */
const CustomRatioEditor = ({ 
  ratio = null, 
  onSave, 
  onCancel, 
  availableVariables = [],
  className = '' 
}) => {
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    category: 'custom',
    formula: '',
    unit: 'ratio',
    interpretation: '',
    higher_is_better: true,
    ideal_range: '',
  });

  const [errors, setErrors] = useState({});
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [availableVars, setAvailableVars] = useState(null);
  const [showVariables, setShowVariables] = useState(false);
  const formulaInputRef = useRef(null);

  // Fetch available variables on mount
  useEffect(() => {
    const fetchVariables = async () => {
      try {
        const response = await getAvailableVariables();
        if (response.success) {
          setAvailableVars(response.variables);
        }
      } catch (error) {
        console.error('Failed to fetch variables:', error);
      }
    };
    fetchVariables();
  }, []);

  // Populate form when editing existing ratio
  useEffect(() => {
    if (ratio) {
      setFormData({
        id: ratio.id || '',
        name: ratio.name || '',
        category: ratio.category || 'custom',
        formula: ratio.formula || '',
        unit: ratio.unit || 'ratio',
        interpretation: ratio.interpretation || '',
        higher_is_better: ratio.higher_is_better !== undefined ? ratio.higher_is_better : true,
        ideal_range: ratio.ideal_range || '',
      });
    }
  }, [ratio]);

  const categories = [
    { value: 'liquidity', label: 'Liquidity' },
    { value: 'profitability', label: 'Profitability' },
    { value: 'solvency', label: 'Solvency' },
    { value: 'efficiency', label: 'Efficiency' },
    { value: 'custom', label: 'Custom' },
  ];

  const units = [
    { value: 'ratio', label: 'Ratio' },
    { value: '%', label: 'Percentage (%)' },
    { value: 'days', label: 'Days' },
    { value: 'times', label: 'Times' },
  ];

  const insertVariable = (varName) => {
    const input = formulaInputRef.current;
    if (!input) return;

    const start = input.selectionStart;
    const end = input.selectionEnd;
    const currentFormula = formData.formula;
    
    // Insert variable at cursor position
    const newFormula = currentFormula.substring(0, start) + varName + currentFormula.substring(end);
    
    setFormData(prev => ({ ...prev, formula: newFormula }));
    setTestResult(null);
    
    // Set cursor position after inserted variable
    setTimeout(() => {
      input.focus();
      input.setSelectionRange(start + varName.length, start + varName.length);
    }, 0);
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
    // Clear test result when formula changes
    if (field === 'formula') {
      setTestResult(null);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.formula.trim()) {
      newErrors.formula = 'Formula is required';
    }

    if (!formData.category) {
      newErrors.category = 'Category is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleTestFormula = () => {
    if (!formData.formula.trim()) {
      setTestResult({ success: false, message: 'Formula is empty' });
      return;
    }

    setTesting(true);
    
    // Simulate formula testing (you can replace with actual API call)
    setTimeout(() => {
      // Basic validation: check if formula has valid syntax
      const hasOperators = /[+\-*/()]/.test(formData.formula);
      const hasVariables = formData.formula.length > 2;
      
      if (hasOperators && hasVariables) {
        setTestResult({ 
          success: true, 
          message: 'Formula syntax looks valid!',
          value: 'Example: 2.50'
        });
      } else {
        setTestResult({ 
          success: false, 
          message: 'Formula must contain variables and operators' 
        });
      }
      setTesting(false);
    }, 500);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    // Generate ID if creating new ratio
    const ratioData = {
      ...formData,
      id: formData.id || formData.name.toLowerCase().replace(/\s+/g, '_'),
      is_custom: true,
      created_at: ratio?.created_at || new Date().toISOString(),
      modified_at: new Date().toISOString(),
    };

    onSave(ratioData);
  };

  return (
    <div className={`bg-white rounded-lg shadow-lg p-6 ${className}`}>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold text-gray-800">
          {ratio ? 'Edit Custom Ratio' : 'Create Custom Ratio'}
        </h3>
        <button
          onClick={onCancel}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Ratio Name *
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
              errors.name ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="e.g., Quick Ratio, Working Capital Ratio"
          />
          {errors.name && (
            <p className="text-red-500 text-xs mt-1">{errors.name}</p>
          )}
        </div>

        {/* Formula */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Formula *
          </label>
          <div className="relative">
            <textarea
              ref={formulaInputRef}
              value={formData.formula}
              onChange={(e) => handleChange('formula', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent font-mono text-sm ${
                errors.formula ? 'border-red-500' : 'border-gray-300'
              }`}
              rows="3"
              placeholder="Click variables below to insert, or type: revenue / total_assets"
            />
            <button
              type="button"
              onClick={handleTestFormula}
              disabled={testing || !formData.formula.trim()}
              className="absolute top-2 right-2 px-3 py-1 bg-purple-100 text-purple-700 rounded text-xs font-medium hover:bg-purple-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
            >
              <TestTube className="w-3 h-3" />
              {testing ? 'Testing...' : 'Test'}
            </button>
          </div>
          {errors.formula && (
            <p className="text-red-500 text-xs mt-1">{errors.formula}</p>
          )}
          
          {/* Test Result */}
          {testResult && (
            <div className={`mt-2 p-2 rounded-lg flex items-start gap-2 text-sm ${
              testResult.success ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
            }`}>
              {testResult.success ? (
                <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              )}
              <div>
                <p className="font-medium">{testResult.message}</p>
                {testResult.value && (
                  <p className="text-xs mt-1 opacity-75">{testResult.value}</p>
                )}
              </div>
            </div>
          )}

          {/* Variable Picker */}
          {availableVars && (
            <div className="mt-3 border border-gray-200 rounded-lg p-3 bg-gray-50">
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-gray-700 uppercase">
                  Available Variables (Click to Insert)
                </label>
                <button
                  type="button"
                  onClick={() => setShowVariables(!showVariables)}
                  className="text-xs text-purple-600 hover:text-purple-700"
                >
                  {showVariables ? 'Hide' : 'Show All'}
                </button>
              </div>
              
              {showVariables && (
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {/* Assets */}
                  <div>
                    <p className="text-xs font-medium text-gray-600 mb-1">Assets</p>
                    <div className="flex flex-wrap gap-1">
                      {availableVars.balance_sheet.assets.map(v => (
                        <button
                          key={v.name}
                          type="button"
                          onClick={() => insertVariable(v.name)}
                          className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs hover:bg-blue-200 transition-colors"
                          title={v.description}
                        >
                          {v.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Liabilities */}
                  <div>
                    <p className="text-xs font-medium text-gray-600 mb-1">Liabilities</p>
                    <div className="flex flex-wrap gap-1">
                      {availableVars.balance_sheet.liabilities.map(v => (
                        <button
                          key={v.name}
                          type="button"
                          onClick={() => insertVariable(v.name)}
                          className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs hover:bg-red-200 transition-colors"
                          title={v.description}
                        >
                          {v.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Equity */}
                  <div>
                    <p className="text-xs font-medium text-gray-600 mb-1">Equity</p>
                    <div className="flex flex-wrap gap-1">
                      {availableVars.balance_sheet.equity.map(v => (
                        <button
                          key={v.name}
                          type="button"
                          onClick={() => insertVariable(v.name)}
                          className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs hover:bg-green-200 transition-colors"
                          title={v.description}
                        >
                          {v.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Income Statement */}
                  <div>
                    <p className="text-xs font-medium text-gray-600 mb-1">Income Statement</p>
                    <div className="flex flex-wrap gap-1">
                      {availableVars.income_statement.map(v => (
                        <button
                          key={v.name}
                          type="button"
                          onClick={() => insertVariable(v.name)}
                          className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs hover:bg-purple-200 transition-colors"
                          title={v.description}
                        >
                          {v.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Operators */}
                  <div>
                    <p className="text-xs font-medium text-gray-600 mb-1">Operators</p>
                    <div className="flex flex-wrap gap-1">
                      {['+', '-', '*', '/', '(', ')'].map(op => (
                        <button
                          key={op}
                          type="button"
                          onClick={() => insertVariable(` ${op} `)}
                          className="px-2 py-1 bg-gray-200 text-gray-700 rounded text-xs hover:bg-gray-300 transition-colors font-mono"
                        >
                          {op}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
              
              {!showVariables && (
                <p className="text-xs text-gray-500 italic">
                  Click "Show All" to see {Object.values(availableVars.balance_sheet).flat().length + availableVars.income_statement.length} available variables
                </p>
              )}
            </div>
          )}

          {/* Old Available Variables Info - Remove or keep as fallback */}
          {availableVariables.length > 0 && !availableVars && (
            <div className="mt-2 p-2 bg-blue-50 rounded-lg">
              <div className="flex items-start gap-2">
                <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="text-xs text-blue-700">
                  <p className="font-medium mb-1">Available variables:</p>
                  <p className="opacity-75">
                    {availableVariables.slice(0, 8).join(', ')}
                    {availableVariables.length > 8 && ` +${availableVariables.length - 8} more`}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Category and Unit */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category *
            </label>
            <select
              value={formData.category}
              onChange={(e) => handleChange('category', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              {categories.map(cat => (
                <option key={cat.value} value={cat.value}>{cat.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Unit *
            </label>
            <select
              value={formData.unit}
              onChange={(e) => handleChange('unit', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              {units.map(unit => (
                <option key={unit.value} value={unit.value}>{unit.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Interpretation */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Interpretation
          </label>
          <textarea
            value={formData.interpretation}
            onChange={(e) => handleChange('interpretation', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            rows="2"
            placeholder="What does this ratio measure? How should it be interpreted?"
          />
        </div>

        {/* Ideal Range and Higher is Better */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ideal Range (optional)
            </label>
            <input
              type="text"
              value={formData.ideal_range}
              onChange={(e) => handleChange('ideal_range', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="e.g., 1.0-2.0"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Interpretation
            </label>
            <select
              value={formData.higher_is_better}
              onChange={(e) => handleChange('higher_is_better', e.target.value === 'true')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="true">Higher is Better</option>
              <option value="false">Lower is Better</option>
            </select>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:shadow-lg transition-all flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            {ratio ? 'Update Ratio' : 'Create Ratio'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CustomRatioEditor;
