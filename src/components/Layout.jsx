// src/components/Layout.jsx
import { useState } from "react";
import { Link, useLocation, useNavigate, Outlet } from "react-router-dom";
import { 
  LayoutDashboard, 
  Upload, 
  History, 
  Menu, 
  X,
  Shield,
  Database,
  Activity,
  Users,
  LogOut
} from "lucide-react";
import { useAppTheme } from "../hooks/useTheme";
import { toast } from "react-toastify";

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { isDarkMode, themeClasses } = useAppTheme();
  
  const role = localStorage.getItem("role");
  const fullName = localStorage.getItem("full_name") || "User";

  const navItems = [
    { path: "/dashboard", name: "Dashboard", icon: LayoutDashboard },
    { path: "/upload", name: "Upload CSV", icon: Upload },
    { path: "/history", name: "Riwayat", icon: History },
  ];

  if (role === "Admin") {
    navItems.push({ path: "/manage-users", name: "Kelola User", icon: Users });
  }

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    localStorage.removeItem("role");
    localStorage.removeItem("full_name");
    toast.info("Anda telah logout");
    navigate("/login");
  };

  return (
    <div className={`min-h-screen ${themeClasses.bg}`}>
      {/* Sidebar */}
      <aside className={`fixed top-0 left-0 z-40 w-64 h-screen transition-transform ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} ${
        isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
      } border-r shadow-lg lg:translate-x-0`}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className={`flex items-center justify-between p-4 border-b ${isDarkMode ? "border-gray-700" : "border-gray-200"}`}>
            <div className="flex items-center gap-2">
              <Shield className="w-8 h-8 text-blue-600" />
              <span className={`text-lg font-bold ${themeClasses.text}`}>Malware<span className="text-blue-600">Detect</span></span>
            </div>
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden">
              <X className={`w-5 h-5 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`} />
            </button>
          </div>

          {/* User Info */}
          <div className={`p-4 border-b ${isDarkMode ? "border-gray-700" : "border-gray-200"}`}>
            <p className={`font-medium ${themeClasses.text}`}>{fullName}</p>
            <p className={`text-sm ${themeClasses.textMuted}`}>
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                role === "Admin"
                  ? isDarkMode ? "bg-purple-900/50 text-purple-300" : "bg-purple-100 text-purple-700"
                  : isDarkMode ? "bg-blue-900/50 text-blue-300" : "bg-blue-100 text-blue-700"
              }`}>
                {role}
              </span>
            </p>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  isActive(item.path)
                    ? isDarkMode ? "bg-blue-600 text-white" : "bg-blue-50 text-blue-600"
                    : isDarkMode ? "text-gray-300 hover:bg-gray-700" : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span>{item.name}</span>
              </Link>
            ))}
          </nav>

          {/* Footer */}
          <div className={`p-4 border-t ${isDarkMode ? "border-gray-700" : "border-gray-200"}`}>
            <div className={`flex items-center gap-2 text-sm ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
              <Database className="w-4 h-4" />
              <span>Barlow Twins • CSSL</span>
            </div>
            <button
              onClick={handleLogout}
              className={`flex items-center gap-2 mt-3 text-sm w-full px-3 py-2 rounded-lg transition-colors ${
                isDarkMode
                  ? "text-red-400 hover:bg-red-900/30"
                  : "text-red-600 hover:bg-red-50"
              }`}
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="lg:ml-64">
        <header className={`sticky top-0 z-30 border-b shadow-sm ${
          isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
        }`}>
          <div className="flex items-center justify-between px-6 py-3">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden">
              <Menu className={`w-6 h-6 ${isDarkMode ? "text-gray-400" : "text-gray-600"}`} />
            </button>
            <div className="flex items-center gap-3">
              <Activity className="w-5 h-5 text-blue-600" />
              <span className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                Model: Barlow Twins • SSL
              </span>
            </div>
            <button
              onClick={handleLogout}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <LogOut className={`w-5 h-5 ${isDarkMode ? "text-gray-400" : "text-gray-600"}`} />
            </button>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}