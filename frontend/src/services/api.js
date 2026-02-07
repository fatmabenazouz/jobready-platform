// services/api.js - API Service for Backend Communication
import axios from 'axios';

// Get API URL from environment variable or use default
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5002/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Server responded with error
      console.error('API Error:', error.response.data);
      
      // Handle specific error codes
      if (error.response.status === 401) {
        // Unauthorized - clear token and redirect to login
        localStorage.removeItem('token');
        window.location.href = '/';
      }
    } else if (error.request) {
      // Request made but no response
      console.error('Network Error:', error.request);
    } else {
      // Something else happened
      console.error('Error:', error.message);
    }
    return Promise.reject(error);
  }
);

// ============================================
// AUTHENTICATION APIs
// ============================================
export const authAPI = {
  // Register new user
  register: (data) => api.post('/auth/register', data),
  
  // Login user
  login: (data) => api.post('/auth/login', data),
  
  // Verify token
  verify: () => api.get('/auth/verify'),
};

// ============================================
// JOBS APIs
// ============================================
export const jobsAPI = {
  // Get all jobs with optional filters
  getAll: (params = {}) => api.get('/jobs', { params }),
  
  // Get single job by ID
  getById: (id) => api.get(`/jobs/${id}`),
  
  // Apply for a job
  apply: (id, data) => api.post(`/jobs/${id}/apply`, data),
  
  // Save/unsave a job
  save: (id) => api.post(`/jobs/${id}/save`),
  
  // Get user's applications
  getMyApplications: (params = {}) => api.get('/jobs/applications/my', { params }),
  
  // Get user's saved jobs
  getMySavedJobs: () => api.get('/jobs/saved/my'),
};

// ============================================
// CV APIs
// ============================================
export const cvAPI = {
  // Get all user's CVs
  getAll: () => api.get('/cv'),
  
  // Get single CV by ID
  getById: (id) => api.get(`/cv/${id}`),
  
  // Create new CV
  create: (data) => api.post('/cv', data),
  
  // Update CV
  update: (id, data) => api.put(`/cv/${id}`, data),
  
  // Delete CV
  delete: (id) => api.delete(`/cv/${id}`),
  
  // Add education entry
  addEducation: (cvId, data) => api.post(`/cv/${cvId}/education`, data),
  
  // Add experience entry
  addExperience: (cvId, data) => api.post(`/cv/${cvId}/experience`, data),
  
  // Update skills
  updateSkills: (cvId, data) => api.post(`/cv/${cvId}/skills`, data),
  
  // Download CV as PDF
  download: (id, language = 'en') => 
    api.get(`/cv/${id}/download`, { 
      params: { language },
      responseType: 'blob' 
    }),
};

// ============================================
// TRAINING APIs
// ============================================
export const trainingAPI = {
  // Get all courses
  getCourses: (params = {}) => api.get('/training/courses', { params }),
  
  // Get single course
  getCourse: (id) => api.get(`/training/courses/${id}`),
  
  // Enroll in course
  enroll: (id) => api.post(`/training/courses/${id}/enroll`),
  
  // Update progress
  updateProgress: (id, data) => api.put(`/training/courses/${id}/progress`, data),
  
  // Get user's enrolled courses
  getMyCourses: () => api.get('/training/my-courses'),
  
  // Get course categories
  getCategories: () => api.get('/training/categories'),
};

// ============================================
// TRANSLATION APIs
// ============================================
export const translationAPI = {
  // Translate single text
  translate: (data) => api.post('/translation/translate', data),
  
  // Batch translate
  translateBatch: (data) => api.post('/translation/translate-batch', data),
  
  // Detect language
  detect: (data) => api.post('/translation/detect', data),
  
  // Get supported languages
  getLanguages: () => api.get('/translation/languages'),
  
  // Translate job posting
  translateJob: (data) => api.post('/translation/translate-job', data),
};

// ============================================
// USER APIs
// ============================================
export const userAPI = {
  // Get user profile
  getProfile: () => api.get('/users/me'),
  
  // Update profile
  updateProfile: (data) => api.put('/users/me', data),
  
  // Get user statistics
  getStats: () => api.get('/users/me/stats'),
};

// ============================================
// HELPER FUNCTIONS
// ============================================

// Save token to localStorage
export const setAuthToken = (token) => {
  localStorage.setItem('token', token);
};

// Remove token from localStorage
export const removeAuthToken = () => {
  localStorage.removeItem('token');
};

// Get token from localStorage
export const getAuthToken = () => {
  return localStorage.getItem('token');
};

// Check if user is authenticated
export const isAuthenticated = () => {
  return !!localStorage.getItem('token');
};

// Export the axios instance for custom requests
export default api;