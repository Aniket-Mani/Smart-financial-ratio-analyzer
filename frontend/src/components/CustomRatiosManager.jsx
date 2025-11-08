import React, { useState } from 'react';
import { Plus, Edit, Trash2, Download, Upload, AlertCircle } from 'lucide-react';
import CustomRatioEditor from './CustomRatioEditor';

/**
 * CustomRatiosManager Component
 * Manages the list of custom ratios with CRUD operations
 */
const CustomRatiosManager = ({ 
  customRatios = [], 
  onAdd, 
  onUpdate, 
  onDelete,
  onImport,
  onExport,
  availableVariables = [],
  className = '' 
}) => {
  const [showEditor, setShowEditor] = useState(false);
  const [editingRatio, setEditingRatio] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);

  const handleAddNew = () => {
    setEditingRatio(null);
    setShowEditor(true);
  };

  const handleEdit = (ratio) => {
    setEditingRatio(ratio);
    setShowEditor(true);
  };

  const handleSave = (ratioData) => {
    if (editingRatio) {
      onUpdate(ratioData);
    } else {
      onAdd(ratioData);
    }
    setShowEditor(false);
    setEditingRatio(null);
  };

  const handleDelete = (ratioId) => {
    onDelete(ratioId);
    setShowDeleteConfirm(null);
  };

  const handleExport = () => {
    const dataStr = JSON.stringify(customRatios, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `custom-ratios-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
    
    if (onExport) onExport();
  };

  const handleImport = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedRatios = JSON.parse(e.target.result);
        if (onImport) onImport(importedRatios);
      } catch (error) {
        alert('Error importing file: Invalid JSON format');
      }
    };
    reader.readAsText(file);
    event.target.value = ''; // Reset input
  };

  const getCategoryBadgeColor = (category) => {
    const colors = {
      liquidity: 'bg-blue-100 text-blue-700',
      profitability: 'bg-green-100 text-green-700',
      solvency: 'bg-yellow-100 text-yellow-700',
      efficiency: 'bg-purple-100 text-purple-700',
      custom: 'bg-gray-100 text-gray-700',
    };
    return colors[category] || colors.custom;
  };

  if (showEditor) {
    return (
      <CustomRatioEditor
        ratio={editingRatio}
        onSave={handleSave}
        onCancel={() => {
          setShowEditor(false);
          setEditingRatio(null);
        }}
        availableVariables={availableVariables}
        className={className}
      />
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-lg p-6 ${className}`}>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-xl font-semibold text-gray-800">Custom Ratios</h3>
          <p className="text-sm text-gray-500 mt-1">
            {customRatios.length} custom ratio{customRatios.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex gap-2">
          {/* Import Button */}
          <label className="cursor-pointer px-3 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2">
            <Upload className="w-4 h-4" />
            <span className="text-sm">Import</span>
            <input
              type="file"
              accept=".json"
              onChange={handleImport}
              className="hidden"
            />
          </label>

          {/* Export Button */}
          {customRatios.length > 0 && (
            <button
              onClick={handleExport}
              className="px-3 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              <span className="text-sm">Export</span>
            </button>
          )}

          {/* Add New Button */}
          <button
            onClick={handleAddNew}
            className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:shadow-lg transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span className="text-sm">Add New</span>
          </button>
        </div>
      </div>

      {/* Ratios List */}
      {customRatios.length === 0 ? (
        <div className="text-center py-12">
          <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 mb-4">No custom ratios yet</p>
          <button
            onClick={handleAddNew}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Create Your First Custom Ratio
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {customRatios.map((ratio) => (
            <div
              key={ratio.id}
              className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-semibold text-gray-800">{ratio.name}</h4>
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${getCategoryBadgeColor(ratio.category)}`}>
                      {ratio.category}
                    </span>
                    <span className="px-2 py-0.5 rounded text-xs font-medium bg-indigo-100 text-indigo-700">
                      {ratio.unit}
                    </span>
                  </div>
                  
                  <div className="bg-gray-100 rounded px-3 py-2 mb-2 border border-gray-200">
                    <span className="text-sm text-gray-900 font-mono">{ratio.formula}</span>
                  </div>
                  
                  {ratio.interpretation && (
                    <p className="text-sm text-gray-700 mb-2">{ratio.interpretation}</p>
                  )}
                  
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    {ratio.ideal_range && (
                      <span>Ideal: {ratio.ideal_range}</span>
                    )}
                    <span>
                      {ratio.higher_is_better ? '↑ Higher is better' : '↓ Lower is better'}
                    </span>
                    {ratio.modified_at && (
                      <span>Modified: {new Date(ratio.modified_at).toLocaleDateString()}</span>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => handleEdit(ratio)}
                    className="p-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded transition-colors"
                    title="Edit ratio"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(ratio.id)}
                    className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                    title="Delete ratio"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Delete Confirmation */}
              {showDeleteConfirm === ratio.id && (
                <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-800 mb-2">
                    Are you sure you want to delete "{ratio.name}"?
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleDelete(ratio.id)}
                      className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700 transition-colors"
                    >
                      Delete
                    </button>
                    <button
                      onClick={() => setShowDeleteConfirm(null)}
                      className="px-3 py-1 bg-white text-gray-700 border border-gray-300 rounded text-sm hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CustomRatiosManager;
