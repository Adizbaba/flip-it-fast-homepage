
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return amount.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

export function calculateTimeLeft(endDate: Date): {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isEnded: boolean;
} {
  const now = new Date().getTime();
  const endTime = new Date(endDate).getTime();
  const difference = endTime - now;
  
  if (difference <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, isEnded: true };
  }
  
  // Calculate time units
  const days = Math.floor(difference / (1000 * 60 * 60 * 24));
  const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((difference % (1000 * 60)) / 1000);
  
  return { days, hours, minutes, seconds, isEnded: false };
}

export function getUniqueArray<T>(array: T[], property: keyof T): T[] {
  return array.filter((obj, index, self) =>
    index === self.findIndex((el) => el[property] === obj[property])
  );
}
