/**
 * Authentication Service
 * Handles Google OAuth and user session management
 * Mock implementation for demo - replace with real OAuth in production
 */

import { User, AuthState, GoogleAuthResponse, AuthError as AuthErrorType } from '@/types/auth';

class AuthService {
  private readonly USER_STORAGE_KEY = 'todo_user';
  private readonly TOKEN_STORAGE_KEY = 'todo_token';

  /**
   * Initialize Google OAuth (mock implementation)
   * In production, integrate with Google OAuth 2.0
   */
  async initializeGoogleAuth(): Promise<void> {
    // Mock initialization - in production use Google OAuth SDK
    console.log('Google Auth initialized');
  }

  /**
   * Sign in with Google (mock implementation)
   * Returns user data on success
   */
  async signInWithGoogle(): Promise<User> {
    try {
      // Simulate API call delay
      await this.delay(1000);

      // Mock successful Google login
      // In production, replace with actual Google OAuth flow
      const mockUser: User = {
        id: `user_${Date.now()}`,
        email: 'demo@todoapp.com',
        name: 'Demo User',
        picture: 'https://via.placeholder.com/150/007acc/ffffff?text=Demo',
        provider: 'google'
      };

      // Save user session
      this.saveUserToStorage(mockUser);
      this.saveTokenToStorage('mock_google_token_' + Date.now());

      return mockUser;
    } catch (error) {
      console.error('Google sign-in error:', error);
      throw new AuthError({
        code: 'GOOGLE_SIGNIN_FAILED',
        message: 'Failed to sign in with Google',
        details: error
      });
    }
  }

  /**
   * Sign out current user
   */
  async signOut(): Promise<void> {
    try {
      // Clear local storage
      localStorage.removeItem(this.USER_STORAGE_KEY);
      localStorage.removeItem(this.TOKEN_STORAGE_KEY);
      
      // In production, revoke Google tokens
      console.log('User signed out successfully');
    } catch (error) {
      console.error('Sign out error:', error);
      throw new AuthError({
        code: 'SIGNOUT_FAILED',
        message: 'Failed to sign out',
        details: error
      });
    }
  }

  /**
   * Get current authenticated user
   */
  getCurrentUser(): User | null {
    try {
      const stored = localStorage.getItem(this.USER_STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    const user = this.getCurrentUser();
    const token = localStorage.getItem(this.TOKEN_STORAGE_KEY);
    return !!(user && token);
  }

  /**
   * Get stored auth token
   */
  getAuthToken(): string | null {
    return localStorage.getItem(this.TOKEN_STORAGE_KEY);
  }

  /**
   * Validate current session
   * In production, verify token with backend
   */
  async validateSession(): Promise<boolean> {
    try {
      const user = this.getCurrentUser();
      const token = this.getAuthToken();
      
      if (!user || !token) {
        return false;
      }

      // Mock validation - in production, validate with backend
      await this.delay(500);
      return true;
    } catch (error) {
      console.error('Session validation error:', error);
      return false;
    }
  }

  /**
   * Handle authentication errors
   */
  handleAuthError(error: any): AuthError {
    if (error instanceof AuthError) {
      return error;
    }

    return new AuthError({
      code: 'UNKNOWN_AUTH_ERROR',
      message: error.message || 'An authentication error occurred',
      details: error
    });
  }

  // Private helper methods
  private saveUserToStorage(user: User): void {
    localStorage.setItem(this.USER_STORAGE_KEY, JSON.stringify(user));
    localStorage.setItem('todo_user_id', user.id);
  }

  private saveTokenToStorage(token: string): void {
    localStorage.setItem(this.TOKEN_STORAGE_KEY, token);
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Custom error class
class AuthError extends Error {
  code: string;
  details?: any;

  constructor({ code, message, details }: { code: string; message: string; details?: any }) {
    super(message);
    this.name = 'AuthError';
    this.code = code;
    this.details = details;
  }
}

// Export singleton instance
export const authService = new AuthService();