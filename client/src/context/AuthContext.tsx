import { createContext, useState, useEffect, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../api/auth';
import type { User } from '../types';
import toast from 'react-hot-toast';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string, role?: string) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  isLoading: true,
  login: async () => {},
  signup: async () => {},
  logout: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const restoreSession = async () => {
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        try {
          const res = await authApi.getMe();
          setUser(res.data ?? null);
          setToken(storedToken);
        } catch {
          localStorage.removeItem('token');
          setToken(null);
          setUser(null);
        }
      }
      setIsLoading(false);
    };
    restoreSession();
  }, []);

  const login = async (email: string, password: string) => {
    const res = await authApi.login({ email, password });
    if (res.data) {
      localStorage.setItem('token', res.data.token);
      setToken(res.data.token);
      setUser(res.data.user);
      toast.success('Welcome back!');
      navigate('/dashboard');
    }
  };

  const signup = async (name: string, email: string, password: string, role?: string) => {
    const res = await authApi.signup({ name, email, password, role });
    if (res.data) {
      localStorage.setItem('token', res.data.token);
      setToken(res.data.token);
      setUser(res.data.user);
      toast.success('Account created successfully!');
      navigate('/dashboard');
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    toast.success('Logged out');
    navigate('/login');
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
