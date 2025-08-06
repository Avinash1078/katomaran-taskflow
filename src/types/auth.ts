/**
 * Authentication Types
 * Google Auth and user session management
 */

export interface User {
  id: string;
  email: string;
  name: string;
  picture?: string;
  provider: 'google' | 'email';
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error?: string;
}

export interface GoogleAuthResponse {
  access_token: string;
  id_token: string;
  user: {
    id: string;
    email: string;
    name: string;
    picture: string;
  };
}

export interface AuthError {
  code: string;
  message: string;
  details?: any;
}