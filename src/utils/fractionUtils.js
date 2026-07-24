/**
 * Woodworking Fraction Utilities
 * Handles parsing fraction strings (e.g., "14 1/2", "14-3/8", "14.5") to decimal numbers,
 * and converting decimal numbers back into standardized woodworking fractions (to 1/16" or 1/32").
 */

// Common fraction representations
const FRACTION_MAP = {
  '1/16': 0.0625,
  '1/8': 0.125,
  '3/16': 0.1875,
  '1/4': 0.25,
  '5/16': 0.3125,
  '3/8': 0.375,
  '7/16': 0.4375,
  '1/2': 0.5,
  '9/16': 0.5625,
  '5/8': 0.625,
  '11/16': 0.6875,
  '3/4': 0.75,
  '13/16': 0.8125,
  '7/8': 0.875,
  '15/16': 0.9375,
};

/**
 * Parse any fraction or decimal string to a float number (inches)
 * Examples: "14 1/2", "14-1/2", "14.5", "14 3/8", "1/2"
 */
export function parseFraction(input) {
  if (typeof input === 'number') return isNaN(input) ? 0 : input;
  if (!input || typeof input !== 'string') return 0;

  const trimmed = input.trim();
  if (trimmed === '') return 0;

  // Direct float check
  if (!isNaN(trimmed)) {
    return parseFloat(trimmed);
  }

  // Replace hyphens between whole number and fraction with space
  const normalized = trimmed.replace(/^(\d+)-(\d+\/\d+)$/, '$1 $2');
  const parts = normalized.split(/\s+/);

  if (parts.length === 1) {
    // Just a fraction like "3/4"
    if (parts[0].includes('/')) {
      const [num, den] = parts[0].split('/').map(Number);
      return den && !isNaN(num) && !isNaN(den) ? num / den : 0;
    }
    return parseFloat(parts[0]) || 0;
  }

  if (parts.length === 2) {
    const whole = parseFloat(parts[0]) || 0;
    if (parts[1].includes('/')) {
      const [num, den] = parts[1].split('/').map(Number);
      const frac = den && !isNaN(num) && !isNaN(den) ? num / den : 0;
      return whole + frac;
    }
  }

  return parseFloat(input) || 0;
}

/**
 * Greatest Common Divisor helper
 */
function gcd(a, b) {
  return b ? gcd(b, a % b) : a;
}

/**
 * Formats a decimal number into a clean woodworking fraction string.
 * Precision: 16 (for 1/16ths) or 32 (for 1/32nds)
 * Output example: "14 1/2"", "27 7/16"", "16""
 */
export function formatFraction(val, precision = 16) {
  if (val === null || val === undefined || isNaN(val)) return '0"';

  const isNegative = val < 0;
  const absVal = Math.abs(val);
  const whole = Math.floor(absVal);
  const remainder = absVal - whole;

  // Round to closest fraction denominator step
  const totalSteps = Math.round(remainder * precision);
  
  if (totalSteps === 0) {
    const str = `${whole}"`;
    return isNegative ? `-${str}` : str;
  }

  if (totalSteps === precision) {
    const str = `${whole + 1}"`;
    return isNegative ? `-${str}` : str;
  }

  const divisor = gcd(totalSteps, precision);
  const num = totalSteps / divisor;
  const den = precision / divisor;

  const fracStr = whole > 0 ? `${whole} ${num}/${den}"` : `${num}/${den}"`;
  return isNegative ? `-${fracStr}` : fracStr;
}

/**
 * Returns formatted decimal with fixed places
 */
export function formatDecimal(val, places = 3) {
  if (isNaN(val)) return '0.000';
  return Number(val).toFixed(places);
}

/**
 * Convert inches to fraction display object containing both fraction and decimal strings
 */
export function formatMeasurement(val, precision = 16) {
  return {
    decimal: formatDecimal(val, 3),
    fraction: formatFraction(val, precision),
    raw: val
  };
}
