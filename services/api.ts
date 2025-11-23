// API Configuration
// For web development, use localhost. For mobile devices, use your computer's IP address
// To find your IP: On Mac/Linux run `ifconfig` or `ipconfig` on Windows
const API_BASE_URL = __DEV__ 
  ? (typeof window !== 'undefined' && window.location?.hostname === 'localhost' 
      ? 'http://localhost:3000/api'  // Web development - use localhost
      : 'http://192.168.1.39:3000/api')  // Mobile devices - use your computer's IP with port 3000
  : 'https://your-production-api.com/api'; // Production

// For physical devices, replace 192.168.1.39 with your computer's IP address
// Example: 'http://192.168.1.100:3000/api'

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  user?: T;
  userId?: number;
}

// Register user
export async function registerUser(
  nic: string,
  username: string,
  password: string,
  confirmPassword: string
): Promise<ApiResponse<any>> {
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
): Promise<ApiResponse<any>> {
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

// Health check
export async function checkApiHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    const data = await response.json();
    return data.status === 'ok';
  } catch (error) {
    console.error('API health check failed:', error);
    return false;
  }
}

