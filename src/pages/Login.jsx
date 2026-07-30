// src/pages/Login.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Shield, User, Lock, AlertCircle, Loader2 } from "lucide-react";
import { toast } from "react-toastify";
import api from "../services/api";
import { useAppTheme } from "../hooks/useTheme";

export default function Login() {
  const { isDarkMode, themeClasses } = useAppTheme();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Kirim sebagai JSON (sesuai dengan backend)
      const response = await api.post("/auth/login", {
        username: username,
        password: password
      });

      const { token, role, full_name } = response.data;

      // Simpan ke localStorage
      localStorage.setItem("token", token);
      localStorage.setItem("username", username);
      localStorage.setItem("role", role);
      localStorage.setItem("full_name", full_name);

      // Set default axios header
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      toast.success(`Selamat datang, ${full_name}!`);

      // Redirect berdasarkan role (opsional)
      navigate("/dashboard");
    } catch (error) {
      console.error("Login error:", error);
      
      let errorMessage = "Login gagal. Silakan coba lagi.";
      
      // Handle error dari backend
      if (error.response?.data?.detail) {
        if (typeof error.response.data.detail === "string") {
          errorMessage = error.response.data.detail;
        } else if (Array.isArray(error.response.data.detail)) {
          errorMessage = error.response.data.detail[0]?.msg || errorMessage;
        }
      } else if (error.response?.status === 401) {
        errorMessage = "Username atau password salah";
      } else if (error.response?.status === 422) {
        errorMessage = "Format request tidak valid. Silakan coba lagi.";
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center ${themeClasses.bg}`}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`w-full max-w-md p-8 rounded-2xl shadow-xl border ${
          isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"
        }`}
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600">
              <Shield className="w-10 h-10 text-white" />
            </div>
          </div>
          <h1 className={`text-2xl font-bold ${themeClasses.text}`}>
            Malware<span className="text-blue-600">Detect</span>
          </h1>
          <p className={`text-sm mt-1 ${themeClasses.textMuted}`}>
            Dashboard Klasifikasi Malware
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className={`mb-4 p-3 rounded-lg flex items-start gap-2 ${
            isDarkMode ? "bg-red-900/30 border border-red-800" : "bg-red-50 border border-red-200"
          }`}>
            <AlertCircle className={`w-5 h-5 flex-shrink-0 mt-0.5 ${isDarkMode ? "text-red-400" : "text-red-500"}`} />
            <span className={`text-sm ${isDarkMode ? "text-red-300" : "text-red-600"}`}>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={`block text-sm font-medium mb-1 ${themeClasses.text}`}>
              Username
            </label>
            <div className={`relative ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Masukkan username"
                className={`w-full pl-10 pr-4 py-2.5 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  isDarkMode
                    ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                    : "bg-white border-gray-300 text-gray-900 placeholder-gray-400"
                }`}
                required
                autoComplete="username"
              />
            </div>
          </div>

          <div>
            <label className={`block text-sm font-medium mb-1 ${themeClasses.text}`}>
              Password
            </label>
            <div className={`relative ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Masukkan password"
                className={`w-full pl-10 pr-4 py-2.5 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  isDarkMode
                    ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                    : "bg-white border-gray-300 text-gray-900 placeholder-gray-400"
                }`}
                required
                autoComplete="current-password"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2.5 rounded-lg font-medium transition-all ${
              loading
                ? "bg-gray-400 cursor-not-allowed text-white"
                : "bg-blue-600 hover:bg-blue-700 text-white"
            }`}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                Memproses...
              </span>
            ) : (
              "Login"
            )}
          </button>
        </form>

        
      </motion.div>
    </div>
  );
}