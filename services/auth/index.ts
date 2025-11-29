import { API_BASE_URL, ApiResponse } from '../api-config';
import { RegisterFormData, LoginFormData, AuthResponse } from './types';

// Register user
export async function registerUser(
  nic: string,
  username: string,
  password: string,
  confirmPassword: string
): Promise<ApiResponse<AuthResponse>> {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        nic,
        username,
        password,
        confirmPassword,
      }),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Registration error:', error);
    return {
      success: false,
      message: 'Network error. Please check your connection.',
    };
  }
}

// Login user
export async function loginUser(
  username: string,
  password: string
): Promise<ApiResponse<AuthResponse>> {
  console.log('🌐 API: Starting login request');
  console.log('🌐 API: URL:', `${API_BASE_URL}/auth/login`);
  console.log('🌐 API: Username:', username);

  try {
    console.log('🌐 API: Making fetch request...');
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username,
        password,
      }),
    });

    console.log('🌐 API: Response status:', response.status);
    console.log('🌐 API: Response ok:', response.ok);
    console.log('🌐 API: Response headers:', Object.fromEntries(response.headers.entries()));

    const data = await response.json();
    console.log('🌐 API: Response data:', JSON.stringify(data, null, 2));

    // Check if response was not ok (status code >= 400)
    if (!response.ok) {
      console.log('🌐 API: Response not OK, returning error');
      return {
        success: false,
        message: data.message || 'Login failed. Please check your credentials.',
      };
    }

    console.log('🌐 API: Returning success data');
    return data;
  } catch (error) {
    console.error('🌐 API: Network error caught:', error);
    console.error('🌐 API: Error type:', typeof error);
    console.error('🌐 API: Error message:', error instanceof Error ? error.message : 'Unknown error');
    return {
      success: false,
      message: 'Network error. Please check your connection and ensure the server is running.',
    };
  }
}

// Export types
export type { RegisterFormData, LoginFormData, AuthResponse };
export { validateRegistration, validateLogin } from './validation';
