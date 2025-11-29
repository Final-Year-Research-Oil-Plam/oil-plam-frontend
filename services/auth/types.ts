export interface RegisterFormData {
  nic: string;
  username: string;
  password: string;
  confirmPassword: string;
}

export interface LoginFormData {
  username: string;
  password: string;
}

export interface AuthResponse {
  userId?: number;
  username?: string;
  nic?: string;
  token?: string;
}
