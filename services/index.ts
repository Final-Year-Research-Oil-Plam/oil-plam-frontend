// Main services barrel export file
// Re-export commonly used functions and types from auth and tree services

export { API_BASE_URL, type ApiResponse } from './api-config';

// Auth exports
export {
  registerUser,
  loginUser,
  type RegisterFormData,
  type LoginFormData,
  type AuthResponse,
  validateRegistration,
  validateLogin,
} from './auth';

// Tree exports
export {
  addTree,
  getTreeById,
  getAllTrees,
  type TreeData,
  type TreeResponse,
  validateTreeForm,
  validateGpsCoordinates,
  validateFertilizerQty,
  formatDate,
  formatDateDisplay,
  calculateTreeAge,
  isValidDate,
  isDateInPast,
} from './tree';

// Health check
export async function checkApiHealth(): Promise<boolean> {
  const { API_BASE_URL } = await import('./api-config');
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    const data = await response.json();
    return data.status === 'ok';
  } catch (error) {
    console.error('API health check failed:', error);
    return false;
  }
}
