
import Constants from 'expo-constants';

const { API_URL_DEV, API_URL_PROD } = Constants.expoConfig?.extra || {};

export const API_BASE_URL = __DEV__ ? API_URL_DEV : API_URL_PROD;

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  user?: T;
  userId?: number;
}
