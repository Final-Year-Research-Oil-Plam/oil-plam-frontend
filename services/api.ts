// src/services/api.ts
import axios, { AxiosInstance, AxiosRequestConfig } from "axios";

// Change to your backend URL
const API_BASE_URL = "http://localhost:3000/api";

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Optional: Request interceptor to attach token
export const setAuthToken = (token: string | null) => {
  if (token) {
    apiClient.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete apiClient.defaults.headers.common["Authorization"];
  }
};

// -------------------
// GET Request
// -------------------
export const apiGet = async <T>(path: string, params?: any): Promise<T> => {
  const response = await apiClient.get<T>(path, { params });
  return response.data;
};

// -------------------
// POST Request
// -------------------
export const apiPost = async <T>(path: string, body: any): Promise<T> => {
  const response = await apiClient.post<T>(path, body);
  return response.data;
};
