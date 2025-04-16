export function formatCurrency(amount: number, isMasked: boolean) {
  if (isMasked) return "***";

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(amount);
}