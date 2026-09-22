import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Role, AuthResponse } from '../types';
import { authApi } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  role: Role;
  isLoading: boolean;
  login: (usernameOrEmail: string, pass: string) => Promise<void>;
  quickLoginAsRole: (role: 'RETAILER' | 'WHOLESALER' | 'ADMIN') => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('retailinsight_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const saveAuth = (authData: AuthResponse) => {
    localStorage.setItem('retailinsight_token', authData.token);
    setToken(authData.token);
    const u: User = {
      id: authData.id,
      username: authData.username,
      email: authData.email,
      fullName: authData.fullName,
      businessName: authData.businessName,
      role: authData.role,
    };
    setUser(u);
    localStorage.setItem('retailinsight_user', JSON.stringify(u));
  };

  const login = async (usernameOrEmail: string, pass: string) => {
    setIsLoading(true);
    try {
      const res = await authApi.login(usernameOrEmail, pass);
      saveAuth(res);
    } finally {
      setIsLoading(false);
    }
  };

  const quickLoginAsRole = async (targetRole: 'RETAILER' | 'WHOLESALER' | 'ADMIN') => {
    setIsLoading(true);
    try {
      let username = 'retailer';
      if (targetRole === 'WHOLESALER') username = 'wholesaler';
      if (targetRole === 'ADMIN') username = 'admin';

      const res = await authApi.login(username, 'password123');
      saveAuth(res);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('retailinsight_token');
    localStorage.removeItem('retailinsight_user');
    setToken(null);
    setUser(null);
  };

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('retailinsight_token');
      const storedUser = localStorage.getItem('retailinsight_user');

      if (storedToken && storedUser) {
        try {
          setUser(JSON.parse(storedUser));
          setToken(storedToken);
          // Refresh from backend in background
          authApi.getCurrentUser().then((freshUser) => {
            setUser(freshUser);
            localStorage.setItem('retailinsight_user', JSON.stringify(freshUser));
          }).catch(() => {
            // keep stored user if offline
          });
        } catch {
          logout();
        }
      } else {
        // Auto-login as demo retailer for instant frictionless demo experience
        try {
          const res = await authApi.login('retailer', 'password123');
          saveAuth(res);
        } catch {
          // backend might still be launching
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const role: Role = user?.role || 'ROLE_RETAILER';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        role,
        isLoading,
        login,
        quickLoginAsRole,
        logout,
        isAuthenticated: !!token,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
