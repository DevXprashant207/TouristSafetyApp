import React, { createContext, useContext, useReducer, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { apiClient } from '@/services/apiClient';
import type { User, SignUpData } from '@/types';

interface AuthState {
  user: User | null;
  loading: boolean;
}

interface AuthContextValue extends AuthState {
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (data: SignUpData) => Promise<void>;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

type AuthAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_USER'; payload: User | null };

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_USER':
      return { ...state, user: action.payload, loading: false };
    default:
      return state;
  }
};

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'user_data';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, {
    user: null,
    loading: true,
  });

  // Store token securely
  const storeToken = async (token: string) => {
    try {
      await SecureStore.setItemAsync(TOKEN_KEY, token);
    } catch (error) {
      // Fallback to AsyncStorage if SecureStore is not available
      await AsyncStorage.setItem(TOKEN_KEY, token);
    }
  };

  // Get stored token
  const getStoredToken = async (): Promise<string | null> => {
    try {
      return await SecureStore.getItemAsync(TOKEN_KEY);
    } catch (error) {
      // Fallback to AsyncStorage
      return await AsyncStorage.getItem(TOKEN_KEY);
    }
  };

  // Store user data
  const storeUser = async (user: User) => {
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
  };

  // Get stored user data
  const getStoredUser = async (): Promise<User | null> => {
    try {
      const userData = await AsyncStorage.getItem(USER_KEY);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      return null;
    }
  };

  // Clear stored data
  const clearStoredData = async () => {
    try {
      await SecureStore.deleteItemAsync(TOKEN_KEY);
    } catch (error) {
      await AsyncStorage.removeItem(TOKEN_KEY);
    }
    await AsyncStorage.removeItem(USER_KEY);
  };

  // Check for existing session on app start
  useEffect(() => {
    const checkAuthState = async () => {
      try {
        const token = await getStoredToken();
        const user = await getStoredUser();

        if (token && user) {
          // Set token in API client
          apiClient.setAuthToken(token);
          dispatch({ type: 'SET_USER', payload: user });
        } else {
          dispatch({ type: 'SET_LOADING', payload: false });
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    checkAuthState();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const response = await apiClient.post<{ user: User; token: string }>('/auth/login', {
        email,
        password,
      });

      const { user, token } = response;

      await storeToken(token);
      await storeUser(user);
      apiClient.setAuthToken(token);

      dispatch({ type: 'SET_USER', payload: user });
      router.replace('/(tabs)/dashboard');
    } catch (error) {
      dispatch({ type: 'SET_LOADING', payload: false });
      throw error;
    }
  };

  const signUp = async (data: SignUpData) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const response = await apiClient.post<{ user: User; token: string }>('/auth/signup', data);

      const { user, token } = response;

      await storeToken(token);
      await storeUser(user);
      apiClient.setAuthToken(token);

      dispatch({ type: 'SET_USER', payload: user });
      router.replace('/(tabs)/dashboard');
    } catch (error) {
      dispatch({ type: 'SET_LOADING', payload: false });
      throw error;
    }
  };

  const signOut = async () => {
    await clearStoredData();
    apiClient.setAuthToken(null);
    dispatch({ type: 'SET_USER', payload: null });
    router.replace('/auth/signin');
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        signIn,
        signUp,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export { AuthContext }