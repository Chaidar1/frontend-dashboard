// src/services/api.js
import axios from "axios";

// Deteksi environment dengan fallback URL
const isDevelopment = import.meta.env.DEV;
const isProduction = import.meta.env.PROD;

// URL API dengan fallback yang jelas
let API_URL;

if (isDevelopment) {
  // Development: Gunakan proxy Vite
  API_URL = '/api';
  console.log('🚀 Development mode - Using proxy: /api');
} else if (isProduction) {
  // Production: Gunakan environment variable atau fallback
  API_URL = import.meta.env.VITE_API_URL || 'https://backend-testing-malware-classification.ryaze.my.id';
  console.log(`🚀 Production mode - API URL: ${API_URL}`);
} else {
  // Fallback
  API_URL = '/api';
  console.log('⚠️ Unknown environment - Using fallback: /api');
}

// Debug: Tampilkan URL yang digunakan
console.log(`🔗 API Base URL: ${API_URL}`);

const api = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
  // Hapus withCredentials jika tidak pakai cookie
  // withCredentials: true,  // ← HAPUS atau comment
});

// Interceptor untuk menambahkan token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Logging lengkap untuk debug
    console.log(`🔍 API Request: ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
    console.log(`   Headers:`, config.headers);
    
    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// Interceptor untuk response
api.interceptors.response.use(
  (response) => {
    console.log(`✅ API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    // Logging lengkap untuk error
    console.error(`❌ API Error:`, error.message);
    console.error(`   Status:`, error.response?.status);
    console.error(`   Data:`, error.response?.data);
    console.error(`   Config:`, error.config);
    
    // Handle 401
    if (error.response?.status === 401) {
      console.warn('🔒 Token expired or invalid - Logging out...');
      localStorage.removeItem("token");
      localStorage.removeItem("username");
      localStorage.removeItem("role");
      localStorage.removeItem("full_name");
      
      // Redirect hanya jika tidak sedang di halaman login
      if (!window.location.pathname.includes("/login")) {
        window.location.href = "/login";
      }
    }
    
    // Handle 405 (Method Not Allowed)
    if (error.response?.status === 405) {
      console.error('❌ Method not allowed - Check if endpoint exists');
      console.error(`   URL: ${error.config?.baseURL}${error.config?.url}`);
      console.error(`   Method: ${error.config?.method}`);
    }
    
    return Promise.reject(error);
  }
);

export default api;