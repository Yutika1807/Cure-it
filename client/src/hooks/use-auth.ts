import { useState, useEffect } from 'react';
import { authService, type User } from '@/lib/supabase';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const currentUser = await authService.getCurrentUser();
        setUser(currentUser);
      } catch (error) {
        console.error('Auth check failed:', error);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string) => {
    const session = await authService.login(email);
    setUser(session.user);
    return session;
  };

  const logout = async () => {
    try {
      await authService.logout();
      setUser(null);
      // Force a page refresh to clear any cached state
      window.location.href = '/';
    } catch (error) {
      console.error('Logout error:', error);
      // Even if logout fails on server, clear local state
      setUser(null);
      localStorage.removeItem('sessionId');
      window.location.href = '/';
    }
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
  };

  return {
    user,
    login,
    logout,
    updateUser,
    loading,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
  };
}
