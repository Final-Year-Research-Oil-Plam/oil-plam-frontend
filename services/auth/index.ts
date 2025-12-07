// src/services/auth/index.ts
import { apiPost, setAuthToken } from '../api';
import { RegisterFormData, LoginFormData, AuthResponse } from './types';

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  error?: any;
}

// ----------------------
// Register user
// ----------------------
export const registerUser = async (
  nic: string,
  username: string,
  password: string,
  confirmPassword: string
): Promise<ApiResponse<AuthResponse>> => {
  try {
    const formData: RegisterFormData = {
      nic,
      username,
      password,
      confirmPassword,
    };

    const data = await apiPost<ApiResponse<AuthResponse>>(
      '/auth/register',
      formData
    );

    return data;
  } catch (error: any) {
    console.error('Registration error:', error);
    return {
      success: false,
      message: error?.message || 'Network error. Please check your connection.',
    };
  }
};


// ----------------------
// Login user
// ----------------------
export const loginUser = async (
  formData: LoginFormData
): Promise<ApiResponse<AuthResponse>> => {
  try {
    const data = await apiPost<ApiResponse<AuthResponse>>(
      '/auth/login',
      formData
    );

    // If login successful, you can automatically set the token
    // if (data.success && data.data?.token) {
    //   setAuthToken(data.data.token);
    // }

    return data;
  } catch (error: any) {
    console.error('Login error:', error);
    return {
      success: false,
      message: error?.message || 'Network error. Please check your connection.',
    };
  }
};

// ----------------------
// Optional: Logout
// ----------------------
export const logoutUser = () => {
  setAuthToken(null);
};

// ----------------------
// Re-export types
// ----------------------
export type { RegisterFormData, LoginFormData, AuthResponse };
export { validateRegistration, validateLogin } from './validation';
