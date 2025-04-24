import React, { useState, useEffect, useRef } from 'react';

interface RangeSliderProps {
  min: number;
  max: number;
  value: number;
  onChange: (value: number) => void;
  step?: number;
}

const RangeSlider: React.FC<RangeSliderProps> = ({
  min,
  max,
  value,
  onChange,
  step = 1,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const rangeRef = useRef<HTMLDivElement>(null);
  
  const percentage = ((value - min) / (max - min)) * 100;
  
  const handleMove = (clientX: number) => {
    if (!rangeRef.current) return;
    
    const rect = rangeRef.current.getBoundingClientRect();
    const width = rect.width;
    const offsetX = clientX - rect.left;
    const percent = Math.min(Math.max(offsetX / width, 0), 1);
    const newValue = Math.round((percent * (max - min) + min) / step) * step;
    
    onChange(newValue);
  };
  
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    handleMove(e.clientX);
  };
  
  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    handleMove(e.touches[0].clientX);
  };
  
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        handleMove(e.clientX);
      }
    };
    
    const handleTouchMove = (e: TouchEvent) => {
      if (isDragging && e.touches[0]) {
        handleMove(e.touches[0].clientX);
      }
    };
    
    const handleEnd = () => {
      setIsDragging(false);
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleEnd);
    document.addEventListener('touchmove', handleTouchMove);
    document.addEventListener('touchend', handleEnd);
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleEnd);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleEnd);
    };
  }, [isDragging]);
  
  return (
    <div
      ref={rangeRef}
      className={`h-2 bg-navy-700 rounded-full cursor-pointer relative ${isDragging ? 'active' : ''}`}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
    >
      <div
        className="absolute h-full bg-gradient-to-r from-teal-500 to-blue-500 rounded-full"
        style={{ width: `${percentage}%` }}
      ></div>
      <div
        className={`absolute h-5 w-5 bg-white rounded-full shadow-lg -mt-1.5 transform -translate-x-1/2 transition-transform ${
          isDragging ? 'scale-110' : ''
        }`}
        style={{ left: `${percentage}%` }}
      ></div>
    </div>
  );
};

export default RangeSlider;