import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const truncateWords = (text: string, limit: number) => {
  if (!text) return '';
  const words = text.split(/\s+/).filter(w => w.length > 0);
  if (words.length > limit) {
    return words.slice(0, limit).join(' ') + '...';
  }
  return text;
};
