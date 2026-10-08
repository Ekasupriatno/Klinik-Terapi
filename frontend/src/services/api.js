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
    if (config.data instanceof FormData) {
      config.headers.delete('Content-Type');
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
  registerDoctor: (data) => {
    let payload = data;
    if (!(data instanceof FormData)) {
      payload = new FormData();
      Object.keys(data).forEach((key) => {
        if (data[key] !== null && data[key] !== undefined) {
          payload.append(key, data[key]);
        }
      });
    }
    return api.post('/auth/register/doctor', payload, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  login: (data) => api.post('/auth/login', data),
  me: () => api.get('/auth/me'),
  logout: () => api.post('/auth/logout'),
  forgotPassword: (data) => api.post('/auth/forgot-password', data),
  resetPassword: (data) => api.post('/auth/reset-password', data),
};

export const doctorService = {
  getAll: (params) => api.get('/doctors', { params }),
  getAllForAdmin: (params) => api.get('/admin/doctors', { params }),
  getPendingDoctors: (params) => api.get('/admin/doctors/pending', { params }),
  approveDoctor: (id) => api.put(`/admin/doctors/${id}/approve`),
  rejectDoctor: (id, reason) => api.put(`/admin/doctors/${id}/reject`, { reason }),
  suspendDoctor: (id, reason) => api.put(`/admin/doctors/${id}/suspend`, { reason }),
  getTherapistAccounts: () => api.get('/admin/therapist-accounts'),
  getById: (id) => api.get(`/doctors/${id}`),
  getAvailableSlots: (id, date) => api.get(`/doctors/${id}/available-slots`, { params: { date } }),
  create: (data) => api.post('/admin/doctors', data),
  update: (id, data) => {
    if (data instanceof FormData) {
      data.set('_method', 'PUT');
      return api.post(`/admin/doctors/${id}`, data);
    }
    return api.put(`/admin/doctors/${id}`, data);
  },
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
  adminCreate: (data) => api.post('/admin/bookings', data),
  adminUpdate: (id, data) => api.put(`/admin/bookings/${id}`, data),
  cancel: (id, reason) => api.put(`/bookings/${id}/cancel`, { reason }),
  updateStatus: (id, status, notes) => api.put(`/admin/bookings/${id}/status`, { status, doctor_notes: notes }),
  delete: (id) => api.delete(`/admin/bookings/${id}`),
  getPatients: () => api.get('/admin/patients'),
};

export const parentService = {
  getProfile: () => api.get('/guardian/me'),
  updateProfile: (data) => api.put('/guardian/me', data),
  getChildren: (params) => api.get('/children', { params }),
  getChild: (id) => api.get(`/children/${id}`),
  createChild: (data) => api.post('/children', data),
  updateChild: (id, data) => api.put(`/children/${id}`, data),
  getInvoices: (params) => api.get('/invoices', { params }),
  getInvoice: (id) => api.get(`/invoices/${id}`),
};

export const therapistService = {
  getDashboard: () => api.get('/therapist/dashboard'),
  getPatients: (params) => api.get('/therapist/patients', { params }),
  getSessionNotes: (params) => api.get('/therapist/session-notes', { params }),
  createSessionNote: (data) => api.post('/therapist/session-notes', data),
  updateSessionNote: (id, data) => api.put(`/therapist/session-notes/${id}`, data),
  getCalendar: (params) => api.get('/therapist/calendar', { params }),
};

export const serviceService = {
  getAll: (params) => api.get('/services', { params }),
  getById: (id) => api.get(`/services/${id}`),
  create: (data) => api.post('/admin/services', data),
  update: (id, data) => api.put(`/admin/services/${id}`, data),
  delete: (id) => api.delete(`/admin/services/${id}`),
};

export const articleService = {
  getAll: (params) => api.get('/articles', { params }),
  getById: (id) => api.get(`/articles/${id}`),
  create: (data) => api.post('/admin/articles', data),
  update: (id, data) => api.put(`/admin/articles/${id}`, data),
  delete: (id) => api.delete(`/admin/articles/${id}`),
};

export const reviewService = {
  create: (data) => api.post('/reviews', data),
};

export const notificationService = {
  getAll: () => api.get('/notifications'),
  markAsRead: (id) => api.put(`/notifications/${id}/read`),
};

export const adminService = {
  getStats: () => api.get('/admin/stats'),
  createAdminAccount: (data) => api.post('/admin/accounts/admin', data),
  changePassword: (data) => api.put('/admin/account/password', data),
  // Guardians
  getGuardians: (params) => api.get('/admin/guardians', { params }),
  getGuardian: (id) => api.get(`/admin/guardians/${id}`),
  createGuardian: (data) => api.post('/admin/guardians', data),
  updateGuardian: (id, data) => api.put(`/admin/guardians/${id}`, data),
  deleteGuardian: (id) => api.delete(`/admin/guardians/${id}`),
  // Children
  getChildren: (params) => api.get('/admin/children', { params }),
  getChild: (id) => api.get(`/admin/children/${id}`),
  createChild: (data) => api.post('/admin/children', data),
  updateChild: (id, data) => api.put(`/admin/children/${id}`, data),
  deleteChild: (id) => api.delete(`/admin/children/${id}`),
  // Services
  getServices: (params) => api.get('/admin/services', { params }),
  createService: (data) => api.post('/admin/services', data),
  updateService: (id, data) => api.put(`/admin/services/${id}`, data),
  deleteService: (id) => api.delete(`/admin/services/${id}`),
  // Session Notes
  getSessionNotes: (params) => api.get('/admin/session-notes', { params }),
  getSessionNote: (id) => api.get(`/admin/session-notes/${id}`),
  createSessionNote: (data) => api.post('/admin/session-notes', data),
  updateSessionNote: (id, data) => api.put(`/admin/session-notes/${id}`, data),
  deleteSessionNote: (id) => api.delete(`/admin/session-notes/${id}`),
  // Invoices
  getInvoices: (params) => api.get('/admin/invoices', { params }),
  getInvoice: (id) => api.get(`/admin/invoices/${id}`),
  createInvoice: (data) => api.post('/admin/invoices', data),
  updateInvoice: (id, data) => api.put(`/admin/invoices/${id}`, data),
  deleteInvoice: (id) => api.delete(`/admin/invoices/${id}`),
  // Payments
  getPayments: (params) => api.get('/admin/payments', { params }),
  getPayment: (id) => api.get(`/admin/payments/${id}`),
  createPayment: (data) => api.post('/admin/payments', data),
  updatePayment: (id, data) => api.put(`/admin/payments/${id}`, data),
  deletePayment: (id) => api.delete(`/admin/payments/${id}`),
  // Articles
  getArticles: (params) => api.get('/admin/articles', { params }),
  createArticle: (data) => api.post('/admin/articles', data),
  updateArticle: (id, data) => api.put(`/admin/articles/${id}`, data),
  deleteArticle: (id) => api.delete(`/admin/articles/${id}`),
  // Audit Logs
  getAuditLogs: (params) => api.get('/admin/audit-logs', { params }),
  deleteAuditLog: (id) => api.delete(`/admin/audit-logs/${id}`),
  // Clinic Settings
  getClinicSettings: () => api.get('/admin/settings'),
  updateClinicSettings: (data) => api.put('/admin/settings', data),
};

export const clinicSettingService = {
  getPublicSettings: () => api.get('/settings'),
  getAdminSettings: () => api.get('/admin/settings'),
  updateSettings: (data) => api.put('/admin/settings', data),
};

export const clinicService = {
  getSpecializations: () => api.get('/specializations'),
};

export default api;
