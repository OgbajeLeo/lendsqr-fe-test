export function formatCurrencyWithCommas(currencyString: string) {
     const matches = currencyString.match(/([^\d.,]+)?([\d.,]+)/);

    if (!matches) {
        return currencyString; // Return original if no number found
    }

    const currencySymbol = matches[1] || '';
    const numericString = matches[2];
 const cleanNumber = numericString.replace(/,/g, '');

    const number = parseFloat(cleanNumber);

    if (isNaN(number)) {
        return currencyString; 
    }

    const formattedNumber = number.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });

    return `${currencySymbol}${formattedNumber}`;
}