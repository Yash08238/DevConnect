import { createContext, useState, useEffect, useContext } from 'react';
import { authService } from '../services/auth.service';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const checkAuth = async () => {
    try {
      setLoading(true);
      const res = await authService.getMe();
      if (res.success && res.data) {
        setUser(res.data);
      } else {
        setUser(null);
        localStorage.removeItem('token');
      }
    } catch (err) {
      setUser(null);
      localStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const login = async (email, password) => {
    try {
      setError(null);
      setLoading(true);
      const res = await authService.login({ email, password });
      if (res.success && res.data?.user) {
        if (res.data.accessToken) {
          localStorage.setItem('token', res.data.accessToken);
        }
        setUser(res.data.user);
        return true;
      }
      return false;
    } catch (err) {
      setError(err.message || 'Login failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      setError(null);
      setLoading(true);
      const res = await authService.register(userData);
      if (res.success && res.data?.user) {
        if (res.data.accessToken) {
          localStorage.setItem('token', res.data.accessToken);
        }
        setUser(res.data.user);
        return true;
      }
      return false;
    } catch (err) {
      setError(err.message || 'Registration failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setUser(null);
      localStorage.removeItem('token');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        setUser,
        login,
        register,
        logout,
        checkAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
