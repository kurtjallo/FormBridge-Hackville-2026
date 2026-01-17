// Canadian Postal Code validation
export function isValidCanadianPostalCode(code: string): boolean {
  return /^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/.test(code);
}

export function isOntarioPostalCode(code: string): boolean {
  const firstChar = code.charAt(0).toUpperCase();
  return ['K', 'L', 'M', 'N', 'P'].includes(firstChar);
}

// SIN validation with Luhn algorithm
export function isValidSIN(sin: string): boolean {
  const digits = sin.replace(/\D/g, '');
  if (digits.length !== 9) return false;

  let sum = 0;
  for (let i = 0; i < 9; i++) {
    let digit = parseInt(digits[i]);
    if (i % 2 === 1) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
  }
  return sum % 10 === 0;
}

// Check if SIN indicates temporary resident
export function isTemporaryResidentSIN(sin: string): boolean {
  return sin.replace(/\D/g, '').startsWith('9');
}

// Format SIN for display (XXX-XXX-XXX)
export function formatSIN(sin: string): string {
  const digits = sin.replace(/\D/g, '');
  if (digits.length !== 9) return sin;
  return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6, 9)}`;
}

// Format postal code for display (A1A 1A1)
export function formatPostalCode(code: string): string {
  const cleaned = code.replace(/\s|-/g, '').toUpperCase();
  if (cleaned.length !== 6) return code;
  return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)}`;
}

export interface ValidationResult {
  valid: boolean;
  message?: string;
}

export function validateField(fieldId: string, value: string): ValidationResult {
  // SIN validation
  if (fieldId.toLowerCase().includes('sin')) {
    if (!value) return { valid: true };
    if (!isValidSIN(value)) {
      return { valid: false, message: 'Please enter a valid 9-digit SIN' };
    }
    if (isTemporaryResidentSIN(value)) {
      return { valid: true, message: 'Note: This SIN indicates temporary resident status' };
    }
    return { valid: true };
  }

  // Postal code validation
  if (fieldId.toLowerCase().includes('postal')) {
    if (!value) return { valid: true };
    if (!isValidCanadianPostalCode(value)) {
      return { valid: false, message: 'Please enter a valid Canadian postal code (e.g., M5V 1A1)' };
    }
    if (!isOntarioPostalCode(value)) {
      return { valid: true, message: 'Note: This postal code is outside Ontario' };
    }
    return { valid: true };
  }

  return { valid: true };
}
