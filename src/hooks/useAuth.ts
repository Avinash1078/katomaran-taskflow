/**
 * Authentication Hook
 * React hook for managing authentication state
 * Follows React best practices with proper error handling
 */

import { useState, useEffect, useCallback } from 'react';
import { User, AuthState } from '@/types/auth';
import { authService } from '@/services/authService';
import { useToast } from '@/hooks/use-toast';

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: undefined
  });

  const { toast } = useToast();

  // Initialize authentication state
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        setAuthState(prev => ({ ...prev, isLoading: true }));
        
        await authService.initializeGoogleAuth();
        
        const user = authService.getCurrentUser();
        const isValid = user ? await authService.validateSession() : false;
        
        setAuthState({
          user: isValid ? user : null,
          isAuthenticated: isValid,
          isLoading: false,
          error: undefined
        });
      } catch (error) {
        console.error('Auth initialization error:', error);
        setAuthState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: 'Failed to initialize authentication'
        });
      }
    };

    initializeAuth();
  }, []);

  // Sign in with Google
  const signInWithGoogle = useCallback(async () => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true, error: undefined }));
      
      const user = await authService.signInWithGoogle();
      
      setAuthState({
        user,
        isAuthenticated: true,
        isLoading: false,
        error: undefined
      });

      toast({
        title: "Welcome!",
        description: `Signed in as ${user.name}`,
      });

      return user;
    } catch (error: any) {
      const authError = authService.handleAuthError(error);
      
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: authError.message
      }));

      toast({
        title: "Sign In Failed",
        description: authError.message,
        variant: "destructive",
      });

      throw authError;
    }
  }, [toast]);

  // Sign out
  const signOut = useCallback(async () => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true }));
      
      await authService.signOut();
      
      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: undefined
      });

      toast({
        title: "Signed Out",
        description: "You have been signed out successfully",
      });
    } catch (error: any) {
      const authError = authService.handleAuthError(error);
      
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: authError.message
      }));

      toast({
        title: "Sign Out Failed",
        description: authError.message,
        variant: "destructive",
      });
    }
  }, [toast]);

  // Clear authentication errors
  const clearError = useCallback(() => {
    setAuthState(prev => ({ ...prev, error: undefined }));
  }, []);

  return {
    ...authState,
    signInWithGoogle,
    signOut,
    clearError
  };
};