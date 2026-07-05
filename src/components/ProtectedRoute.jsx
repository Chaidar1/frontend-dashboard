// src/components/ProtectedRoute.jsx
import { Navigate, Outlet } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../services/api";

export default function ProtectedRoute({ requiredRole, children }) {
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  console.log("🔒 ProtectedRoute - token:", token ? "ADA" : "TIDAK ADA");
  console.log("🔒 ProtectedRoute - role:", role);
  console.log("🔒 ProtectedRoute - requiredRole:", requiredRole || "TIDAK ADA");
  console.log("🔒 ProtectedRoute - has children:", !!children);

  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        console.log("❌ No token found in localStorage");
        setAuthorized(false);
        setLoading(false);
        return;
      }

      try {
        console.log("🔍 Verifying token with /auth/me...");
        const response = await api.get("/auth/me");
        console.log("✅ Token verified successfully:", response.data);
        setAuthorized(true);
      } catch (error) {
        console.error("❌ Token verification failed:", error);
        if (error.response) {
          console.error("   Status:", error.response.status);
          console.error("   Data:", error.response.data);
        }
        setAuthorized(false);
        localStorage.removeItem("token");
        localStorage.removeItem("username");
        localStorage.removeItem("role");
        localStorage.removeItem("full_name");
        console.log("🧹 Cleaned up localStorage after failed verification");
      } finally {
        setLoading(false);
      }
    };

    verifyToken();
  }, [token]);

  if (loading) {
    console.log("⏳ Loading...");
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!authorized || !token) {
    console.log("❌ Not authorized or no token, redirecting to login");
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && role !== requiredRole) {
    console.log(`❌ Role mismatch: need "${requiredRole}", have "${role}"`);
    return <Navigate to="/dashboard" replace />;
  }

  console.log("✅ Authorized, rendering children or Outlet");
  
  // 🔥 Jika ada children, render children, otherwise render Outlet
  return children ? children : <Outlet />;
}