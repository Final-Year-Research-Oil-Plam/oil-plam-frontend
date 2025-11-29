import { RegisterFormData, LoginFormData } from './types';

export const validateRegistration = (formData: RegisterFormData): { valid: boolean; error?: string } => {
  const { nic, username, password, confirmPassword } = formData;

  if (!nic || !username || !password || !confirmPassword) {
    return {
      valid: false,
      error: 'Please fill in all fields',
    };
  }

  if (password !== confirmPassword) {
    return {
      valid: false,
      error: 'Passwords do not match',
    };
  }

  if (password.length < 6) {
    return {
      valid: false,
      error: 'Password must be at least 6 characters',
    };
  }

  return { valid: true };
};

export const validateLogin = (formData: LoginFormData): { valid: boolean; error?: string } => {
  const { username, password } = formData;

  if (!username || !password) {
    return {
      valid: false,
      error: 'Please enter username and password',
    };
  }

  return { valid: true };
};
