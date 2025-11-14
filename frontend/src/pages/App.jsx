import React, { useState, useRef, useEffect } from 'react';
import { TrendingUp, AlertCircle, Sparkles, Settings } from 'lucide-react';
import { analyzeStatement, recalculateRatios } from '../services/api';
import { generateFinancialReportPDF } from '../services/pdfGenerator';
import { scrollToElement } from '../utils/helpers';
import localStorageService from '../services/localStorage';
import FileUpload from '../components/FileUpload';
import TabbedView from '../components/TabbedView';
import DevModeToggle from '../components/DevModeToggle';
import CustomRatiosManager from '../components/CustomRatiosManager';

function App() {
  const [files, setFiles] = useState([]);
  const [uploadMode, setUploadMode] = useState('single');
  const [loading, setLoading] = useState(false);
  const [extractedData, setExtractedData] = useState(null);
  const [calculatedRatios, setCalculatedRatios] = useState(null);
  const [error, setError] = useState(null);
  const [warnings, setWarnings] = useState(null);
  
  // Custom ratios state
  const [devMode, setDevMode] = useState(false);
  const [customRatios, setCustomRatios] = useState([]);
  const [showCustomRatiosManager, setShowCustomRatiosManager] = useState(false);
  const [recalculating, setRecalculating] = useState(false);

  const tabbedViewRef = useRef(null);

  // Load dev mode and custom ratios from localStorage on mount
  useEffect(() => {
    const savedDevMode = localStorageService.getDevMode();
    const savedCustomRatios = localStorageService.getCustomRatios();
    
    setCustomRatios(savedCustomRatios);
    setDevMode(savedDevMode);
  }, []);

  // Save dev mode to localStorage when it changes
  useEffect(() => {
    localStorageService.setDevMode(devMode);
  }, [devMode]);

  // Recalculate ratios when dev mode or custom ratios change
  useEffect(() => {
    if (extractedData && calculatedRatios) {
      handleRecalculate();
    }
  }, [devMode]); // Only recalculate when devMode changes, not customRatios

  useEffect(() => {
    if (extractedData && tabbedViewRef.current) {
      setTimeout(() => {
        scrollToElement('tabbed-view-section', 80);
      }, 300);
    }
  }, [extractedData]);

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    if (uploadMode === 'single' && selectedFiles.length > 0) {
      setFiles([selectedFiles[0]]);
    } else {
      setFiles(selectedFiles);
    }
    setError(null);
  };

  const handleAnalyze = async () => {
    if (files.length === 0) {
      setError('Please select at least one file');
      return;
    }

    setLoading(true);
    setError(null);
    setWarnings(null);
    setExtractedData(null);
    setCalculatedRatios(null);

    try {
      const data = await analyzeStatement(files);
      
      if (data.success) {
        setExtractedData(data.extracted_data);
        
        // If we have custom ratios, enable dev mode and recalculate
        if (customRatios.length > 0 && !devMode) {
          setDevMode(true);
          localStorageService.setDevMode(true);
          // Recalculate with custom ratios
          const recalcResult = await recalculateRatios(data.extracted_data, customRatios, true);
          if (recalcResult.success) {
            setCalculatedRatios(recalcResult.ratios);
          }
        } else if (devMode && customRatios.length > 0) {
          // Dev mode already on, recalculate with custom ratios
          const recalcResult = await recalculateRatios(data.extracted_data, customRatios, true);
          if (recalcResult.success) {
            setCalculatedRatios(recalcResult.ratios);
          }
        } else {
          // No custom ratios, use base ratios from analyze
          setCalculatedRatios(data.ratios);
        }
        
        setWarnings(data.warnings);
      } else {
        setError(data.message || 'Analysis failed');
      }
    } catch (err) {
      setError(err.message);
      console.error('Upload error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateReport = () => {
    if (!extractedData || !calculatedRatios) {
      setError('Please complete analysis first');
      return;
    }

    const fileName = files.length > 0 ? files[0].name : 'financial_statement';
    generateFinancialReportPDF(calculatedRatios);
  };

  // Custom Ratios Handlers
  const handleToggleDevMode = () => {
    setDevMode(prev => !prev);
  };

  const handleRecalculate = async (ratiosToUse = null) => {
    if (!extractedData) return;

    setRecalculating(true);
    setError(null);

    try {
      // Use provided ratios or fall back to state
      const ratios = ratiosToUse !== null ? ratiosToUse : customRatios;
      const result = await recalculateRatios(extractedData, ratios, devMode);
      
      if (result.success) {
        setCalculatedRatios(result.ratios);
        if (result.warnings) {
          setWarnings(result.warnings);
        }
      } else {
        setError(result.message || 'Recalculation failed');
      }
    } catch (err) {
      setError(err.message);
      console.error('Recalculation error:', err);
    } finally {
      setRecalculating(false);
    }
  };

  const handleAddCustomRatio = (ratio) => {
    const updatedRatios = [...customRatios, ratio];
    setCustomRatios(updatedRatios);
    localStorageService.setCustomRatios(updatedRatios);
    
    // Auto-enable dev mode if it's off
    if (!devMode) {
      setDevMode(true);
      localStorageService.setDevMode(true);
    }
    
    // Recalculate if we have data - pass updated ratios
    if (extractedData) {
      handleRecalculate(updatedRatios);
    }
  };

  const handleUpdateCustomRatio = (updatedRatio) => {
    const updatedRatios = customRatios.map(r => 
      r.id === updatedRatio.id ? updatedRatio : r
    );
    setCustomRatios(updatedRatios);
    localStorageService.setCustomRatios(updatedRatios);
    
    // Recalculate if we have data and dev mode is on - pass updated ratios
    if (extractedData && devMode) {
      handleRecalculate(updatedRatios);
    }
  };

  const handleDeleteCustomRatio = (ratioId) => {
    const updatedRatios = customRatios.filter(r => r.id !== ratioId);
    setCustomRatios(updatedRatios);
    localStorageService.setCustomRatios(updatedRatios);
    
    // Recalculate if we have data and dev mode is on - pass updated ratios
    if (extractedData && devMode) {
      handleRecalculate(updatedRatios);
    }
  };

  const handleImportCustomRatios = (importedRatios) => {
    try {
      // Merge with existing ratios (avoid duplicates by ID)
      const existingIds = new Set(customRatios.map(r => r.id));
      const newRatios = importedRatios.filter(r => !existingIds.has(r.id));
      const mergedRatios = [...customRatios, ...newRatios];
      
      setCustomRatios(mergedRatios);
      localStorageService.setCustomRatios(mergedRatios);
      
      alert(`Successfully imported ${newRatios.length} custom ratio(s)`);
      
      // Recalculate if we have data and dev mode is on
      if (extractedData && devMode) {
        handleRecalculate();
      }
    } catch (error) {
      setError('Failed to import custom ratios: ' + error.message);
    }
  };

  // Get available variables from extracted data
  const getAvailableVariables = () => {
    if (!extractedData) return [];
    
    const vars = new Set();
    const data = extractedData.current_year || extractedData;
    
    // Helper to recursively extract keys
    const extractKeys = (obj, prefix = '') => {
      Object.keys(obj).forEach(key => {
        if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
          extractKeys(obj[key], prefix ? `${prefix}_${key}` : key);
        } else if (typeof obj[key] === 'number') {
          vars.add(prefix ? `${prefix}_${key}` : key);
        }
      });
    };
    
    extractKeys(data);
    return Array.from(vars).sort();
  };

  return (
    <div className="min-h-screen w-full relative overflow-x-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-gradient-to-br from-purple-400 to-pink-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float"></div>
        <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-gradient-to-br from-cyan-400 to-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-floatDelayed"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-br from-indigo-400 to-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulseSlow"></div>
      </div>

      <div className="relative z-10 w-full min-h-screen">
        <header className="text-center py-12 lg:py-16 px-4 animate-fadeIn">
          <div className="max-w-5xl mx-auto">
            <div className="inline-flex items-center justify-center mb-6 relative">
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-full blur-2xl opacity-30 animate-pulseSlow"></div>
              <div className="relative bg-white/90 backdrop-blur-xl rounded-full p-6 shadow-2xl border border-white/40">
                <TrendingUp className="w-16 h-16 lg:w-20 lg:h-20" style={{color: 'rgb(99 102 241)'}} />
              </div>
            </div>
            <h1 className="text-5xl lg:text-7xl font-extrabold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-4 animate-slideDown tracking-tight">
              Smart Financial Analyzer
            </h1>
            <p className="text-xl lg:text-2xl text-gray-700 flex items-center justify-center gap-3 animate-slideUp flex-wrap font-medium">
              <Sparkles className="w-6 h-6 text-purple-500" />
              AI-powered multi-year & multi-file financial analysis
              <Sparkles className="w-6 h-6 text-purple-500" />
            </p>
            
            {/* Developer Mode Toggle */}
            <div className="mt-8 flex justify-center">
              <DevModeToggle devMode={devMode} onToggle={handleToggleDevMode} />
            </div>
          </div>
        </header>

        {error && (
          <div className="px-4 mb-8 animate-slideDown max-w-4xl mx-auto">
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-red-500 to-pink-500 p-[2px]">
              <div className="bg-white rounded-2xl p-6">
                <div className="flex items-center gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                    <AlertCircle className="h-6 w-6 text-red-600" />
                  </div>
                  <p className="text-red-700 font-semibold text-lg">{error}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {warnings && warnings.length > 0 && (
          <div className="px-4 mb-8 animate-slideDown max-w-4xl mx-auto">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex gap-3">
                <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-yellow-900 mb-2">Analysis Warnings:</p>
                  <ul className="text-sm text-yellow-800 space-y-1">
                    {warnings.map((warning, idx) => (
                      <li key={idx}>• {warning}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="w-full px-4 lg:px-8 xl:px-16 pb-12 space-y-8">
          {/* Custom Ratios Manager - Show when dev mode is on */}
          {devMode && (
            <div className="max-w-4xl mx-auto animate-slideDown">
              <button
                onClick={() => setShowCustomRatiosManager(prev => !prev)}
                className="w-full flex items-center justify-between px-6 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg shadow-lg hover:shadow-xl transition-all mb-4"
              >
                <div className="flex items-center gap-3">
                  <Settings className="w-5 h-5" />
                  <span className="font-semibold">Custom Ratios Manager</span>
                  <span className="px-2 py-0.5 bg-white/20 rounded-full text-xs">
                    {customRatios.length} ratio{customRatios.length !== 1 ? 's' : ''}
                  </span>
                </div>
                <svg
                  className={`w-5 h-5 transition-transform ${showCustomRatiosManager ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {showCustomRatiosManager && (
                <CustomRatiosManager
                  customRatios={customRatios}
                  onAdd={handleAddCustomRatio}
                  onUpdate={handleUpdateCustomRatio}
                  onDelete={handleDeleteCustomRatio}
                  onImport={handleImportCustomRatios}
                  availableVariables={getAvailableVariables()}
                  className="animate-slideDown"
                />
              )}
            </div>
          )}

          <div className="max-w-4xl mx-auto animate-scaleIn">
            <FileUpload
              files={files}
              onFileChange={handleFileChange}
              uploadMode={uploadMode}
              setUploadMode={setUploadMode}
              onAnalyze={handleAnalyze}
              loading={loading}
            />
          </div>

          {loading && (
            <div className="max-w-4xl mx-auto relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-[3px] animate-scaleIn">
              <div className="bg-white/95 backdrop-blur-xl rounded-3xl p-12">
                <div className="text-center">
                  <div className="relative inline-block mb-6">
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full blur-xl opacity-50"></div>
                    <div className="relative inline-block animate-spin rounded-full h-20 w-20 border-4 border-transparent border-t-indigo-600 border-r-purple-600"></div>
                  </div>
                  <p className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                    Analyzing Financial Data...
                  </p>
                  <p className="mt-2 text-gray-600 text-lg">
                    {files.length > 1 
                      ? `Processing ${files.length} files and merging data with AI ✨`
                      : 'Extracting multi-year insights with AI ✨'
                    }
                  </p>
                </div>
              </div>
            </div>
          )}

          {recalculating && (
            <div className="max-w-4xl mx-auto relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-500 p-[2px] animate-scaleIn">
              <div className="bg-white rounded-2xl p-6">
                <div className="text-center">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-transparent border-t-purple-600 border-r-indigo-600 mb-3"></div>
                  <p className="text-lg font-semibold text-purple-600">
                    Recalculating with {devMode ? 'custom' : 'base'} ratios...
                  </p>
                </div>
              </div>
            </div>
          )}

          {extractedData && !loading && (
            <div id="tabbed-view-section" ref={tabbedViewRef} className="w-full max-w-7xl mx-auto animate-slideUp scroll-mt-20">
              {/* PDF Download Button - Always Visible */}
              <div className="mb-4 flex justify-end">
                <button
                  onClick={handleGenerateReport}
                  className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold text-sm transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
                  style={{ transition: 'all 250ms cubic-bezier(0.4, 0, 0.2, 1)' }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="7 10 12 15 17 10"></polyline>
                    <line x1="12" y1="15" x2="12" y2="3"></line>
                  </svg>
                  Download PDF Report
                </button>
              </div>
              
              <TabbedView 
                extractedData={extractedData} 
                ratios={calculatedRatios}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
