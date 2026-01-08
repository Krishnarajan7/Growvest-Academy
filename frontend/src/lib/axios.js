import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  timeout: 30000, // 30 seconds
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    // Get token from localStorage (for admin)
    const adminToken = localStorage.getItem('admin_token');
    
    // Get token from localStorage (for student)
    const studentToken = localStorage.getItem('student_token');
    
    // Add token to headers
    if (adminToken) {
      config.headers.Authorization = `Bearer ${adminToken}`;
    } else if (studentToken) {
      config.headers.Authorization = `Bearer ${studentToken}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    const { response } = error;
    
    // Handle different error status codes
    if (response) {
      switch (response.status) {
        case 401:
          // Clear tokens and redirect to login
          localStorage.removeItem('admin_token');
          localStorage.removeItem('student_token');
          localStorage.removeItem('admin_data');
          localStorage.removeItem('student_data');
          
          // Redirect to login page
          if (window.location.pathname !== '/login' && window.location.pathname !== '/admin/login') {
            window.location.href = '/admin/login';
          }
          break;
          
        case 403:
          console.error('Forbidden: You do not have permission to access this resource');
          break;
          
        case 404:
          console.error('Resource not found');
          break;
          
        case 422:
          console.error('Validation error:', response.data.errors);
          break;
          
        case 500:
          console.error('Server error');
          break;
          
        default:
          console.error('An error occurred');
      }
    } else {
      console.error('Network error or server is not responding');
    }
    
    // Return consistent error format
    return Promise.reject({
      success: false,
      message: response?.data?.message || error.message || 'An error occurred',
      errors: response?.data?.errors || null,
      status: response?.status || 0,
    });
  }
);

// Admin API methods
export const adminApi = {
  // Auth
  login: (data) => api.post('/admin/login', data),
  logout: () => api.post('/admin/logout'),
  getProfile: () => api.get('/admin/me'),
  updateProfile: (data) => api.put('/admin/profile', data),
  changePassword: (data) => api.post('/admin/change-password', data),
  
  // Dashboard
  getDashboardStats: () => api.get('/admin/dashboard/stats'),
  getQuickStats: () => api.get('/admin/dashboard/quick-stats'),
  getRevenueAnalytics: (params) => api.get('/admin/dashboard/revenue-analytics', { params }),
  getStudentAnalytics: () => api.get('/admin/dashboard/student-analytics'),
  getQuestionAnalytics: () => api.get('/admin/dashboard/question-analytics'),
  getSystemMetrics: () => api.get('/admin/dashboard/system-metrics'),
  getRecentActivity: () => api.get('/admin/dashboard/recent-activity'),
  clearDashboardCache: () => api.post('/admin/dashboard/clear-cache'),
  
  // Students
  getStudents: (params) => api.get('/admin/students', { params }),
  getStudentFilters: () => api.get('/admin/students/filters'),
  getStudentStatistics: () => api.get('/admin/students/statistics'),
  getStudent: (id) => api.get(`/admin/students/${id}`),
  createStudent: (data) => api.post('/admin/students', data),
  updateStudent: (id, data) => api.put(`/admin/students/${id}`, data),
  deleteStudent: (id) => api.delete(`/admin/students/${id}`),
  forceDeleteStudent: (id) => api.delete(`/admin/students/${id}/force`),
  restoreStudent: (id) => api.post(`/admin/students/${id}/restore`),
  bulkDeleteStudents: (data) => api.post('/admin/students/bulk-delete', data),
  bulkUpdateStudentStatus: (data) => api.post('/admin/students/bulk-update-status', data),
  bulkUpdateStudentAccountType: (data) => api.post('/admin/students/bulk-update-account-type', data),
  importStudents: (csvFile) => {
    const formData = new FormData();
    formData.append('csv_file', csvFile);
    return api.post('/admin/students/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  exportStudents: (params) => api.get('/admin/students/export', { 
    params,
    responseType: 'blob'
  }),
  
  // Media Management
  getMedia: (params) => api.get('/admin/media', { params }),
  uploadMedia: (files, data = {}) => {
    const formData = new FormData();
    
    // Add files
    files.forEach(file => {
      formData.append('files[]', file);
    });
    
    // Add other data
    Object.keys(data).forEach(key => {
      if (Array.isArray(data[key])) {
        data[key].forEach(value => {
          formData.append(`${key}[]`, value);
        });
      } else {
        formData.append(key, data[key]);
      }
    });
    
    return api.post('/admin/media/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  uploadMediaFromUrl: (data) => api.post('/admin/media/upload-from-url', data),
  getMediaStatistics: () => api.get('/admin/media/statistics'),
  getMediaUsage: (params) => api.get('/admin/media/usage', { params }),
  getMediaItem: (id) => api.get(`/admin/media/${id}`),
  updateMedia: (id, data) => api.put(`/admin/media/${id}`, data),
  deleteMedia: (id) => api.delete(`/admin/media/${id}`),
  downloadMedia: (id) => api.get(`/admin/media/${id}/download`, { responseType: 'blob' }),
  generateThumbnail: (id, data) => api.post(`/admin/media/${id}/generate-thumbnail`, data),
  optimizeMedia: (id, data) => api.post(`/admin/media/${id}/optimize`, data),
  moveMediaStorage: (id, data) => api.post(`/admin/media/${id}/move-storage`, data),
  bulkDeleteMedia: (data) => api.post('/admin/media/bulk-delete', data),
  
  // Media Categories
  getMediaCategories: () => api.get('/admin/media/categories'),
  createMediaCategory: (data) => api.post('/admin/media/categories', data),
  updateMediaCategory: (id, data) => api.put(`/admin/media/categories/${id}`, data),
  deleteMediaCategory: (id) => api.delete(`/admin/media/categories/${id}`),
  reorderMediaCategories: (data) => api.post('/admin/media/categories/reorder', data),
  
  // Media Albums
  getMediaAlbums: (params) => api.get('/admin/media/albums', { params }),
  createMediaAlbum: (data) => api.post('/admin/media/albums', data),
  getMediaAlbum: (id) => api.get(`/admin/media/albums/${id}`),
  updateMediaAlbum: (id, data) => api.put(`/admin/media/albums/${id}`, data),
  deleteMediaAlbum: (id) => api.delete(`/admin/media/albums/${id}`),
  addMediaToAlbum: (id, data) => api.post(`/admin/media/albums/${id}/add-media`, data),
  removeMediaFromAlbum: (id, data) => api.post(`/admin/media/albums/${id}/remove-media`, data),
  reorderMediaInAlbum: (id, data) => api.post(`/admin/media/albums/${id}/reorder-media`, data),
  
  // Questions Management
  getQuestions: (params) => api.get('/admin/questions', { params }),
  getQuestionFilters: () => api.get('/admin/questions/filters'),
  getQuestionStatistics: () => api.get('/admin/questions/statistics'),
  getQuestion: (id) => api.get(`/admin/questions/${id}`),
  createQuestion: (data) => api.post('/admin/questions', data),
  updateQuestion: (id, data) => api.put(`/admin/questions/${id}`, data),
  deleteQuestion: (id) => api.delete(`/admin/questions/${id}`),
  duplicateQuestion: (id) => api.post(`/admin/questions/${id}/duplicate`),
  toggleQuestionStatus: (id) => api.post(`/admin/questions/${id}/toggle-status`),
  bulkDeleteQuestions: (data) => api.post('/admin/questions/bulk-delete', data),
  bulkUpdateQuestionStatus: (data) => api.post('/admin/questions/bulk-update-status', data),
  importQuestions: (data) => api.post('/admin/questions/import', data),
  exportQuestions: (params) => api.get('/admin/questions/export', { 
    params,
    responseType: 'blob'
  }),
  downloadQuestionTemplate: () => api.get('/admin/questions/download-template', { responseType: 'blob' }),
  
  // Question Categories
  getQuestionCategories: () => api.get('/admin/questions/categories'),
  createQuestionCategory: (data) => api.post('/admin/questions/categories', data),
  updateQuestionCategory: (id, data) => api.put(`/admin/questions/categories/${id}`, data),
  deleteQuestionCategory: (id) => api.delete(`/admin/questions/categories/${id}`),
  
  // Age Groups
  getAgeGroups: () => api.get('/admin/questions/age-groups'),
  createAgeGroup: (data) => api.post('/admin/questions/age-groups', data),
  updateAgeGroup: (id, data) => api.put(`/admin/questions/age-groups/${id}`, data),
  deleteAgeGroup: (id) => api.delete(`/admin/questions/age-groups/${id}`),
};

// Student API methods (if needed for frontend student portal)
export const studentApi = {
  login: (data) => api.post('/student/login', data),
  logout: () => api.post('/student/logout'),
  getProfile: () => api.get('/student/me'),
  updateProfile: (data) => api.put('/student/profile', data),
  changePassword: (data) => api.post('/student/change-password', data),
  // Add other student endpoints as needed
};

// General API methods
export const generalApi = {
  // Add any general endpoints here
};

// Helper functions for token management
export const authHelper = {
  setAdminToken: (token) => {
    localStorage.setItem('admin_token', token);
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  },
  
  setStudentToken: (token) => {
    localStorage.setItem('student_token', token);
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  },
  
  getAdminToken: () => localStorage.getItem('admin_token'),
  
  getStudentToken: () => localStorage.getItem('student_token'),
  
  clearTokens: () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('student_token');
    localStorage.removeItem('admin_data');
    localStorage.removeItem('student_data');
    delete api.defaults.headers.common['Authorization'];
  },
  
  isAdminAuthenticated: () => {
    const token = localStorage.getItem('admin_token');
    return !!token;
  },
  
  isStudentAuthenticated: () => {
    const token = localStorage.getItem('student_token');
    return !!token;
  },
  
  setAdminData: (data) => {
    localStorage.setItem('admin_data', JSON.stringify(data));
  },
  
  getAdminData: () => {
    const data = localStorage.getItem('admin_data');
    return data ? JSON.parse(data) : null;
  },
  
  setStudentData: (data) => {
    localStorage.setItem('student_data', JSON.stringify(data));
  },
  
  getStudentData: () => {
    const data = localStorage.getItem('student_data');
    return data ? JSON.parse(data) : null;
  },
};

// Export the raw axios instance if needed
export { api };

export default api;