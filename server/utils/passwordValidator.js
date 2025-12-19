/**
 * Password Validator Utility
 * Validates password strength according to FIRA requirements
 */

const passwordValidator = {
  /**
   * Validate password meets all requirements
   * @param {string} password - Password to validate
   * @returns {Object} - { isValid: boolean, errors: string[] }
   */
  validate(password) {
    const errors = [];

    if (!password || password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }

    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }

    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }

    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  },

  /**
   * Get password strength score
   * @param {string} password - Password to check
   * @returns {Object} - { score: number, strength: string }
   */
  getStrength(password) {
    let score = 0;
    
    if (!password) return { score: 0, strength: 'weak' };

    // Length check
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    
    // Character variety
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) score++;

    // Determine strength
    let strength = 'weak';
    if (score >= 5) strength = 'strong';
    else if (score >= 3) strength = 'medium';

    return { score, strength };
  },

  /**
   * Get requirements checklist
   * @param {string} password - Password to check
   * @returns {Object} - Requirements with met status
   */
  getRequirements(password) {
    return {
      minLength: password && password.length >= 8,
      hasUppercase: /[A-Z]/.test(password),
      hasLowercase: /[a-z]/.test(password),
      hasSpecialChar: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)
    };
  }
};

module.exports = passwordValidator;
