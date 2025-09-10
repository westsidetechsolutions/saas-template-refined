/**
 * Password validation utility with best practices
 */

export interface PasswordValidationResult {
  isValid: boolean
  errors: string[]
  strength: 'weak' | 'medium' | 'strong' | 'very-strong'
  score: number // 0-100
  requirements: {
    minLength: boolean
    hasUppercase: boolean
    hasLowercase: boolean
    hasNumber: boolean
    hasSpecialChar: boolean
    noCommonPatterns: boolean
  }
}

/**
 * Common weak passwords to avoid
 */
const COMMON_PASSWORDS = [
  'password',
  '123456',
  '123456789',
  'qwerty',
  'abc123',
  'password123',
  'admin',
  'letmein',
  'welcome',
  'monkey',
  'dragon',
  'master',
  'football',
  'baseball',
  'superman',
  'trustno1',
  'butterfly',
  'dragon',
  'master',
  'hello',
  'freedom',
  'whatever',
  'qazwsx',
  'michael',
  'jordan',
  'harley',
  'ranger',
  'jennifer',
  'hunter',
  'buster',
  'soccer',
  'tiger',
  'charlie',
  'golf',
  'shadow',
  'silver',
  'mickey',
  'sexy',
  'thunder',
  'bailey',
  'cooper',
  'jackie',
  'angel',
  'summer',
  'love',
  'ashley',
  'nicole',
  'chelsea',
  'biteme',
  'matthew',
  'access',
  'yankees',
  '987654321',
  'dallas',
  'austin',
  'thunder',
  'taylor',
  'matrix',
  'mobilemail',
  'mom',
  'monitor',
  'monitoring',
  'montana',
  'moon',
  'moscow',
]

/**
 * Common patterns to avoid
 */
const COMMON_PATTERNS = [
  /12345/,
  /qwert/,
  /asdfg/,
  /zxcvb/,
  /11111/,
  /00000/,
  /aaaaa/,
  /bbbbb/,
  /ccccc/,
  /ddddd/,
  /eeeee/,
  /fffff/,
  /ggggg/,
  /hhhhh/,
  /iiiii/,
  /jjjjj/,
  /kkkkk/,
  /lllll/,
  /mmmmm/,
  /nnnnn/,
  /ooooo/,
  /ppppp/,
  /qqqqq/,
  /rrrrr/,
  /sssss/,
  /ttttt/,
  /uuuuu/,
  /vvvvv/,
  /wwwww/,
  /xxxxx/,
  /yyyyy/,
  /zzzzz/,
]

/**
 * Validate password strength using best practices
 */
export function validatePassword(password: string): PasswordValidationResult {
  const errors: string[] = []
  const requirements = {
    minLength: password.length >= 12,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumber: /\d/.test(password),
    hasSpecialChar: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
    noCommonPatterns: !COMMON_PATTERNS.some((pattern) => pattern.test(password)),
  }

  // Check minimum length (12 characters for strong security)
  if (!requirements.minLength) {
    errors.push('Password must be at least 12 characters long')
  }

  // Check for uppercase letters
  if (!requirements.hasUppercase) {
    errors.push('Password must contain at least one uppercase letter')
  }

  // Check for lowercase letters
  if (!requirements.hasLowercase) {
    errors.push('Password must contain at least one lowercase letter')
  }

  // Check for numbers
  if (!requirements.hasNumber) {
    errors.push('Password must contain at least one number')
  }

  // Check for special characters
  if (!requirements.hasSpecialChar) {
    errors.push('Password must contain at least one special character (!@#$%^&*()_+-=[]{}|;:,.<>?)')
  }

  // Check for common patterns
  if (!requirements.noCommonPatterns) {
    errors.push('Password contains common patterns that are not allowed')
  }

  // Check for common passwords
  if (COMMON_PASSWORDS.includes(password.toLowerCase())) {
    errors.push('Password is too common and not allowed')
  }

  // Check for repeated characters (more than 3 in a row)
  if (/(.)\1{3,}/.test(password)) {
    errors.push('Password cannot contain more than 3 repeated characters in a row')
  }

  // Check for sequential characters (like 123, abc, etc.)
  if (
    /abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz/i.test(
      password,
    )
  ) {
    errors.push('Password cannot contain sequential characters')
  }

  // Calculate strength score
  let score = 0
  if (requirements.minLength) score += 20
  if (requirements.hasUppercase) score += 15
  if (requirements.hasLowercase) score += 15
  if (requirements.hasNumber) score += 15
  if (requirements.hasSpecialChar) score += 15
  if (requirements.noCommonPatterns) score += 10
  if (password.length >= 16) score += 10 // Bonus for longer passwords

  // Determine strength level
  let strength: 'weak' | 'medium' | 'strong' | 'very-strong'
  if (score < 60) strength = 'weak'
  else if (score < 80) strength = 'medium'
  else if (score < 95) strength = 'strong'
  else strength = 'very-strong'

  return {
    isValid: errors.length === 0,
    errors,
    strength,
    score,
    requirements,
  }
}

/**
 * Get password strength color for UI
 */
export function getPasswordStrengthColor(strength: string): string {
  switch (strength) {
    case 'weak':
      return 'text-red-600 bg-red-50 border-red-200'
    case 'medium':
      return 'text-orange-600 bg-orange-50 border-orange-200'
    case 'strong':
      return 'text-yellow-600 bg-yellow-50 border-yellow-200'
    case 'very-strong':
      return 'text-green-600 bg-green-50 border-green-200'
    default:
      return 'text-gray-600 bg-gray-50 border-gray-200'
  }
}

/**
 * Get password strength label for UI
 */
export function getPasswordStrengthLabel(strength: string): string {
  switch (strength) {
    case 'weak':
      return 'Weak'
    case 'medium':
      return 'Medium'
    case 'strong':
      return 'Strong'
    case 'very-strong':
      return 'Very Strong'
    default:
      return 'Unknown'
  }
}
