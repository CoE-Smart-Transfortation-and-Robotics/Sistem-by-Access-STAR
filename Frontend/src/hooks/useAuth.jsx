import { useState, useEffect, createContext, useContext } from 'react';
import { apiService } from '../services/api';
import '../styles/common/LoadingSpinner.css';

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

  useEffect(() => {
    const initializeAuth = async () => {
      console.log('🔄 Initializing authentication...');
      const token = localStorage.getItem('token');
      
      if (token) {
        console.log('📝 Token found, validating...');
        try {
          const response = await apiService.getProfile();
          console.log('✅ Token valid, setting user:', response);
          
          // Pastikan response structure sesuai dengan API
          const userData = response.user || response.data || response;
          setUser(userData);
        } catch (error) {
          console.error('❌ Token validation failed:', error);
          localStorage.removeItem('token');
          setUser(null);
        }
      } else {
        console.log('📝 No token found');
        setUser(null);
      }
      
      setLoading(false);
      console.log('✅ Authentication initialization complete');
    };

    initializeAuth();
  }, []);

  const login = async (credentials) => {
    try {
      console.log('🔐 Attempting login...');
      const response = await apiService.login(credentials);
      
      // Debug response structure
      console.log('Login response:', response);
      
      // Simpan token
      if (response.token) {
        localStorage.setItem('token', response.token);
        console.log('💾 Token saved to localStorage');
      }
      
      // Set user data
      const userData = response.user || response.data || response;
      setUser(userData);
      console.log('✅ Login successful, user set:', userData);
      
      return response;
    } catch (error) {
      console.error('❌ Login failed:', error);
      throw error;
    }
  };

  const register = async (userData) => {
    try {
      console.log('📝 Attempting registration...');
      const response = await apiService.register(userData);
      console.log('✅ Registration successful:', response);
      return response;
    } catch (error) {
      console.error('❌ Registration failed:', error);
      throw error;
    }
  };

  const logout = () => {
    console.log('🚪 Logging out...');
    localStorage.removeItem('token');
    setUser(null);
    console.log('✅ Logout complete');
  };

  const updateProfile = async (data) => {
    try {
      console.log('📝 Updating profile...');
      const response = await apiService.updateUser(user.id, data);
      
      const userData = response.user || response.data || response;
      setUser(userData);
      console.log('✅ Profile updated:', userData);
      
      return response;
    } catch (error) {
      console.error('❌ Profile update failed:', error);
      throw error;
    }
  };

  const value = {
    user,
    login,
    register,
    logout,
    updateProfile,
    loading,
    isAuthenticated: !!user,
  };

  // Show loading state
  if (loading) {
    return (
      <AuthContext.Provider value={value}>
        <div className="auth-loading">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Restoring your session...</p>
          </div>
        </div>
      </AuthContext.Provider>
    );
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};