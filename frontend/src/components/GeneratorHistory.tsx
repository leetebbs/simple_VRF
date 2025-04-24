import React from 'react';
import { GeneratedNumber } from '../types';

interface GeneratorHistoryProps {
  history: GeneratedNumber[];
  visible: boolean;
}

const GeneratorHistory: React.FC<GeneratorHistoryProps> = ({ history, visible }) => {
  if (!visible || history.length === 0) return null;

  return (
    <div className="mt-6 border-t border-navy-700 pt-4">
      <h3 className="text-lg font-medium mb-3">Generation History</h3>
      <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
        {history.map((entry, index) => (
          <div key={index} className="flex justify-between items-center py-2 px-3 bg-navy-800 rounded-md text-sm">
            <div className="font-mono truncate max-w-[70%]">{entry.value}</div>
            <div className="text-xs text-slate-400">
              {entry.timestamp.toLocaleTimeString()}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GeneratorHistory;