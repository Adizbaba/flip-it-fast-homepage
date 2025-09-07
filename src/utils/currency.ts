/**
 * Format a number as Nigerian Naira currency
 */
export const formatNGN = (amount: number): string => {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
};

/**
 * Format a number as NGN with symbol only
 */
export const formatNGNSimple = (amount: number): string => {
  return `₦${amount.toLocaleString('en-NG', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
};

/**
 * Convert USD to NGN (approximate conversion for display)
 * In production, you should use real-time exchange rates
 */
export const convertUSDToNGN = (usdAmount: number): number => {
  // Using approximate rate - in production, fetch from API
  const exchangeRate = 1600; // 1 USD = ~1600 NGN (adjust as needed)
  return usdAmount * exchangeRate;
};

export const CURRENCY_SYMBOL = '₦';
export const CURRENCY_CODE = 'NGN';