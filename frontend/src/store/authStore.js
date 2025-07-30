import { defineStore } from 'pinia';
import apiClient from '@/services/api';

export const useAuthStore = defineStore('auth', {
  // --- STATE ---
  // State Anda sudah benar, hanya ganti nama 'token' menjadi 'authToken' agar konsisten
  state: () => ({
    authUser: JSON.parse(localStorage.getItem('user')) || null,
    authToken: localStorage.getItem('authToken') || null,
  }),

  // --- GETTERS ---
  // Getters Anda sudah benar, hanya sesuaikan dengan nama state baru
  getters: {
    user: (state) => state.authUser,
    isAuthenticated: (state) => !!state.authToken,
    isAdmin: (state) => state.authUser?.role === 'admin',
  },

  // --- ACTIONS ---
  actions: {
    // --- LOGIN ---
    async handleLogin(credentials) {
      try {
        // Panggil endpoint yang BENAR: /auth/login
        const response = await apiClient.post('/auth/login', credentials);
        
        // Respons dari Express tidak memiliki properti .user, data user ada di root
        const user = response.data;
        const token = response.data.token;

        // Simpan data ke state dan localStorage
        this.authUser = user;
        this.authToken = token;
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('authToken', token);
        
        // apiClient interceptor sudah menangani header, baris ini tidak diperlukan lagi
        // apiClient.defaults.headers.common['Authorization'] = `Bearer ${this.token}`;
      } catch (error) {
        // Jika gagal, pastikan state dibersihkan dan lempar error
        this.logout(); // Panggil aksi logout untuk membersihkan
        throw error;
      }
    },

    // --- REGISTER ---
    async handleRegister(form) {
      // Panggil endpoint yang BENAR: /auth/register
      // Payload-nya juga harus disesuaikan
      const payload = {
        username: form.username,
        email: form.email,
        password: form.password,
      };
      // Tidak perlu menyimpan token saat registrasi, karena user harus login setelahnya
      await apiClient.post('/auth/register', payload);
    },

    // --- LOGOUT ---
    logout() {
      // Panggil API logout (jika Anda membuatnya di backend, endpointnya /api/auth/logout)
      // Ini opsional, karena token JWT tidak bisa benar-benar "dihanguskan" dari sisi server
      // tanpa blacklist. Menghapus dari frontend sudah cukup aman.
      // if (this.authToken) {
      //   apiClient.post('/auth/logout');
      // }

      // Hapus data dari state dan localStorage
      this.authUser = null;
      this.authToken = null;
      localStorage.removeItem('user');
      localStorage.removeItem('authToken');
      
      // Interceptor di api.js akan otomatis berhenti mengirim header Authorization
      // karena localStorage 'authToken' sudah kosong.
    },
  },
});