import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Interceptor untuk menyisipkan Bearer token di setiap request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor penanganan error global (misal token kadaluarsa 401)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
      // Hanya redirect jika bukan di halaman login/register
      if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/register')) {
        window.dispatchEvent(new CustomEvent('auth-expired'));
      }
    }
    return Promise.reject(error);
  }
);

// =====================================
// API SERVICES
// =====================================

export const authService = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  me: () => api.get('/auth/me'),
  logout: () => api.post('/auth/logout'),
};

export const doctorService = {
  getAll: (params) => api.get('/doctors', { params }),
  getById: (id) => api.get(`/doctors/${id}`),
  getAvailableSlots: (id, date) => api.get(`/doctors/${id}/available-slots`, { params: { date } }),
  create: (data) => api.post('/admin/doctors', data),
  update: (id, data) => api.put(`/admin/doctors/${id}`, data),
  delete: (id) => api.delete(`/admin/doctors/${id}`),
};

export const scheduleService = {
  getByDoctor: (doctorId) => api.get(`/schedules/doctor/${doctorId}`),
  create: (data) => api.post('/admin/schedules', data),
  update: (id, data) => api.put(`/admin/schedules/${id}`, data),
  delete: (id) => api.delete(`/admin/schedules/${id}`),
};

export const bookingService = {
  getAll: (params) => api.get('/bookings', { params }),
  getById: (id) => api.get(`/bookings/${id}`),
  create: (data) => api.post('/bookings', data),
  cancel: (id, reason) => api.put(`/bookings/${id}/cancel`, { reason }),
  updateStatus: (id, status, notes) => api.put(`/admin/bookings/${id}/status`, { status, doctor_notes: notes }),
};

export const reviewService = {
  create: (data) => api.post('/reviews', data),
};

export const adminService = {
  getStats: () => api.get('/admin/stats'),
};

export const clinicService = {
  getSpecializations: () => api.get('/specializations'),
};

export default api;
