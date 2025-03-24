export const formatCurrency = (
  amount: number, 
  countryCode: string = `vi-VN`, 
  currency: string = `VND`, 
): string => 
  new Intl.NumberFormat(countryCode, {
    style: `currency`,
    currency: currency,
    trailingZeroDisplay: `stripIfInteger`, 
  }).format(amount);
