// src/pages/ManageUsers.jsx
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Users,
  UserPlus,
  Trash2,
  Power,
  Search,
  Mail,
  Shield,
  Loader2,
  X,
  Calendar,
  BadgeCheck,
  UserCircle,
  MoreVertical,
  Eye,
  User,
  AtSign,
  Key,
  Info,
  AlertTriangle,
  CheckCircle
} from "lucide-react";
import { toast } from "react-toastify";
import api from "../services/api";
import { useAppTheme } from "../hooks/useTheme";

export default function ManageUsers() {
  const { isDarkMode, themeClasses } = useAppTheme();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showToggleModal, setShowToggleModal] = useState(false);
  const [showConfirmAddModal, setShowConfirmAddModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [toggleLoading, setToggleLoading] = useState(false);
  const [confirmAddLoading, setConfirmAddLoading] = useState(false);

  const [formData, setFormData] = useState({
    username: "",
    password: "",
    full_name: "",
    email: "",
    role: "Petugas"
  });
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      console.log("🔍 Fetching users...");
      console.log("🔑 Token:", localStorage.getItem("token") ? "ADA" : "TIDAK ADA");
      console.log("👤 Role:", localStorage.getItem("role"));
      
      const response = await api.get("/admin/users");
      console.log("✅ Users fetched successfully:", response.data);
      setUsers(response.data);
    } catch (error) {
      console.error("❌ Error fetching users:", error);
      console.error("❌ Error status:", error.response?.status);
      console.error("❌ Error data:", error.response?.data);
      
      let errorMessage = "Gagal memuat data pengguna";
      if (error.response?.data?.detail) {
        if (typeof error.response.data.detail === "string") {
          errorMessage = error.response.data.detail;
        } else if (Array.isArray(error.response.data.detail)) {
          errorMessage = error.response.data.detail[0]?.msg || errorMessage;
        }
      }
      toast.error(errorMessage);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  // Handle Add - Validasi & Buka Modal Konfirmasi
  const handleAddUserClick = (e) => {
    e.preventDefault();
    
    console.log("🔍 Validasi form tambah user...");
    console.log("📝 Form data:", formData);
    
    // Validasi dasar sebelum menampilkan modal
    if (!formData.username.trim()) {
      toast.warning("Username harus diisi");
      return;
    }
    if (formData.username.length < 3) {
      toast.warning("Username minimal 3 karakter");
      return;
    }
    if (!formData.password || formData.password.length < 6) {
      toast.warning("Password minimal 6 karakter");
      return;
    }
    
    // Cek duplikasi username
    if (users.some(u => u.username.toLowerCase() === formData.username.toLowerCase())) {
      toast.error(`Username "${formData.username}" sudah digunakan`);
      return;
    }
    
    console.log("✅ Validasi lolos, tampilkan modal konfirmasi");
    console.log("🔍 showConfirmAddModal sebelum:", showConfirmAddModal);
    
    // Pastikan modal form tambah user ditutup dulu
    setShowModal(false);
    
    // Kemudian tampilkan modal konfirmasi setelah delay kecil
    setTimeout(() => {
      setShowConfirmAddModal(true);
      console.log("🔍 showConfirmAddModal setelah:", true);
    }, 100);
  };

  // Handle Add - Konfirmasi
  const handleConfirmAddUser = async () => {
    setConfirmAddLoading(true);

    try {
      console.log("📝 Adding user:", formData.username);
      
      const params = new URLSearchParams();
      params.append("username", formData.username);
      params.append("password", formData.password);
      params.append("role", formData.role);
      params.append("full_name", formData.full_name || formData.username);
      params.append("email", formData.email || `${formData.username}@malware.com`);

      const response = await api.post("/admin/users", params, {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      });
      
      console.log("✅ User added successfully:", response.data);
      toast.success(`User ${formData.username} berhasil ditambahkan!`);
      setShowConfirmAddModal(false);
      setShowModal(false);
      resetForm();
      fetchUsers();
    } catch (error) {
      console.error("❌ Error adding user:", error);
      console.error("❌ Error status:", error.response?.status);
      console.error("❌ Error data:", error.response?.data);
      
      let errorMessage = "Gagal menambahkan user";
      if (error.response?.data?.detail) {
        if (typeof error.response.data.detail === "string") {
          errorMessage = error.response.data.detail;
        } else if (Array.isArray(error.response.data.detail)) {
          errorMessage = error.response.data.detail[0]?.msg || errorMessage;
        }
      }
      toast.error(errorMessage);
    } finally {
      setConfirmAddLoading(false);
    }
  };

  // Handle Toggle - Cek status user
  const handleToggleClick = (user) => {
    if (user.is_active) {
      setSelectedUser(user);
      setShowToggleModal(true);
    } else {
      handleToggleUser(user.username);
    }
  };

  // Handle Toggle - Konfirmasi Nonaktifkan
  const handleConfirmToggle = async () => {
    if (!selectedUser) return;
    
    setToggleLoading(true);
    try {
      console.log(`🔄 Toggling user: ${selectedUser.username}`);
      const response = await api.post(`/admin/users/${selectedUser.username}/toggle`);
      console.log(`✅ User ${selectedUser.username} toggled:`, response.data);
      toast.success(`User ${selectedUser.username} berhasil dinonaktifkan`);
      setShowToggleModal(false);
      setSelectedUser(null);
      fetchUsers();
    } catch (error) {
      console.error(`❌ Error toggling user ${selectedUser.username}:`, error);
      console.error("❌ Error status:", error.response?.status);
      console.error("❌ Error data:", error.response?.data);
      toast.error("Gagal mengubah status user");
    } finally {
      setToggleLoading(false);
    }
  };

  // Handle Toggle - Eksekusi langsung (tanpa validasi)
  const handleToggleUser = async (username) => {
    try {
      console.log(`🔄 Toggling user: ${username}`);
      const response = await api.post(`/admin/users/${username}/toggle`);
      console.log(`✅ User ${username} toggled:`, response.data);
      toast.success(`User ${username} berhasil diaktifkan`);
      fetchUsers();
    } catch (error) {
      console.error(`❌ Error toggling user ${username}:`, error);
      console.error("❌ Error status:", error.response?.status);
      console.error("❌ Error data:", error.response?.data);
      toast.error("Gagal mengubah status user");
    }
  };

  // Handle Delete - Buka Modal Konfirmasi
  const handleDeleteClick = (user) => {
    setSelectedUser(user);
    setShowDeleteModal(true);
  };

  // Handle Delete - Konfirmasi
  const handleConfirmDelete = async () => {
    if (!selectedUser) return;
    
    setDeleteLoading(true);
    try {
      console.log(`🗑️ Deleting user: ${selectedUser.username}`);
      const response = await api.delete(`/admin/users/${selectedUser.username}`);
      console.log(`✅ User ${selectedUser.username} deleted:`, response.data);
      toast.success(`User ${selectedUser.username} berhasil dihapus`);
      setShowDeleteModal(false);
      setSelectedUser(null);
      fetchUsers();
    } catch (error) {
      console.error(`❌ Error deleting user ${selectedUser.username}:`, error);
      console.error("❌ Error status:", error.response?.status);
      console.error("❌ Error data:", error.response?.data);
      toast.error("Gagal menghapus user");
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleViewUserDetail = (user) => {
    setSelectedUser(user);
    setShowDetailModal(true);
  };

  const resetForm = () => {
    setFormData({
      username: "",
      password: "",
      full_name: "",
      email: "",
      role: "Petugas"
    });
  };

  // Handle Close Modal
  const handleCloseModal = () => {
    setShowModal(false);
    resetForm();
  };

  // Handle Close Confirm Modal
  const handleCloseConfirmModal = () => {
    setShowConfirmAddModal(false);
    resetForm();
  };

  const filteredUsers = users.filter(user =>
    user.username.toLowerCase().includes(search.toLowerCase()) ||
    user.full_name?.toLowerCase().includes(search.toLowerCase())
  );

  // Get role badge color
  const getRoleBadgeColor = (role) => {
    if (role === "Admin") {
      return isDarkMode 
        ? "bg-purple-900/40 text-purple-300 border-purple-700" 
        : "bg-purple-100 text-purple-700 border-purple-200";
    }
    return isDarkMode 
      ? "bg-blue-900/40 text-blue-300 border-blue-700" 
      : "bg-blue-100 text-blue-700 border-blue-200";
  };

  // Get status badge color
  const getStatusBadgeColor = (isActive) => {
    if (isActive) {
      return isDarkMode 
        ? "bg-green-900/40 text-green-300 border-green-700" 
        : "bg-green-100 text-green-700 border-green-200";
    }
    return isDarkMode 
      ? "bg-red-900/40 text-red-300 border-red-700" 
      : "bg-red-100 text-red-700 border-red-200";
  };

  // Debug: Log state showConfirmAddModal
  console.log("🔍 Render - showConfirmAddModal:", showConfirmAddModal);

  if (loading) {
    return (
      <div className={`flex items-center justify-center h-96 ${themeClasses.bg}`}>
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className={`text-2xl font-bold ${themeClasses.text}`}>Kelola Data User</h1>
          <p className={`mt-1 ${themeClasses.textMuted}`}>
            Kelola akun pengguna sistem (Admin dan Petugas)
          </p>
        </div>
        <button
          onClick={() => { resetForm(); setShowModal(true); }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
        >
          <UserPlus className="w-4 h-4" />
          Tambah User
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${isDarkMode ? "text-gray-500" : "text-gray-400"}`} />
        <input
          type="text"
          placeholder="Cari pengguna..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className={`w-full pl-10 pr-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${themeClasses.input} ${themeClasses.border}`}
        />
      </div>

      {/* User Cards - Professional Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredUsers.map((user) => (
          <motion.div
            key={user.username}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`group rounded-xl shadow-sm border overflow-hidden transition-all duration-200 ${
              isDarkMode
                ? user.is_active ? "bg-gray-800 border-gray-700 hover:border-gray-600" : "bg-gray-800/50 border-gray-700 opacity-60"
                : user.is_active ? "bg-white border-gray-200 hover:border-gray-300 hover:shadow-md" : "bg-gray-50 border-gray-200 opacity-60"
            }`}
          >
            {/* Card Header - Avatar & Name */}
            <div className="p-5 pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3 min-w-0">
                  {/* Avatar */}
                  <div className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center ${
                    user.role === "Admin" 
                      ? isDarkMode ? "bg-purple-900/30" : "bg-purple-100" 
                      : isDarkMode ? "bg-blue-900/30" : "bg-blue-100"
                  }`}>
                    {user.role === "Admin" ? (
                      <Shield className={`w-6 h-6 ${isDarkMode ? "text-purple-400" : "text-purple-600"}`} />
                    ) : (
                      <UserCircle className={`w-6 h-6 ${isDarkMode ? "text-blue-400" : "text-blue-600"}`} />
                    )}
                  </div>
                  
                  {/* Name & Username */}
                  <div className="min-w-0 flex-1">
                    <p className={`font-semibold text-base truncate ${themeClasses.text}`}>
                      {user.full_name || user.username}
                    </p>
                    <p className={`text-sm truncate ${themeClasses.textMuted}`}>
                      @{user.username}
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-1 flex-shrink-0 ml-2">
                  <button
                    onClick={() => handleViewUserDetail(user)}
                    className={`p-1.5 rounded-lg transition-all duration-200 ${
                      isDarkMode ? "text-gray-400 hover:bg-gray-700 hover:scale-110" : "text-gray-500 hover:bg-gray-100 hover:scale-110"
                    }`}
                    title="Detail User"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>
                  
                  {user.username !== "admin" && (
                    <button
                      onClick={() => handleToggleClick(user)}
                      className={`p-1.5 rounded-lg transition-all duration-200 ${
                        user.is_active
                          ? isDarkMode ? "text-green-400 hover:bg-green-900/30 hover:scale-110" : "text-green-600 hover:bg-green-50 hover:scale-110"
                          : isDarkMode ? "text-gray-500 hover:bg-gray-700 hover:scale-110" : "text-gray-400 hover:bg-gray-100 hover:scale-110"
                      }`}
                      title={user.is_active ? "Nonaktifkan" : "Aktifkan"}
                    >
                      <Power className="w-4 h-4" />
                    </button>
                  )}
                  {user.username !== "admin" && (
                    <button
                      onClick={() => handleDeleteClick(user)}
                      className={`p-1.5 rounded-lg transition-all duration-200 ${
                        isDarkMode ? "text-red-400 hover:bg-red-900/30 hover:scale-110" : "text-red-500 hover:bg-red-50 hover:scale-110"
                      }`}
                      title="Hapus"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className={`px-5 py-3 border-t ${isDarkMode ? "border-gray-700" : "border-gray-100"}`}>
              <div className="space-y-2">
                <div className="flex items-center gap-2.5">
                  <Mail className={`w-3.5 h-3.5 flex-shrink-0 ${isDarkMode ? "text-gray-500" : "text-gray-400"}`} />
                  <span className={`text-sm truncate ${themeClasses.textMuted}`}>
                    {user.email || "-"}
                  </span>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-medium ${getRoleBadgeColor(user.role)}`}>
                    <Shield className="w-3 h-3" />
                    <span>{user.role}</span>
                  </div>
                  
                  <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-medium ${getStatusBadgeColor(user.is_active)}`}>
                    <BadgeCheck className="w-3 h-3" />
                    <span>{user.is_active ? "Aktif" : "Nonaktif"}</span>
                  </div>

                  {user.created_at && (
                    <div className={`flex items-center gap-1.5 text-xs ${themeClasses.textMuted}`}>
                      <Calendar className="w-3 h-3" />
                      <span>{new Date(user.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {filteredUsers.length === 0 && (
        <div className={`text-center py-16 ${isDarkMode ? "bg-gray-800" : "bg-white"} rounded-xl border ${isDarkMode ? "border-gray-700" : "border-gray-100"}`}>
          <Users className={`w-12 h-12 mx-auto mb-3 ${isDarkMode ? "text-gray-600" : "text-gray-300"}`} />
          <p className={themeClasses.textMuted}>Tidak ada pengguna ditemukan</p>
        </div>
      )}

      {/* Modal Detail User */}
      {showDetailModal && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`w-full max-w-md rounded-2xl shadow-xl border p-6 ${
              isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"
            }`}
          >
            <div className="flex justify-between items-center mb-5">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  selectedUser.role === "Admin" 
                    ? isDarkMode ? "bg-purple-900/30" : "bg-purple-100" 
                    : isDarkMode ? "bg-blue-900/30" : "bg-blue-100"
                }`}>
                  {selectedUser.role === "Admin" ? (
                    <Shield className={`w-6 h-6 ${isDarkMode ? "text-purple-400" : "text-purple-600"}`} />
                  ) : (
                    <UserCircle className={`w-6 h-6 ${isDarkMode ? "text-blue-400" : "text-blue-600"}`} />
                  )}
                </div>
                <div>
                  <h2 className={`text-xl font-bold ${themeClasses.text}`}>Detail User</h2>
                  <p className={`text-sm ${themeClasses.textMuted}`}>Informasi lengkap pengguna</p>
                </div>
              </div>
              <button
                onClick={() => { setShowDetailModal(false); setSelectedUser(null); }}
                className={`p-1.5 rounded-lg transition-colors ${isDarkMode ? "hover:bg-gray-700" : "hover:bg-gray-100"}`}
              >
                <X className={`w-5 h-5 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`} />
              </button>
            </div>

            <div className="space-y-4">
              <div className={`p-3 rounded-lg ${isDarkMode ? "bg-gray-700/50" : "bg-gray-50"}`}>
                <div className="flex items-center gap-2.5">
                  <User className={`w-4 h-4 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`} />
                  <div>
                    <p className={`text-xs ${themeClasses.textMuted}`}>Nama Lengkap</p>
                    <p className={`font-medium ${themeClasses.text}`}>
                      {selectedUser.full_name || "-"}
                    </p>
                  </div>
                </div>
              </div>

              <div className={`p-3 rounded-lg ${isDarkMode ? "bg-gray-700/50" : "bg-gray-50"}`}>
                <div className="flex items-center gap-2.5">
                  <AtSign className={`w-4 h-4 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`} />
                  <div>
                    <p className={`text-xs ${themeClasses.textMuted}`}>Username</p>
                    <p className={`font-medium ${themeClasses.text}`}>
                      @{selectedUser.username}
                    </p>
                  </div>
                </div>
              </div>

              <div className={`p-3 rounded-lg ${isDarkMode ? "bg-gray-700/50" : "bg-gray-50"}`}>
                <div className="flex items-center gap-2.5">
                  <Mail className={`w-4 h-4 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`} />
                  <div>
                    <p className={`text-xs ${themeClasses.textMuted}`}>Email</p>
                    <p className={`font-medium ${themeClasses.text}`}>
                      {selectedUser.email || "-"}
                    </p>
                  </div>
                </div>
              </div>

              <div className={`p-3 rounded-lg ${isDarkMode ? "bg-gray-700/50" : "bg-gray-50"}`}>
                <div className="flex items-center gap-2.5">
                  <Shield className={`w-4 h-4 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`} />
                  <div>
                    <p className={`text-xs ${themeClasses.textMuted}`}>Role</p>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getRoleBadgeColor(selectedUser.role)}`}>
                      {selectedUser.role}
                    </span>
                  </div>
                </div>
              </div>

              <div className={`p-3 rounded-lg ${isDarkMode ? "bg-gray-700/50" : "bg-gray-50"}`}>
                <div className="flex items-center gap-2.5">
                  <BadgeCheck className={`w-4 h-4 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`} />
                  <div>
                    <p className={`text-xs ${themeClasses.textMuted}`}>Status</p>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeColor(selectedUser.is_active)}`}>
                      {selectedUser.is_active ? "Aktif" : "Nonaktif"}
                    </span>
                  </div>
                </div>
              </div>

              {selectedUser.created_at && (
                <div className={`p-3 rounded-lg ${isDarkMode ? "bg-gray-700/50" : "bg-gray-50"}`}>
                  <div className="flex items-center gap-2.5">
                    <Calendar className={`w-4 h-4 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`} />
                    <div>
                      <p className={`text-xs ${themeClasses.textMuted}`}>Tanggal Bergabung</p>
                      <p className={`font-medium ${themeClasses.text}`}>
                        {new Date(selectedUser.created_at).toLocaleDateString('id-ID', { 
                          day: 'numeric', 
                          month: 'long', 
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {selectedUser.last_login && (
                <div className={`p-3 rounded-lg ${isDarkMode ? "bg-gray-700/50" : "bg-gray-50"}`}>
                  <div className="flex items-center gap-2.5">
                    <Info className={`w-4 h-4 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`} />
                    <div>
                      <p className={`text-xs ${themeClasses.textMuted}`}>Terakhir Login</p>
                      <p className={`font-medium ${themeClasses.text}`}>
                        {new Date(selectedUser.last_login).toLocaleDateString('id-ID', { 
                          day: 'numeric', 
                          month: 'long', 
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end mt-5 pt-4 border-t border-gray-700">
              <button
                onClick={() => { setShowDetailModal(false); setSelectedUser(null); }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Tutup
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Modal Konfirmasi Tambah User - DIPERBAIKI */}
      {showConfirmAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className={`w-full max-w-md rounded-2xl shadow-2xl border p-6 ${
              isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"
            }`}
          >
            <div className="flex justify-center mb-4">
              <div className={`p-4 rounded-full ${
                isDarkMode ? "bg-green-900/30" : "bg-green-50"
              }`}>
                <CheckCircle className={`w-10 h-10 ${
                  isDarkMode ? "text-green-400" : "text-green-500"
                }`} />
              </div>
            </div>

            <h3 className={`text-xl font-bold text-center ${themeClasses.text}`}>
              Konfirmasi Tambah User
            </h3>
            
            <p className={`mt-2 text-sm text-center ${themeClasses.textMuted}`}>
              Anda akan menambahkan user baru dengan data berikut:
            </p>
            
            <div className={`mt-4 p-3 rounded-lg ${
              isDarkMode ? "bg-gray-700/50" : "bg-gray-50"
            }`}>
              <div className="flex items-center justify-between text-sm">
                <span className={themeClasses.textMuted}>Username</span>
                <span className={`font-medium ${themeClasses.text}`}>@{formData.username}</span>
              </div>
              <div className="flex items-center justify-between text-sm mt-1.5">
                <span className={themeClasses.textMuted}>Nama Lengkap</span>
                <span className={`font-medium ${themeClasses.text}`}>{formData.full_name || "-"}</span>
              </div>
              <div className="flex items-center justify-between text-sm mt-1.5">
                <span className={themeClasses.textMuted}>Email</span>
                <span className={`font-medium ${themeClasses.text}`}>{formData.email || "-"}</span>
              </div>
              <div className="flex items-center justify-between text-sm mt-1.5">
                <span className={themeClasses.textMuted}>Role</span>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getRoleBadgeColor(formData.role)}`}>
                  {formData.role}
                </span>
              </div>
            </div>

            <div className={`mt-4 p-3 rounded-lg border ${
              isDarkMode ? "border-green-800/30 bg-green-900/10" : "border-green-200 bg-green-50"
            }`}>
              <p className={`text-xs text-center ${
                isDarkMode ? "text-green-300" : "text-green-600"
              }`}>
                💡 Pastikan data yang dimasukkan sudah benar sebelum menyimpan.
              </p>
            </div>

            <div className="flex gap-3 mt-5 pt-4 border-t border-gray-700">
              <button
                onClick={handleCloseConfirmModal}
                className={`flex-1 py-2.5 rounded-lg border transition-colors ${
                  isDarkMode
                    ? "border-gray-600 text-gray-300 hover:bg-gray-700"
                    : "border-gray-300 text-gray-700 hover:bg-gray-50"
                }`}
              >
                Kembali
              </button>
              <button
                onClick={handleConfirmAddUser}
                disabled={confirmAddLoading}
                className="flex-1 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 font-medium flex items-center justify-center"
              >
                {confirmAddLoading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Menyimpan...
                  </span>
                ) : (
                  "Ya, Tambahkan"
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Modal Konfirmasi Nonaktifkan User */}
      {showToggleModal && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className={`w-full max-w-md rounded-2xl shadow-2xl border p-6 ${
              isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"
            }`}
          >
            <div className="flex justify-center mb-4">
              <div className={`p-4 rounded-full ${
                isDarkMode ? "bg-yellow-900/30" : "bg-yellow-50"
              }`}>
                <AlertTriangle className={`w-10 h-10 ${
                  isDarkMode ? "text-yellow-400" : "text-yellow-500"
                }`} />
              </div>
            </div>

            <h3 className={`text-xl font-bold text-center ${themeClasses.text}`}>
              Nonaktifkan User
            </h3>
            
            <p className={`mt-2 text-sm text-center ${themeClasses.textMuted}`}>
              Anda yakin ingin menonaktifkan user
            </p>
            <p className={`mt-1 text-center font-semibold text-base ${themeClasses.text}`}>
              “{selectedUser.full_name || selectedUser.username}”
            </p>
            
            <div className={`mt-4 p-3 rounded-lg ${
              isDarkMode ? "bg-gray-700/50" : "bg-gray-50"
            }`}>
              <div className="flex items-center justify-between text-sm">
                <span className={themeClasses.textMuted}>Username</span>
                <span className={`font-medium ${themeClasses.text}`}>@{selectedUser.username}</span>
              </div>
              <div className="flex items-center justify-between text-sm mt-1.5">
                <span className={themeClasses.textMuted}>Role</span>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getRoleBadgeColor(selectedUser.role)}`}>
                  {selectedUser.role}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm mt-1.5">
                <span className={themeClasses.textMuted}>Status</span>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeColor(true)}`}>
                  Aktif
                </span>
              </div>
            </div>

            <div className={`mt-4 p-3 rounded-lg border ${
              isDarkMode ? "border-yellow-800/30 bg-yellow-900/10" : "border-yellow-200 bg-yellow-50"
            }`}>
              <p className={`text-xs text-center ${
                isDarkMode ? "text-yellow-300" : "text-yellow-600"
              }`}>
                ⚠️ User yang dinonaktifkan tidak dapat login hingga diaktifkan kembali.
              </p>
            </div>

            <div className="flex gap-3 mt-5 pt-4 border-t border-gray-700">
              <button
                onClick={() => { setShowToggleModal(false); setSelectedUser(null); }}
                className={`flex-1 py-2.5 rounded-lg border transition-colors ${
                  isDarkMode
                    ? "border-gray-600 text-gray-300 hover:bg-gray-700"
                    : "border-gray-300 text-gray-700 hover:bg-gray-50"
                }`}
              >
                Batal
              </button>
              <button
                onClick={handleConfirmToggle}
                disabled={toggleLoading}
                className="flex-1 py-2.5 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors disabled:opacity-50 font-medium flex items-center justify-center"
              >
                {toggleLoading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Memproses...
                  </span>
                ) : (
                  "Ya, Nonaktifkan"
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Modal Konfirmasi Hapus User */}
      {showDeleteModal && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className={`w-full max-w-md rounded-2xl shadow-2xl border p-6 ${
              isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"
            }`}
          >
            <div className="flex justify-center mb-4">
              <div className={`p-4 rounded-full ${
                isDarkMode ? "bg-red-900/30" : "bg-red-50"
              }`}>
                <AlertTriangle className={`w-10 h-10 ${
                  isDarkMode ? "text-red-400" : "text-red-500"
                }`} />
              </div>
            </div>

            <h3 className={`text-xl font-bold text-center ${themeClasses.text}`}>
              Hapus User
            </h3>
            
            <p className={`mt-2 text-sm text-center ${themeClasses.textMuted}`}>
              Anda yakin ingin menghapus user
            </p>
            <p className={`mt-1 text-center font-semibold text-base ${themeClasses.text}`}>
              “{selectedUser.full_name || selectedUser.username}”
            </p>
            
            <div className={`mt-4 p-3 rounded-lg ${
              isDarkMode ? "bg-gray-700/50" : "bg-gray-50"
            }`}>
              <div className="flex items-center justify-between text-sm">
                <span className={themeClasses.textMuted}>Username</span>
                <span className={`font-medium ${themeClasses.text}`}>@{selectedUser.username}</span>
              </div>
              <div className="flex items-center justify-between text-sm mt-1.5">
                <span className={themeClasses.textMuted}>Role</span>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getRoleBadgeColor(selectedUser.role)}`}>
                  {selectedUser.role}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm mt-1.5">
                <span className={themeClasses.textMuted}>Status</span>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeColor(selectedUser.is_active)}`}>
                  {selectedUser.is_active ? "Aktif" : "Nonaktif"}
                </span>
              </div>
            </div>

            <div className={`mt-4 p-3 rounded-lg border ${
              isDarkMode ? "border-red-800/30 bg-red-900/10" : "border-red-200 bg-red-50"
            }`}>
              <p className={`text-xs text-center ${
                isDarkMode ? "text-red-300" : "text-red-600"
              }`}>
                ⚠️ Tindakan ini tidak dapat dibatalkan. Data user akan dihapus secara permanen.
              </p>
            </div>

            <div className="flex gap-3 mt-5 pt-4 border-t border-gray-700">
              <button
                onClick={() => { setShowDeleteModal(false); setSelectedUser(null); }}
                className={`flex-1 py-2.5 rounded-lg border transition-colors ${
                  isDarkMode
                    ? "border-gray-600 text-gray-300 hover:bg-gray-700"
                    : "border-gray-300 text-gray-700 hover:bg-gray-50"
                }`}
              >
                Batal
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={deleteLoading}
                className="flex-1 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 font-medium flex items-center justify-center"
              >
                {deleteLoading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Menghapus...
                  </span>
                ) : (
                  "Ya, Hapus"
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Modal Tambah User */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`w-full max-w-md rounded-2xl shadow-xl border p-6 ${
              isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"
            }`}
          >
            <div className="flex justify-between items-center mb-5">
              <div>
                <h2 className={`text-xl font-bold ${themeClasses.text}`}>Tambah User Baru</h2>
                <p className={`text-sm ${themeClasses.textMuted}`}>Isi data pengguna baru</p>
              </div>
              <button
                onClick={handleCloseModal}
                className={`p-1.5 rounded-lg transition-colors ${isDarkMode ? "hover:bg-gray-700" : "hover:bg-gray-100"}`}
              >
                <X className={`w-5 h-5 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`} />
              </button>
            </div>

            <form onSubmit={handleAddUserClick} className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-1.5 ${themeClasses.text}`}>
                  Username <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  placeholder="Masukkan username (min. 3 karakter)"
                  className={`w-full px-3.5 py-2.5 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 ${themeClasses.input} ${themeClasses.border}`}
                  required
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1.5 ${themeClasses.text}`}>
                  Password <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Minimal 6 karakter"
                  className={`w-full px-3.5 py-2.5 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 ${themeClasses.input} ${themeClasses.border}`}
                  required
                  minLength={6}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1.5 ${themeClasses.text}`}>
                  Nama Lengkap
                </label>
                <input
                  type="text"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  placeholder="Masukkan nama lengkap"
                  className={`w-full px-3.5 py-2.5 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 ${themeClasses.input} ${themeClasses.border}`}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1.5 ${themeClasses.text}`}>
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="Masukkan email"
                  className={`w-full px-3.5 py-2.5 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 ${themeClasses.input} ${themeClasses.border}`}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1.5 ${themeClasses.text}`}>
                  Role <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className={`w-full px-3.5 py-2.5 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 ${themeClasses.input} ${themeClasses.border}`}
                >
                  <option value="Petugas">Petugas</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className={`flex-1 py-2.5 rounded-lg border transition-colors ${
                    isDarkMode
                      ? "border-gray-600 text-gray-300 hover:bg-gray-700"
                      : "border-gray-300 text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="flex-1 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 font-medium"
                >
                  {formLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Memproses...
                    </span>
                  ) : (
                    "Simpan"
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}