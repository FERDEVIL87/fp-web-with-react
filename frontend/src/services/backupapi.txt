import axios from 'axios';

// 1. Ambil URL base API dari environment variables
//    Ini akan menggunakan nilai dari file .env.local saat development
const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const apiClient = axios.create({
    baseURL: baseURL,
    headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
    }
});

// 2. INTERCEPTOR: Kode ini akan berjalan SEBELUM setiap request dikirim.
//    Ini adalah bagian paling penting untuk autentikasi.
apiClient.interceptors.request.use(
    (config) => {
        // Ambil token dari localStorage (tempat kita akan menyimpannya setelah login)
        const token = localStorage.getItem('authToken');

        // Jika token ada, tambahkan ke header Authorization
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }

        return config;
    },
    (error) => {
        // Lakukan sesuatu jika ada error saat konfigurasi request
        return Promise.reject(error);
    }
);

export default apiClient;