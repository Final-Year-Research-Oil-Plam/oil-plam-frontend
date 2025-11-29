// API Configuration
// For web development, use localhost. For mobile devices, use your computer's IP address
// To find your IP: On Mac/Linux run `ifconfig` or `ipconfig` on Windows

export const API_BASE_URL = __DEV__ 
  ? (typeof window !== 'undefined' && window.location?.hostname === 'localhost' 
      ? 'http://localhost:3000/api'  // Web development - use localhost
      : 'http://192.168.1.39:3000/api')  // Mobile devices - use your computer's IP with port 3000
  : 'https://your-production-api.com/api'; // Production

// For physical devices, replace 192.168.1.39 with your computer's IP address
// Example: 'http://192.168.1.100:3000/api'

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  user?: T;
  userId?: number;
}
