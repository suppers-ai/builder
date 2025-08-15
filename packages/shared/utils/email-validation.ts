// Email validation utilities

export interface EmailValidationResult {
  isValid: boolean;
  error?: string;
}

export interface EmailListValidationResult {
  validEmails: string[];
  invalidEmails: string[];
  errors: string[];
}

/**
 * Validates a single email address using RFC 5322 regex
 */
export function validateEmail(email: string): EmailValidationResult {
  if (!email || typeof email !== 'string') {
    return { isValid: false, error: 'Email is required' };
  }

  const trimmedEmail = email.trim();
  
  if (trimmedEmail.length === 0) {
    return { isValid: false, error: 'Email cannot be empty' };
  }

  if (trimmedEmail.length > 254) {
    return { isValid: false, error: 'Email is too long (max 254 characters)' };
  }

  // RFC 5322 compliant regex (simplified but robust)
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  
  if (!emailRegex.test(trimmedEmail)) {
    return { isValid: false, error: 'Invalid email format' };
  }

  // Additional checks
  const localPart = trimmedEmail.split('@')[0];
  const domainPart = trimmedEmail.split('@')[1];

  if (localPart.length > 64) {
    return { isValid: false, error: 'Local part too long (max 64 characters)' };
  }

  if (domainPart.length > 253) {
    return { isValid: false, error: 'Domain part too long (max 253 characters)' };
  }

  // Check for consecutive dots
  if (trimmedEmail.includes('..')) {
    return { isValid: false, error: 'Consecutive dots not allowed' };
  }

  return { isValid: true };
}

/**
 * Validates a list of email addresses from various input formats
 */
export function validateEmailList(input: string): EmailListValidationResult {
  if (!input || typeof input !== 'string') {
    return {
      validEmails: [],
      invalidEmails: [],
      errors: ['Input is required']
    };
  }

  // Split by comma, semicolon, space, or newline
  const emails = input
    .split(/[,;\s\n]+/)
    .map(email => email.trim())
    .filter(email => email.length > 0);

  if (emails.length === 0) {
    return {
      validEmails: [],
      invalidEmails: [],
      errors: ['No email addresses found']
    };
  }

  const validEmails: string[] = [];
  const invalidEmails: string[] = [];
  const errors: string[] = [];

  // Remove duplicates while preserving order
  const uniqueEmails = [...new Set(emails.map(email => email.toLowerCase()))];
  
  for (const email of uniqueEmails) {
    const validation = validateEmail(email);
    
    if (validation.isValid) {
      validEmails.push(email);
    } else {
      invalidEmails.push(email);
      errors.push(`${email}: ${validation.error}`);
    }
  }

  return {
    validEmails,
    invalidEmails,
    errors: errors.length > 0 ? errors : undefined as any
  };
}

/**
 * Checks if an email domain is from a disposable email service
 */
export function isDisposableEmail(email: string): boolean {
  const disposableDomains = [
    '10minutemail.com',
    'guerrillamail.com',
    'mailinator.com',
    'tempmail.org',
    'throwaway.email',
    'temp-mail.org',
    'yopmail.com',
    // Add more as needed
  ];

  const domain = email.split('@')[1]?.toLowerCase();
  return disposableDomains.includes(domain);
}

/**
 * Sanitizes email addresses for safe storage and display
 */
export function sanitizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

/**
 * Formats email addresses for display (masks for privacy)
 */
export function maskEmail(email: string): string {
  if (!email.includes('@')) {
    return '***@***.***';
  }

  const [localPart, domainPart] = email.split('@');
  
  if (localPart.length <= 2) {
    return `${localPart[0]}*@${domainPart}`;
  }

  const maskedLocal = localPart[0] + '*'.repeat(localPart.length - 2) + localPart[localPart.length - 1];
  
  return `${maskedLocal}@${domainPart}`;
}

/**
 * Extracts domain from email address
 */
export function getEmailDomain(email: string): string | null {
  const parts = email.split('@');
  return parts.length === 2 ? parts[1].toLowerCase() : null;
}

/**
 * Validates email list with rate limiting considerations
 */
export function validateEmailListWithLimits(
  input: string, 
  maxRecipients: number = 20
): EmailListValidationResult & { exceedsLimit: boolean } {
  const result = validateEmailList(input);
  
  const exceedsLimit = result.validEmails.length > maxRecipients;
  
  if (exceedsLimit) {
    result.errors = result.errors || [];
    result.errors.push(`Too many recipients (${result.validEmails.length}). Maximum ${maxRecipients} allowed.`);
  }

  return {
    ...result,
    exceedsLimit
  };
}