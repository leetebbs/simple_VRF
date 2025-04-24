import React, { useState } from 'react';
import { Copy, Check, Clipboard } from 'lucide-react';

interface ResultDisplayProps {
  generatedNumber: string | null;
  isGenerating: boolean;
  isCheckingFulfillment: boolean;
  history: any[];
  showHistory: boolean;
  setShowHistory: (show: boolean) => void;
}

const ResultDisplay: React.FC<ResultDisplayProps> = ({
  generatedNumber,
  isGenerating,
  isCheckingFulfillment,
  history,
  showHistory,
  setShowHistory
}) => {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    if (generatedNumber) {
      navigator.clipboard.writeText(generatedNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div>
      <div className="mb-4 flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Generated Result</h2>
        <div className="flex space-x-2">
          {generatedNumber && (
            <button
              onClick={copyToClipboard}
              className="flex items-center text-xs py-1 px-3 rounded-full bg-navy-800 hover:bg-navy-700 transition-colors"
            >
              {copied ? (
                <>
                  <Check size={14} className="mr-1 text-green-400" />
                  <span>Copied</span>
                </>
              ) : (
                <>
                  <Copy size={14} className="mr-1" />
                  <span>Copy</span>
                </>
              )}
            </button>
          )}
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="flex items-center text-xs py-1 px-3 rounded-full bg-navy-800 hover:bg-navy-700 transition-colors"
          >
            <Clipboard size={14} className="mr-1" />
            <span>{showHistory ? 'Hide History' : 'Show History'}</span>
          </button>
        </div>
      </div>
      
      <div className={`relative overflow-hidden transition-all duration-500 ${isGenerating ? 'opacity-50' : 'opacity-100'}`}>
        <div className={`min-h-[120px] flex items-center justify-center ${!generatedNumber ? 'text-slate-500' : ''}`}>
          {isGenerating || isCheckingFulfillment ? (
            <div className="text-center">
              <div className="animate-pulse mb-2">
                {isCheckingFulfillment ? "Waiting for oracle fulfillment..." : "Submitting request to blockchain..."}
              </div>
              <div className="text-xs text-slate-400">This may take 30-60 seconds</div>
            </div>
          ) : generatedNumber ? (
            <div className="font-mono text-center w-full p-4">
              <p 
                className={`
                  font-semibold text-teal-400 break-all
                  ${generatedNumber.length > 50 ? 'text-xs' : 
                    generatedNumber.length > 30 ? 'text-sm' : 
                    generatedNumber.length > 20 ? 'text-base' : 'text-xl'}
                `}
              >
                {generatedNumber}
              </p>
              <p className="text-xs text-slate-400 mt-1">
                {generatedNumber.length > 10 ? `${generatedNumber.length} digits` : ''}
              </p>
            </div>
          ) : (
            <div className="text-center">
              <p>No number generated yet</p>
            </div>
          )}
        </div>
        
        {(isGenerating || isCheckingFulfillment) && (
          <div className="absolute inset-0 flex items-center justify-center backdrop-blur-sm">
            <div className="loader"></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResultDisplay;