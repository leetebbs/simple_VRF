import React from 'react';

interface TabsProps {
  options: Array<{ id: string; label: string }>;
  activeId: string;
  onChange: (id: string) => void;
}

const Tabs: React.FC<TabsProps> = ({ options, activeId, onChange }) => {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => (
        <button
          key={option.id}
          onClick={() => onChange(option.id)}
          className={`py-2 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${
            activeId === option.id
              ? 'bg-gradient-to-r from-teal-500 to-blue-500 text-white shadow-md'
              : 'bg-navy-700 hover:bg-navy-600 text-slate-300'
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
};

export default Tabs;