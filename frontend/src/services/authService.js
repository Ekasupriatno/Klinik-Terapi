import api from './api';

export const authService = {
  /**
   * Registrasi dokter spesialis / terapis baru.
   * Menerima object biasa atau FormData (jika mengunggah foto profil).
   * Status dokter setelah pendaftaran: pending (menunggu persetujuan admin).
   */
  registerDoctor: async (data) => {
    let payload = data;

    if (!(data instanceof FormData)) {
      payload = new FormData();
      Object.keys(data).forEach((key) => {
        if (data[key] !== null && data[key] !== undefined) {
          payload.append(key, data[key]);
        }
      });
    }

    const response = await api.post('/auth/register/doctor', payload, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  },

  /**
   * Registrasi pasien umum / orang tua.
   */
  register: async (data) => {
    const response = await api.post('/auth/register', data);
    return response.data;
  },

  /**
   * Login umum (pasien, dokter, admin).
   */
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  /**
   * Ambil data profil user saat ini.
   */
  me: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  /**
   * Logout user.
   */
  logout: async () => {
    const response = await api.post('/auth/logout');
    return response.data;
  },

  /**
   * Kirim link reset password ke email.
   */
  forgotPassword: async (data) => {
    const response = await api.post('/auth/forgot-password', data);
    return response.data;
  },

  /**
   * Reset password dengan token.
   */
  resetPassword: async (data) => {
    const response = await api.post('/auth/reset-password', data);
    return response.data;
  },
};

export default authService;
