'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode
} from 'react';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  email: string;
  full_name: string;
  role: string;
  is_active: boolean;
}

interface AuthContextType {
  token: string | null;
  user: User | null;
  setToken: (accessToken: string, refreshToken?: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setTokenState] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  // Load from localStorage
  useEffect(() => {
    // 支援兩種 key 名稱
    const storedToken = localStorage.getItem('token') || localStorage.getItem('access_token');
    const storedUser = localStorage.getItem('user');
    if (storedToken) setTokenState(storedToken);
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        setUser(parsed?.data ?? parsed);
      } catch {
        // If parsing fails, clear invalid user data
        localStorage.removeItem('user');
      }
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
      localStorage.setItem('access_token', token); // 同時存儲到兩個 key
    } else {
      localStorage.removeItem('token');
      localStorage.removeItem('access_token');
    }

    if (user) localStorage.setItem('user', JSON.stringify(user));
    else localStorage.removeItem('user');
  }, [token, user]);

  const setToken = async (accessToken: string, refreshToken?: string) => {
    setTokenState(accessToken);
    
    // 存儲 refresh token
    if (refreshToken) {
      localStorage.setItem('refresh_token', refreshToken);
    }
    
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/users/me/`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!res.ok) throw new Error('Failed to fetch user details');

      const json = await res.json();
      const userData: User = json?.data ?? json;
      setUser(userData);

      router.replace('/dashboard/overview');
    } catch (error) {
      console.error(error);
      logout();
    }
  };

  const logout = () => {
    setTokenState(null);
    setUser(null);
    localStorage.clear();
    router.replace('/auth/sign-in');
  };

  return (
    <AuthContext.Provider value={{ token, user, setToken, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
