import React, { createContext, useState, useContext, useEffect } from 'react';
import { adminApi, authHelper } from '@/lib/axios';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check if admin is already logged in
    const checkAuth = async () => {
      try {
        const adminData = authHelper.getAdminData();
        const token = authHelper.getAdminToken();
        
        if (token && adminData) {
          setAdmin(adminData);
        } else {
          // Try to fetch profile if token exists
          if (token) {
            const response = await adminApi.getProfile();
            if (response.success) {
              setAdmin(response.data);
              authHelper.setAdminData(response.data);
            } else {
              authHelper.clearTokens();
            }
          }
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        authHelper.clearTokens();
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email, password, deviceName = 'admin-panel') => {
    try {
      setError(null);
      const response = await adminApi.login({
        email,
        password,
        device_name: deviceName
      });

      if (response.success) {
        const { admin, token } = response;
        
        // Store token and admin data
        authHelper.setAdminToken(token);
        authHelper.setAdminData(admin);
        
        // Update state
        setAdmin(admin);
        
        return { success: true, data: admin };
      } else {
        setError(response.message || 'Login failed');
        return { success: false, message: response.message };
      }
    } catch (error) {
      setError(error.message || 'Login failed');
      return { success: false, message: error.message };
    }
  };

  const logout = async () => {
    try {
      await adminApi.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear everything regardless of API call success
      authHelper.clearTokens();
      setAdmin(null);
      setError(null);
    }
  };

  const updateProfile = async (data) => {
    try {
      const response = await adminApi.updateProfile(data);
      
      if (response.success) {
        const updatedAdmin = response.data;
        setAdmin(updatedAdmin);
        authHelper.setAdminData(updatedAdmin);
        
        return { success: true, data: updatedAdmin };
      } else {
        setError(response.message || 'Update failed');
        return { success: false, message: response.message };
      }
    } catch (error) {
      setError(error.message || 'Update failed');
      return { success: false, message: error.message };
    }
  };

  const changePassword = async (data) => {
    try {
      const response = await adminApi.changePassword(data);
      return response;
    } catch (error) {
      setError(error.message || 'Password change failed');
      return { success: false, message: error.message };
    }
  };

  const value = {
    admin,
    loading,
    error,
    login,
    logout,
    updateProfile,
    changePassword,
    isAuthenticated: !!admin,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Protected Route Component
export const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect to login page
    window.location.href = '/admin/login';
    return null;
  }

  return children;
};