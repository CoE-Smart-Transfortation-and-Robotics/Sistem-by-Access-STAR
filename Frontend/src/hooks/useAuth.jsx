import { useState, useEffect, createContext, useContext } from 'react';
import { apiService } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false); 

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      apiService.getProfile()
        .then(response => {
          setUser(response.user);
          setIsAuthenticated(true); 
        })
        .catch(() => {
          localStorage.removeItem('token');
          setUser(null);
          setIsAuthenticated(false); 
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
      setIsAuthenticated(false); 
    }
  }, []);

  const login = async (credentials) => {
    const response = await apiService.login(credentials);
    localStorage.setItem('token', response.token);
    setUser(response.user);
    setIsAuthenticated(true); 
    return response;
  };

  const register = async (userData) => {
    const response = await apiService.register(userData);
    return response;
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setIsAuthenticated(false); 
  };

  const updateProfile = async (data) => {
    const response = await apiService.updateUser(user.id, data);
    setUser(response.user);
    return response;
  };  const value = {
    user,
    login,
    register,
    logout,
    updateProfile,
    loading,
    isAuthenticated, 
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};