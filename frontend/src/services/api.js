/* ============================================================
   frontend/src/services/api.js — API Service Layer
   JobReady SA
   ============================================================ */
   import axios from 'axios';

   const API_URL = process.env.REACT_APP_API_URL || 'https://jobready-platform-production.up.railway.app/api';
   
   const api = axios.create({
     baseURL: API_URL,
     headers: { 'Content-Type': 'application/json' },
     timeout: 15000,
   });
   
   // Attach JWT to every request
   api.interceptors.request.use((config) => {
     const token = localStorage.getItem('token');
     if (token) config.headers.Authorization = `Bearer ${token}`;
     return config;
   });
   
   // Handle 401 globally
   api.interceptors.response.use(
     (response) => response,
     (error) => {
       if (error.response?.status === 401) {
         localStorage.removeItem('token');
         localStorage.removeItem('jobready_user');
         window.location.href = '/';
       }
       return Promise.reject(error);
     }
   );
   
   export const authAPI = {
     register: (data) => api.post('/auth/register', data),
     login:    (data) => api.post('/auth/login', data),
     verify:   ()     => api.get('/auth/verify'),
   };
   
   export const jobsAPI = {
     getAll:            (params = {}) => api.get('/jobs', { params }),
     getById:           (id)          => api.get(`/jobs/${id}`),
     apply:             (id, data)    => api.post(`/jobs/${id}/apply`, data),
     save:              (id)          => api.post(`/jobs/${id}/save`),
     getMyApplications: (params = {}) => api.get('/jobs/applications/my', { params }),
     getMySavedJobs:    ()            => api.get('/jobs/saved/my'),
   };
   
   export const cvAPI = {
     getAll:  ()         => api.get('/cv'),
     getById: (id)       => api.get(`/cv/${id}`),
     create:  (data)     => api.post('/cv', data),
     update:  (id, data) => api.put(`/cv/${id}`, data),
     delete:  (id)       => api.delete(`/cv/${id}`),
   };
   
   export const trainingAPI = {
     getCourses:     (params = {}) => api.get('/training/courses', { params }),
     enroll:         (id)          => api.post(`/training/courses/${id}/enroll`),
     updateProgress: (id, data)    => api.put(`/training/courses/${id}/progress`, data),
     getMyCourses:   ()            => api.get('/training/my-courses'),
   };
   
   export const translationAPI = {
     translate:      (data) => api.post('/translation/translate', data),
     translateBatch: (data) => api.post('/translation/translate-batch', data),
     translateJob:   (data) => api.post('/translation/translate-job', data),
     getLanguages:   ()     => api.get('/translation/languages'),
   };
   
   export const userAPI = {
     getProfile:    ()     => api.get('/users/me'),
     updateProfile: (data) => api.put('/users/me', data),
     getStats:      ()     => api.get('/users/me/stats'),
   };
   
   export default api;