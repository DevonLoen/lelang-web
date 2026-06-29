export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MAX_LENGTH = 255;

export const getPasswordValidationError = (password: string, label = 'Password') => {
  if (!password.trim()) return `${label} is required`;
  if (password.length < PASSWORD_MIN_LENGTH) {
    return `${label} must be at least ${PASSWORD_MIN_LENGTH} characters`;
  }
  if (password.length > PASSWORD_MAX_LENGTH) {
    return `${label} must be at most ${PASSWORD_MAX_LENGTH} characters`;
  }
  return '';
};
