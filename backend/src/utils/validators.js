/**
 * Email validation
 * @param {string} email
 * @returns {boolean}
 */
export const isValidEmail = (email) => {
  const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
  return emailRegex.test(email);
};

/**
 * Password validation (minimum 6 characters)
 * @param {string} password
 * @returns {boolean}
 */
export const isValidPassword = (password) => {
  return typeof password === 'string' && password.length >= 6;
};

/**
 * Interest validation
 * @param {Array<string>} interests
 * @returns {boolean}
 */
export const isValidInterests = (interests) => {
  return (
    Array.isArray(interests) &&
    interests.length > 0 &&
    interests.every((interest) => typeof interest === 'string' && interest.trim().length > 0)
  );
};

/**
 * Full name validation
 * @param {string} fullName
 * @returns {boolean}
 */
export const isValidFullName = (fullName) => {
  return typeof fullName === 'string' && fullName.trim().length >= 2;
};

/**
 * Validate registration data
 * @param {Object} data
 * @returns {Object} {valid: boolean, errors: Array}
 */
export const validateRegistration = (data) => {
  const errors = [];

  if (!isValidEmail(data.email)) {
    errors.push('Invalid email format');
  }

  if (!isValidPassword(data.password)) {
    errors.push('Password must be at least 6 characters');
  }

  if (!isValidFullName(data.fullName)) {
    errors.push('Full name must be at least 2 characters');
  }

  if (!isValidInterests(data.interests)) {
    errors.push('At least one valid interest is required');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};

/**
 * Validate login data
 * @param {Object} data
 * @returns {Object} {valid: boolean, errors: Array}
 */
export const validateLogin = (data) => {
  const errors = [];

  if (!isValidEmail(data.email)) {
    errors.push('Invalid email format');
  }

  if (!data.password) {
    errors.push('Password is required');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};

export default {
  isValidEmail,
  isValidPassword,
  isValidInterests,
  isValidFullName,
  validateRegistration,
  validateLogin,
};
