/**
 * Currency formatting utilities for INR (Indian Rupees)
 */

/**
 * Formats a number as Indian Rupees currency
 * @param amount - The amount to format
 * @returns Formatted currency string with ₹ symbol
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

/**
 * Formats a number as Indian Rupees currency without decimal places for whole numbers
 * @param amount - The amount to format
 * @returns Formatted currency string with ₹ symbol
 */
export function formatCurrencyCompact(amount: number): string {
  const isWholeNumber = amount % 1 === 0
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: isWholeNumber ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(amount)
}
