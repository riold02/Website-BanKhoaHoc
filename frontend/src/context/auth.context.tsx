import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types/auth.types';
import { authApi } from '../services/auth.api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  role: UserRole | null;
  isLoading: boolean;
  login: (usernameOrEmail: string, pass: string) => Promise<User>;
  register: (payload: any) => Promise<User>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('cms_access_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshUser = async () => {
    const storedToken = localStorage.getItem('cms_access_token');
    if (!storedToken) {
      setUser(null);
      setToken(null);
      setIsLoading(false);
      return;
    }

    try {
      const me = await authApi.getMe();
      setUser(me);
      setToken(storedToken);
      localStorage.setItem('cms_user', JSON.stringify(me));
    } catch (error) {
      console.error('Lỗi khi tải thông tin user:', error);
      logout();
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = async (usernameOrEmail: string, pass: string): Promise<User> => {
    const result = await authApi.login({ usernameOrEmail, password: pass });
    localStorage.setItem('cms_access_token', result.tokens.accessToken);
    localStorage.setItem('cms_refresh_token', result.tokens.refreshToken);
    localStorage.setItem('cms_user', JSON.stringify(result.user));
    setToken(result.tokens.accessToken);
    setUser(result.user);
    return result.user;
  };

  const register = async (payload: any): Promise<User> => {
    const result = await authApi.register(payload);
    localStorage.setItem('cms_access_token', result.tokens.accessToken);
    localStorage.setItem('cms_refresh_token', result.tokens.refreshToken);
    localStorage.setItem('cms_user', JSON.stringify(result.user));
    setToken(result.tokens.accessToken);
    setUser(result.user);
    return result.user;
  };

  const logout = () => {
    localStorage.removeItem('cms_access_token');
    localStorage.removeItem('cms_refresh_token');
    localStorage.removeItem('cms_user');
    setUser(null);
    setToken(null);
  };

  const role = (user?.role?.name as UserRole) || null;

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        role,
        isLoading,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
