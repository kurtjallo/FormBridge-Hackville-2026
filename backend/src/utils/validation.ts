/**
 * Backend Validation Utilities
 * SIN validation, postal code validation, and formatters for Canadian data
 */

/**
 * Validates a Canadian Social Insurance Number using the Luhn algorithm
 * @param sin - The SIN to validate (with or without dashes)
 * @returns true if valid SIN
 */
export function isValidSIN(sin: string): boolean {
  const digits = sin.replace(/\D/g, '');

  if (digits.length !== 9) {
    return false;
  }

  // Luhn algorithm
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    let digit = parseInt(digits[i], 10);

    // Double every second digit (index 1, 3, 5, 7)
    if (i % 2 === 1) {
      digit *= 2;
      // If doubling results in number > 9, subtract 9
      if (digit > 9) {
        digit -= 9;
      }
    }
    sum += digit;
  }

  return sum % 10 === 0;
}

/**
 * Checks if a SIN belongs to a temporary resident (starts with 9)
 * @param sin - The SIN to check
 * @returns true if temporary resident SIN
 */
export function isTemporaryResidentSIN(sin: string): boolean {
  const digits = sin.replace(/\D/g, '');
  return digits.startsWith('9');
}

/**
 * Validates a Canadian postal code format
 * @param code - The postal code to validate
 * @returns true if valid Canadian postal code format
 */
export function isValidCanadianPostalCode(code: string): boolean {
  // Format: A1A 1A1 or A1A1A1 (with optional space or dash)
  return /^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/.test(code);
}

/**
 * Validates that a postal code is from Ontario
 * Ontario postal codes start with: K, L, M, N, P
 * @param code - The postal code to validate
 * @returns true if valid Ontario postal code
 */
export function isOntarioPostalCode(code: string): boolean {
  if (!isValidCanadianPostalCode(code)) {
    return false;
  }

  const ontarioPrefixes = ['K', 'L', 'M', 'N', 'P'];
  return ontarioPrefixes.includes(code[0].toUpperCase());
}

/**
 * Formats a SIN as XXX-XXX-XXX
 * @param sin - The SIN to format
 * @returns Formatted SIN string
 */
export function formatSIN(sin: string): string {
  const digits = sin.replace(/\D/g, '');
  if (digits.length !== 9) {
    return sin; // Return original if invalid
  }
  return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6, 9)}`;
}

/**
 * Formats a postal code as A1A 1A1
 * @param code - The postal code to format
 * @returns Formatted postal code string
 */
export function formatPostalCode(code: string): string {
  const clean = code.replace(/[\s-]/g, '').toUpperCase();
  if (clean.length !== 6) {
    return code; // Return original if invalid
  }
  return `${clean.slice(0, 3)} ${clean.slice(3, 6)}`;
}

/**
 * Validates a Canadian phone number
 * @param phone - The phone number to validate
 * @returns true if valid Canadian phone format
 */
export function isValidCanadianPhone(phone: string): boolean {
  const digits = phone.replace(/\D/g, '');
  // 10 digits, optionally with leading 1
  return digits.length === 10 || (digits.length === 11 && digits.startsWith('1'));
}

/**
 * Formats a phone number as (XXX) XXX-XXXX
 * @param phone - The phone number to format
 * @returns Formatted phone string
 */
export function formatPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');

  // Remove leading 1 if present
  const normalized = digits.startsWith('1') && digits.length === 11
    ? digits.slice(1)
    : digits;

  if (normalized.length !== 10) {
    return phone; // Return original if invalid
  }

  return `(${normalized.slice(0, 3)}) ${normalized.slice(3, 6)}-${normalized.slice(6, 10)}`;
}

/**
 * Validates an email address format
 * @param email - The email to validate
 * @returns true if valid email format
 */
export function isValidEmail(email: string): boolean {
  // Basic email validation
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * Validates a date is not in the future
 * @param dateStr - The date string to validate
 * @returns true if date is not in the future
 */
export function isNotFutureDate(dateStr: string): boolean {
  const date = new Date(dateStr);
  const today = new Date();
  today.setHours(23, 59, 59, 999); // End of today
  return date <= today;
}

/**
 * Validates a reasonable age range (0-120 years)
 * @param dateOfBirth - The date of birth string
 * @returns true if age is reasonable
 */
export function isReasonableAge(dateOfBirth: string): boolean {
  const dob = new Date(dateOfBirth);
  const today = new Date();
  const age = today.getFullYear() - dob.getFullYear();
  return age >= 0 && age <= 120;
}

/**
 * Validate a specific field by fieldId
 * @param fieldId - The field identifier
 * @param value - The value to validate
 * @returns Object with valid boolean and optional error message
 */
export function validateField(
  fieldId: string,
  value: string
): { valid: boolean; message?: string } {
  if (!value || value.trim() === '') {
    return { valid: true }; // Empty values handled by required check
  }

  switch (fieldId) {
    case 'sin':
      if (!isValidSIN(value)) {
        return { valid: false, message: 'Invalid SIN. Please enter a valid 9-digit Social Insurance Number.' };
      }
      break;

    case 'postal_code':
      if (!isValidCanadianPostalCode(value)) {
        return { valid: false, message: 'Invalid postal code format. Use A1A 1A1 format.' };
      }
      if (!isOntarioPostalCode(value)) {
        return { valid: false, message: 'Postal code must be from Ontario (starts with K, L, M, N, or P).' };
      }
      break;

    case 'phone':
      if (!isValidCanadianPhone(value)) {
        return { valid: false, message: 'Invalid phone number. Please enter a 10-digit Canadian phone number.' };
      }
      break;

    case 'email':
      if (!isValidEmail(value)) {
        return { valid: false, message: 'Invalid email address format.' };
      }
      break;

    case 'date_of_birth':
      if (!isNotFutureDate(value)) {
        return { valid: false, message: 'Date of birth cannot be in the future.' };
      }
      if (!isReasonableAge(value)) {
        return { valid: false, message: 'Please enter a valid date of birth.' };
      }
      break;
  }

  return { valid: true };
}
