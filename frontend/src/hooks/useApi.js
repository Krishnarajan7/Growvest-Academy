import { useState, useCallback } from 'react';
import { adminApi, studentApi } from '@/lib/axios';
import { useToast } from '@/hooks/use-toast';

export const useApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { toast } = useToast();

  const callApi = useCallback(async (apiCall, successMessage = null, errorMessage = null, showToast = true) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiCall();
      
      if (showToast && successMessage && response.success) {
        toast({
          title: 'Success',
          description: successMessage,
        });
      }
      
      if (showToast && !response.success && errorMessage) {
        toast({
          title: 'Error',
          description: errorMessage,
          variant: 'destructive',
        });
      }
      
      return response;
    } catch (err) {
      console.error('API Error:', err);
      setError(err.message || 'An error occurred');
      
      if (showToast) {
        toast({
          title: 'Error',
          description: errorMessage || err.message || 'An error occurred',
          variant: 'destructive',
        });
      }
      
      return { success: false, message: err.message };
    } finally {
      setLoading(false);
    }
  }, [toast]);

  return {
    loading,
    error,
    callApi,
    adminApi,
    studentApi,
  };
};