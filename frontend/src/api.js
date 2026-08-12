import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
  timeout: 20000,
});

export function setAuthToken(token) {
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
    localStorage.setItem('esi_token', token);
  } else {
    delete api.defaults.headers.common.Authorization;
    localStorage.removeItem('esi_token');
  }
}

const savedToken = localStorage.getItem('esi_token');
if (savedToken) {
  setAuthToken(savedToken);
}

export const registerUser = (payload) => api.post('/auth/register', payload);
export const loginUser = (payload) => api.post('/auth/login', payload);
export const getCurrentUser = () => api.get('/users/me');
export const getCourses = (params = {}) => api.get('/courses', { params });
export const uploadNote = (formData) => api.post('/notes/upload', formData, {
  headers: { 'Content-Type': 'multipart/form-data' },
});
export const uploadPaper = (formData) => api.post('/papers/upload', formData, {
  headers: { 'Content-Type': 'multipart/form-data' },
});
export const getNotes = (courseId) => api.get('/notes', { params: { course_id: courseId } });
export const getPapers = (courseId) => api.get('/papers', { params: { course_id: courseId } });
export const startExam = (courseId) => api.post('/exam/start', null, { params: { course_id: courseId } });
export const submitExam = (payload) => api.post('/exam/submit', payload);
export const askTutor = (question) => api.post('/tutor/ask', { question });

export default api;
