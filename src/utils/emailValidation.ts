// List of common disposable/temporary email domains to block
const DISPOSABLE_EMAIL_DOMAINS = [
  'tempmail.com', 'temp-mail.org', 'guerrillamail.com', 'guerrillamail.org',
  'mailinator.com', 'maildrop.cc', 'yopmail.com', 'throwaway.email',
  '10minutemail.com', '10minutemail.net', 'fakeinbox.com', 'trashmail.com',
  'tempail.com', 'tempmailaddress.com', 'throwawaymail.com', 'getnada.com',
  'mohmal.com', 'emailondeck.com', 'discard.email', 'sharklasers.com',
  'spam4.me', 'grr.la', 'guerrillamail.info', 'pokemail.net', 'spam.la',
  'mailnesia.com', 'mytemp.email', 'mt2015.com', 'temp.mail', 'tempm.com',
  'tmpmail.net', 'tmpmail.org', 'temp-mail.io', 'emailfake.com', 'fakemailgenerator.com',
  'crazymailing.com', 'tempmailo.com', 'dispostable.com', 'mailcatch.com',
  'mintemail.com', 'tempinbox.com', 'wegwerfmail.de', 'guerrillamail.biz',
  'spamgourmet.com', 'spamavert.com', 'mailexpire.com', 'tempmailgen.com',
  'mailnull.com', 'spamex.com', 'jetable.org', 'trash-mail.com', 'mytrashmail.com'
];

// List of allowed/trusted email domains (major providers)
const TRUSTED_EMAIL_DOMAINS = [
  'gmail.com', 'googlemail.com',
  'yahoo.com', 'yahoo.in', 'yahoo.co.in', 'yahoo.co.uk',
  'outlook.com', 'hotmail.com', 'live.com', 'msn.com',
  'icloud.com', 'me.com', 'mac.com',
  'protonmail.com', 'proton.me',
  'aol.com',
  'zoho.com', 'zohomail.com',
  'mail.com',
  'gmx.com', 'gmx.net',
  'yandex.com', 'yandex.ru',
  'rediffmail.com',
  'fastmail.com', 'fastmail.fm'
];

export interface EmailValidationResult {
  isValid: boolean;
  error?: string;
}

export function validateEmail(email: string): EmailValidationResult {
  // Basic format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return {
      isValid: false,
      error: 'Please enter a valid email address'
    };
  }

  // Extract domain from email
  const domain = email.split('@')[1]?.toLowerCase();
  
  if (!domain) {
    return {
      isValid: false,
      error: 'Invalid email format'
    };
  }

  // Check if it's a disposable email
  if (DISPOSABLE_EMAIL_DOMAINS.includes(domain)) {
    return {
      isValid: false,
      error: 'Temporary or disposable emails are not allowed. Please use a permanent email address.'
    };
  }

  // Check for common typos in Gmail
  if (domain.includes('gmail') && domain !== 'gmail.com' && domain !== 'googlemail.com') {
    return {
      isValid: false,
      error: 'Did you mean gmail.com?'
    };
  }

  // Check for common typos in Yahoo
  if (domain.includes('yahoo') && !TRUSTED_EMAIL_DOMAINS.includes(domain)) {
    return {
      isValid: false,
      error: 'Did you mean yahoo.com?'
    };
  }

  // Check for common typos in Hotmail/Outlook
  if ((domain.includes('hotmail') || domain.includes('outlook')) && !TRUSTED_EMAIL_DOMAINS.includes(domain)) {
    return {
      isValid: false,
      error: 'Did you mean hotmail.com or outlook.com?'
    };
  }

  // Allow trusted domains and custom domains (for business emails)
  // Business emails typically have their own domain
  const isKnownTrusted = TRUSTED_EMAIL_DOMAINS.includes(domain);
  const hasValidTLD = /\.[a-z]{2,}$/i.test(domain);
  
  if (!isKnownTrusted && !hasValidTLD) {
    return {
      isValid: false,
      error: 'Please use a valid email from a trusted provider'
    };
  }

  return { isValid: true };
}

export function isDisposableEmail(email: string): boolean {
  const domain = email.split('@')[1]?.toLowerCase();
  return domain ? DISPOSABLE_EMAIL_DOMAINS.includes(domain) : false;
}

export function isTrustedEmail(email: string): boolean {
  const domain = email.split('@')[1]?.toLowerCase();
  return domain ? TRUSTED_EMAIL_DOMAINS.includes(domain) : false;
}
