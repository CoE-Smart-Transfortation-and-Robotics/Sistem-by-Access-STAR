import { useState, useEffect } from 'react';
import { authService } from '../services/authService';

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = authService.getUser();
    setUser(user);
    setLoading(false);
  }, []);

  return {
    user,
    loading,
    isAuthenticated: !!user,
    role: user?.role
  };
};