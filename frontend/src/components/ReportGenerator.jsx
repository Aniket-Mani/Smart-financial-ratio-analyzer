import React from 'react';
import { Download, CheckCircle, FileText } from 'lucide-react';

const ReportGenerator = ({ onGenerate, isGenerated, disabled }) => {
  if (isGenerated) {
    return (
      <div className="bg-green-50 border-l-4 border-green-600 p-4 rounded-lg mb-6 animate-fadeIn shadow-1">
        <div className="flex items-center gap-3">
          <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-green-900 font-medium">
              PDF Report Successfully Generated!
            </p>
            <p className="text-green-700 text-sm mt-0.5">
              Your financial analysis report has been downloaded.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default ReportGenerator;
