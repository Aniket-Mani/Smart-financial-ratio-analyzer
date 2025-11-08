import React, { useState, useRef } from 'react';
import { Upload, FileText, FileStack, X, CheckCircle2, Sparkles, Image } from 'lucide-react';

const FileUpload = ({ 
  files, 
  onFileChange, 
  uploadMode, 
  setUploadMode, 
  onAnalyze, 
  loading 
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const droppedFiles = Array.from(e.dataTransfer.files);
    if (droppedFiles.length > 0) {
      const event = {
        target: { files: uploadMode === 'single' ? [droppedFiles[0]] : droppedFiles }
      };
      onFileChange(event);
    }
  };

  const removeFile = (index) => {
    const newFiles = files.filter((_, i) => i !== index);
    const event = { target: { files: newFiles } };
    onFileChange(event);
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-6">
      {/* Upload Mode Selector - Material Design */}
      <div className="bg-white rounded-lg p-2 shadow-1 flex gap-2 border border-gray-200">
        <button
          onClick={() => setUploadMode('single')}
          className={`flex-1 py-3 px-4 rounded-md font-medium text-sm transition-all duration-200 ${
            uploadMode === 'single'
              ? 'bg-blue-600 text-white shadow-2'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
          style={{ transition: 'all 250ms cubic-bezier(0.4, 0, 0.2, 1)' }}
        >
          <Upload className="inline-block w-4 h-4 mr-2" />
          Single Image
        </button>
        <button
          onClick={() => setUploadMode('batch')}
          className={`flex-1 py-3 px-4 rounded-md font-medium text-sm transition-all duration-200 ${
            uploadMode === 'batch'
              ? 'bg-purple-600 text-white shadow-2'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
          style={{ transition: 'all 250ms cubic-bezier(0.4, 0, 0.2, 1)' }}
        >
          <FileStack className="inline-block w-4 h-4 mr-2" />
          Multiple Images
          <span className="ml-2 text-xs bg-white/20 px-2 py-0.5 rounded">
            New!
          </span>
        </button>
      </div>

      {/* Info Banner for Multi-file */}
      {uploadMode === 'batch' && (
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 animate-fadeIn">
          <div className="flex gap-3">
            <Image className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-purple-900">Multi-Image Upload</p>
              <p className="text-sm text-purple-700 mt-0.5">
                Upload multiple images of the same balance sheet (e.g., if split across pages). Data will be intelligently merged.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Drag & Drop Upload Area - Material Design */}
      <div
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={handleClick}
        className={`relative rounded-lg border-2 border-dashed transition-all duration-200 cursor-pointer ${
          isDragging
            ? uploadMode === 'batch' ? 'border-purple-600 bg-purple-50' : 'border-blue-600 bg-blue-50'
            : 'border-gray-300 bg-gray-50 hover:border-blue-400'
        }`}
        style={{ padding: '2rem' }}
      >
        {/* Icon */}
        <div className="flex justify-center mb-4">
          <div className={`p-4 rounded-lg transition-colors duration-200 ${
            isDragging
              ? uploadMode === 'batch' ? 'bg-purple-100' : 'bg-blue-100'
              : 'bg-gray-200'
          }`}>
            {isDragging ? (
              <Sparkles className={`w-8 h-8 ${uploadMode === 'batch' ? 'text-purple-600' : 'text-blue-600'}`} />
            ) : uploadMode === 'batch' ? (
              <FileStack className="w-8 h-8 text-gray-600" />
            ) : (
              <Upload className="w-8 h-8 text-gray-600" />
            )}
          </div>
        </div>

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept="image/*,.pdf"
          onChange={onFileChange}
          multiple={uploadMode === 'batch'}
          disabled={loading}
        />

        {/* Text Content */}
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-1">
            {isDragging 
              ? 'Drop your files here' 
              : uploadMode === 'batch'
              ? 'Upload Multiple Financial Statements'
              : 'Upload Financial Statement'
            }
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            {isDragging 
              ? 'Release to upload' 
              : uploadMode === 'batch'
              ? 'Drag and drop multiple images, or click to select (for split documents)'
              : 'Drag and drop your PDF, PNG, or image file, or click to select'
            }
          </p>
          <p className="text-xs text-gray-500">
            Supported: PDF, PNG, JPG, JPEG, TIFF, BMP
            {uploadMode === 'batch' && ' • No file limit'}
          </p>
        </div>
      </div>

      {/* Selected Files Display - Material Design Cards */}
      {files.length > 0 && (
        <div className="space-y-3 animate-fadeIn">
          <h4 className="text-sm font-medium text-gray-900 uppercase tracking-wide flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-600" />
            Selected Files ({files.length})
            {files.length > 1 && (
              <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded font-normal normal-case">
                Will be merged into single analysis
              </span>
            )}
          </h4>
          <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
            {files.map((file, index) => (
              <div 
                key={index}
                className="bg-white rounded-lg p-4 flex items-center gap-3 border border-gray-200 shadow-1 hover:shadow-2 transition-all animate-fadeIn"
                style={{animationDelay: `${index * 0.05}s`}}
              >
                <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                  <FileText className="w-5 h-5 text-blue-600" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                    {index === 0 && files.length > 1 && (
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded font-semibold">
                        PRIMARY
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500">
                    {(file.size / 1024).toFixed(1)} KB
                    {files.length > 1 && ` • Image ${index + 1} of ${files.length}`}
                  </p>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile(index);
                  }}
                  className="flex-shrink-0 w-8 h-8 rounded-md hover:bg-red-50 flex items-center justify-center transition-colors"
                  title="Remove file"
                >
                  <X className="w-4 h-4 text-red-600" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Analyze Button - Material Design */}
      {files.length > 0 && (
        <button
          onClick={onAnalyze}
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 shadow-2 hover:shadow-4 disabled:shadow-none flex items-center justify-center gap-2"
          style={{ transition: 'all 250ms cubic-bezier(0.4, 0, 0.2, 1)' }}
        >
          {loading ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Analyzing {files.length} file{files.length > 1 ? 's' : ''}...
            </>
          ) : (
            <>
              <Upload className="w-5 h-5" />
              Extract Financial Data {files.length > 1 && `(${files.length} files)`}
            </>
          )}
        </button>
      )}
    </div>
  );
};

export default FileUpload;
