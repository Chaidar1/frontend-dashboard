// src/services/api.js
import axios from "axios";

// 🔥 Gunakan proxy untuk development, langsung untuk production (membaca dari env)
const API_URL = import.meta.env.DEV 
  ? '/api' 
  : (import.meta.env.VITE_API_URL || 'https://backend-testing-malware-classification.ryaze.my.id');

const api = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// Interceptor untuk menambahkan token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log(`🔍 API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor untuk handle 401
api.interceptors.response.use(
  (response) => {
    console.log(`✅ API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error(`❌ API Error:`, error.message);
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("username");
      localStorage.removeItem("role");
      localStorage.removeItem("full_name");
      // Redirect hanya jika tidak sedang di halaman login
      if (!window.location.pathname.includes("/login")) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;