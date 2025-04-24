export type NumberFormat = 'integer' | 'decimal' | 'hexadecimal' | 'uuid';

export interface GeneratedNumber {
  value: string;
  format: NumberFormat;
  timestamp: Date;
}