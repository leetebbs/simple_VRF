import { NumberFormat } from '../types';

export const formatGeneratedNumber = (
  min: number,
  max: number,
  format: NumberFormat
): string => {
  switch (format) {
    case 'integer':
      return String(Math.floor(Math.random() * (max - min + 1) + min));
      
    case 'decimal':
      return (Math.random() * (max - min) + min).toFixed(4);
      
    case 'hexadecimal': {
      const num = Math.floor(Math.random() * (max - min + 1) + min);
      return '0x' + num.toString(16).toUpperCase();
    }
    
    case 'uuid':
      return crypto.randomUUID();
      
    default:
      return String(Math.floor(Math.random() * (max - min + 1) + min));
  }
};