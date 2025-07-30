import axios from 'axios';

// Tentukan baseURL secara dinamis berdasarkan lingkungan (production atau development)
const baseURL = import.meta.env.PROD
  ? '/api' // Gunakan relative path untuk production (Vercel)
  : 'http://localhost:3001/api'; // Gunakan absolute path untuk development (lokal)

// Buat instance apiClient dengan baseURL yang sudah dinamis
const apiClient = axios.create({
    baseURL: baseURL,
    headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
    }
});

// Interceptor untuk menambahkan token JWT secara otomatis ke setiap request
apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('authToken');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default apiClient;