// src/App.jsx
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Layout from "./components/Layout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard"; // Petugas
import DashboardAdmin from "./pages/DashboardAdmin"; // Admin
import Upload from "./pages/Upload";
import Results from "./pages/Results";
import History from "./pages/History";
import HistoryAdmin from "./pages/HistoryAdmin";
import ManageUsers from "./pages/ManageUsers";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  console.log("🔥 App - token:", token ? "ADA" : "TIDAK ADA");
  console.log("🔥 App - role:", role);

  useEffect(() => {
    const isLoginPage = window.location.pathname === "/login";
    if (!token && !isLoginPage) {
      navigate("/login");
    }
  }, [token, navigate]);

  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} />
      <Routes>
        <Route path="/login" element={<Login />} />
        
        {/* 🔥 ProtectedRoute hanya di sini (sekali) */}
        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route path="/" element={<Navigate to="/dashboard" />} />
            
            {/* 🔥 Dashboard berdasarkan Role */}
            <Route 
              path="/dashboard" 
              element={role === "Admin" ? <DashboardAdmin /> : <Dashboard />} 
            />
            
            <Route path="/upload" element={<Upload />} />
            <Route path="/results/:id" element={<Results />} />
            
            {/* 🔥 Routing Riwayat berdasarkan Role */}
            <Route 
              path="/history" 
              element={role === "Admin" ? <HistoryAdmin /> : <History />} 
            />
            
            {/* 🔥 ManageUsers - TANPA ProtectedRoute duplikasi */}
            <Route path="/manage-users" element={<ManageUsers />} />
          </Route>
        </Route>
      </Routes>
    </>
  );
}

export default App;