// src/pages/DashboardAdmin.jsx
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import {
  Activity,
  TrendingUp,
  Shield,
  CheckCircle,
  Upload,
  Database,
  BarChart3,
  PieChart as PieChartIcon,
  FileText,
  Cpu,
  Moon,
  Sun,
  Users,
  User,
  Brain,
  AlertCircle,
  ChevronDown
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import api from "../services/api";
import { useAppTheme } from "../hooks/useTheme";

// Warna untuk chart (light mode)
const CHART_COLORS_LIGHT = {
  blue: "#3B82F6",
  green: "#10B981",
  orange: "#F59E0B",
  red: "#EF4444",
  purple: "#8B5CF6",
  pink: "#EC4899",
  teal: "#14B8A6",
  yellow: "#FBBF24"
};

// Warna untuk chart (dark mode)
const CHART_COLORS_DARK = {
  blue: "#60A5FA",
  green: "#34D399",
  orange: "#FBBF24",
  red: "#F87171",
  purple: "#A78BFA",
  pink: "#F472B6",
  teal: "#2DD4BF",
  yellow: "#FCD34D"
};

export default function DashboardAdmin() {
  console.log("✅ DashboardAdmin component rendered!");

  const { isDarkMode, toggleTheme, themeClasses } = useAppTheme();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalTests: 0,
    totalUsers: 0,
    totalSamples: 0,
    averageAccuracy: 0,
    averageMacroF1: 0,
    averageConfidence: 0,
    recentTests: [],
    classDistribution: [],
    performanceHistory: [],
    hasLabelData: false,
    hasConfidenceData: false
  });
  
  // 🔥 State untuk filter mode chart
  const [chartMode, setChartMode] = useState("prediction"); // "label" atau "prediction"

  const CHART_COLORS = isDarkMode ? CHART_COLORS_DARK : CHART_COLORS_LIGHT;
  const COLORS = Object.values(CHART_COLORS);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        
        const response = await api.get("/history/stats");
        const historyResponse = await api.get("/history/list");
        const usersResponse = await api.get("/admin/users");
        
        const history = historyResponse.data || [];
        
        // 🔥 Cek apakah ada data dengan label
        const hasLabelData = history.some(test => test.has_label === true);
        
        // 🔥 Cek apakah ada data dengan confidence (selalu ada)
        const hasConfidenceData = history.length > 0;
        
        // 🔥 Hitung total sampel
        const totalSamples = history.reduce((sum, item) => sum + (item.samples || 0), 0);
        
        // 🔥 Hitung rata-rata metrik (hitung hanya jika nilai tidak null)
        let totalAccuracy = 0;
        let totalMacroF1 = 0;
        let accuracyCount = 0;
        let macroF1Count = 0;
        
        history.forEach(item => {
          if (item.accuracy !== null && item.accuracy !== undefined) {
            totalAccuracy += item.accuracy;
            accuracyCount++;
          }
          if (item.macro_f1 !== null && item.macro_f1 !== undefined) {
            totalMacroF1 += item.macro_f1;
            macroF1Count++;
          }
        });
        
        // 🔥 Hitung rata-rata confidence dari recent tests
        let totalConfidence = 0;
        let confidenceCount = 0;
        history.forEach(item => {
          if (item.avg_confidence !== null && item.avg_confidence !== undefined) {
            totalConfidence += item.avg_confidence;
            confidenceCount++;
          }
        });
        const avgConfidence = confidenceCount > 0 ? (totalConfidence / confidenceCount) : 0;
        
        const recentTestsWithUser = history.slice(0, 5).map(item => ({
          ...item,
          username: item.username || "Unknown User",
          // 🔥 Pastikan avg_confidence adalah angka atau null
          avg_confidence: item.avg_confidence !== null && item.avg_confidence !== undefined ? item.avg_confidence : null
        }));
        
        setStats({
          totalTests: response.data.totalTests || 0,
          totalUsers: usersResponse.data?.length || 0,
          totalSamples: totalSamples,
          hasLabelData: hasLabelData,
          hasConfidenceData: hasConfidenceData,
          averageAccuracy: accuracyCount > 0 ? (totalAccuracy / accuracyCount).toFixed(1) : 0,
          averageMacroF1: macroF1Count > 0 ? (totalMacroF1 / macroF1Count).toFixed(1) : 0,
          averageConfidence: avgConfidence.toFixed(1),
          recentTests: recentTestsWithUser,
          classDistribution: response.data.classDistribution || [],
          performanceHistory: history.slice(0, 6).reverse().map(item => ({
            ...item,
            // 🔥 Pastikan confidence ada di performance history
            avg_confidence: item.avg_confidence !== null && item.avg_confidence !== undefined ? item.avg_confidence : null
          }))
        });

        // 🔥 Set chart mode default: jika ada label, tampilkan label, jika tidak, tampilkan prediction
        if (hasLabelData) {
          setChartMode("label");
        } else {
          setChartMode("prediction");
        }
      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
        toast.error("Gagal memuat data dashboard");
      } finally {
        setLoading(false);
      }
    };
    
    fetchStats();
  }, []);

  // 🔥 Stat Cards - Hanya 4 card utama
  const statCards = [
    {
      title: "Total Pengujian",
      value: stats.totalTests,
      icon: Database,
      gradient: isDarkMode ? "from-blue-600 to-blue-500" : "from-blue-500 to-blue-600",
      description: "Jumlah pengujian yang telah dilakukan"
    },
    {
      title: "Total Sampel",
      value: stats.totalSamples || 0,
      icon: FileText,
      gradient: isDarkMode ? "from-teal-600 to-teal-500" : "from-teal-500 to-teal-600",
      description: "Total sampel yang telah diprediksi"
    },
    {
      title: "Total Pengguna",
      value: stats.totalUsers,
      icon: Users,
      gradient: isDarkMode ? "from-purple-600 to-purple-500" : "from-purple-500 to-purple-600",
      description: "Jumlah user terdaftar (Admin + Petugas)"
    },
    {
      title: "Rata-rata Confidence",
      value: `${stats.averageConfidence}%`,
      icon: Activity,
      gradient: isDarkMode ? "from-green-600 to-green-500" : "from-green-500 to-green-600",
      description: "Confidence rata-rata dari semua prediksi"
    }
  ];

  const customTooltipStyle = {
    backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
    border: `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`,
    borderRadius: '8px',
    padding: '8px 12px',
    color: isDarkMode ? '#f3f4f6' : '#1f2937'
  };

  // 🔥 Render performance chart berdasarkan mode
  const renderPerformanceChart = () => {
    if (stats.performanceHistory.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <BarChart3 className={`w-12 h-12 mb-2 ${isDarkMode ? "text-gray-600" : "text-gray-300"}`} />
          <p className={themeClasses.textMuted}>Belum ada data performa</p>
          <p className={`text-sm mt-1 ${themeClasses.textMuted}`}>Upload CSV untuk memulai pengujian</p>
        </div>
      );
    }

    // 🔥 Mode Label: Tampilkan Akurasi & Macro-F1
    if (chartMode === "label" && stats.hasLabelData) {
      return (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={stats.performanceHistory}>
            <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? "#374151" : "#e5e7eb"} />
            <XAxis dataKey="date" tick={{ fontSize: 11 }} tickLine={false} stroke={isDarkMode ? "#9ca3af" : "#6b7280"} />
            <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} tickLine={false} stroke={isDarkMode ? "#9ca3af" : "#6b7280"} />
            <Tooltip contentStyle={customTooltipStyle} />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="accuracy" 
              name="Akurasi"
              stroke={CHART_COLORS.blue} 
              strokeWidth={2}
              dot={{ fill: CHART_COLORS.blue, strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6 }}
            />
            <Line 
              type="monotone" 
              dataKey="macro_f1" 
              name="Macro-F1"
              stroke={CHART_COLORS.green} 
              strokeWidth={2}
              dot={{ fill: CHART_COLORS.green, strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      );
    }

    // 🔥 Mode Prediksi (Non-Label): Tampilkan Confidence Score
    if (chartMode === "prediction") {
      // 🔥 Cek apakah ada data confidence
      const hasConfidenceData = stats.performanceHistory.some(item => item.avg_confidence !== null && item.avg_confidence !== undefined);
      
      if (hasConfidenceData) {
        return (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={stats.performanceHistory}>
              <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? "#374151" : "#e5e7eb"} />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} tickLine={false} stroke={isDarkMode ? "#9ca3af" : "#6b7280"} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} tickLine={false} stroke={isDarkMode ? "#9ca3af" : "#6b7280"} />
              <Tooltip contentStyle={customTooltipStyle} />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="avg_confidence" 
                name="Confidence Score"
                stroke={CHART_COLORS.purple} 
                strokeWidth={2}
                dot={{ fill: CHART_COLORS.purple, strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        );
      } else {
        return (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <Brain className={`w-12 h-12 mb-2 ${isDarkMode ? "text-gray-600" : "text-gray-300"}`} />
            <p className={themeClasses.textMuted}>Mode Prediksi Murni</p>
            <p className={`text-sm mt-1 ${themeClasses.textMuted}`}>
              Data tanpa label evaluasi • Confidence akan ditampilkan setelah prediksi
            </p>
          </div>
        );
      }
    }

    return null;
  };

  if (loading) {
    return (
      <div className={`flex items-center justify-center h-96 ${themeClasses.bg}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className={`mt-4 ${themeClasses.textMuted}`}>Memuat data dashboard...</p>
        </div>
      </div>
    );
  }

  // 🔥 Tentukan apakah dropdown harus muncul
  const showModeDropdown = stats.hasLabelData;

  return (
    <div className="space-y-6">
      {/* Header dengan Dark Mode Toggle */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className={`text-2xl font-bold ${themeClasses.text}`}>Dashboard Admin</h1>
          <p className={themeClasses.textMuted}>Selamat Datang Di Dashboard Admin - Monitoring Klasifikasi Malware</p>
        </div>
        <button
          onClick={toggleTheme}
          className={`p-2 rounded-lg transition-colors ${
            isDarkMode 
              ? "bg-gray-700 text-yellow-400 hover:bg-gray-600" 
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>
      </div>

      {/* Header Gradient Section */}
      <div className={`relative overflow-hidden rounded-2xl p-8 shadow-xl ${
        isDarkMode 
          ? "bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800" 
          : "bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800"
      }`}>
        <div className="absolute inset-0 opacity-10">
          <div className={`absolute top-0 right-0 w-64 h-64 rounded-full filter blur-3xl ${
            isDarkMode ? "bg-gray-500" : "bg-white"
          }`}></div>
          <div className={`absolute bottom-0 left-0 w-80 h-80 rounded-full filter blur-3xl ${
            isDarkMode ? "bg-gray-600" : "bg-blue-400"
          }`}></div>
        </div>
        
        <div className="relative z-10 flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">Malware Detection System</h2>
            <p className="text-blue-100">Dashboard Admin • Monitoring Seluruh Aktivitas Pengujian</p>
            <div className="flex items-center gap-4 mt-4">
              <div className="flex items-center gap-2 text-sm text-blue-200">
                <Shield className="w-4 h-4" />
                <span>Model: Barlow Twins</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-blue-200">
                <Activity className="w-4 h-4" />
                <span>CSSL • Redundancy Reduction</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-blue-200">
                <Users className="w-4 h-4" />
                <span>{stats.totalUsers} User Terdaftar</span>
              </div>
            </div>
          </div>
          <Link
            to="/upload"
            className="flex items-center gap-2 px-5 py-2.5 bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-xl transition-all duration-300 font-medium text-white"
          >
            <Upload className="w-4 h-4" />
            <span>Upload CSV Baru</span>
          </Link>
        </div>
      </div>

      {/* Stat Cards Grid - 4 Card */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {statCards.map((card, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`group relative overflow-hidden rounded-xl p-6 shadow-sm border transition-all duration-300 ${
              isDarkMode 
                ? "bg-gray-800 border-gray-700 hover:border-gray-600" 
                : "bg-white border-gray-100 hover:shadow-md"
            }`}
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300 -z-10`}></div>
            
            <div className="flex items-start justify-between">
              <div>
                <p className={`text-sm mb-1 ${themeClasses.textMuted}`}>{card.title}</p>
                <p className={`text-2xl font-bold ${themeClasses.text}`}>{card.value}</p>
                <p className={`text-xs mt-2 ${themeClasses.textMuted}`}>{card.description}</p>
              </div>
              <div className={`p-3 rounded-xl bg-gradient-to-br ${card.gradient} shadow-lg`}>
                <card.icon className="w-5 h-5 text-white" />
              </div>
            </div>
            
            {typeof card.value === 'string' && card.value.includes('%') && (
              <div className="mt-4">
                <div className={`h-1.5 rounded-full overflow-hidden ${isDarkMode ? "bg-gray-700" : "bg-gray-100"}`}>
                  <div 
                    className={`h-full rounded-full bg-gradient-to-r ${card.gradient}`}
                    style={{ width: card.value }}
                  ></div>
                </div>
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Performance Chart & Class Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Performance History Chart */}
        <div className={`lg:col-span-2 rounded-xl shadow-sm border p-5 ${
          isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"
        }`}>
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <TrendingUp className={`w-5 h-5 ${isDarkMode ? "text-blue-400" : "text-blue-600"}`} />
              <h2 className={`text-lg font-semibold ${themeClasses.text}`}>Performa Pengujian</h2>
            </div>
            <div className="flex items-center gap-3">
              <span className={`text-xs ${themeClasses.textMuted}`}>
                {chartMode === "label" ? "Akurasi vs Macro-F1" : "Confidence Score"}
              </span>
              {/* 🔥 Dropdown Mode - Hanya muncul jika ada data dengan label */}
              {showModeDropdown && (
                <div className="relative">
                  <select
                    value={chartMode}
                    onChange={(e) => setChartMode(e.target.value)}
                    className={`appearance-none pl-3 pr-8 py-1.5 text-sm rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      isDarkMode 
                        ? "bg-gray-700 border-gray-600 text-gray-200" 
                        : "bg-white border-gray-200 text-gray-700"
                    }`}
                  >
                    <option value="label">📊 Label</option>
                    <option value="prediction">🔮 Non Label (Prediksi)</option>
                  </select>
                  <ChevronDown className={`absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 ${
                    isDarkMode ? "text-gray-400" : "text-gray-500"
                  } pointer-events-none`} />
                </div>
              )}
            </div>
          </div>
          
          {/* 🔥 Render chart berdasarkan mode */}
          {renderPerformanceChart()}
        </div>

        {/* Class Distribution Pie Chart */}
        <div className={`rounded-xl shadow-sm border p-5 ${
          isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"
        }`}>
          <div className="flex items-center gap-2 mb-4">
            <PieChartIcon className={`w-5 h-5 ${isDarkMode ? "text-purple-400" : "text-purple-600"}`} />
            <h2 className={`text-lg font-semibold ${themeClasses.text}`}>Distribusi Kelas</h2>
          </div>
          {stats.classDistribution.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={stats.classDistribution}
                  dataKey="count"
                  nameKey="class"
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {stats.classDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={customTooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <PieChartIcon className={`w-12 h-12 mb-2 ${isDarkMode ? "text-gray-600" : "text-gray-300"}`} />
              <p className={themeClasses.textMuted}>Belum ada data distribusi</p>
            </div>
          )}
          <div className="mt-4 pt-3 border-t text-center">
            <p className={`text-xs ${themeClasses.textMuted}`}>
              Distribusi hasil prediksi dari seluruh pengujian
            </p>
          </div>
        </div>
      </div>

      {/* Recent Tests Table - DENGAN USERNAME DAN CONFIDENCE */}
      <div className={`rounded-xl shadow-sm border overflow-hidden ${
        isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"
      }`}>
        <div className={`px-5 py-4 border-b ${isDarkMode ? "border-gray-700" : "border-gray-100"}`}>
          <div className="flex items-center gap-2">
            <Activity className={`w-5 h-5 ${isDarkMode ? "text-blue-400" : "text-blue-600"}`} />
            <h2 className={`text-lg font-semibold ${themeClasses.text}`}>Pengujian Terbaru</h2>
            <span className={`text-xs ml-2 ${themeClasses.textMuted}`}>
              (Seluruh user)
            </span>
          </div>
        </div>
        <div className="overflow-x-auto">
          {stats.recentTests.length > 0 ? (
            <table className="w-full">
              <thead className={isDarkMode ? "bg-gray-700" : "bg-gray-50"}>
                <tr>
                  <th className={`px-5 py-3 text-left text-xs font-medium uppercase ${
                    isDarkMode ? "text-gray-300" : "text-gray-500"
                  }`}>Tanggal</th>
                  <th className={`px-5 py-3 text-left text-xs font-medium uppercase ${
                    isDarkMode ? "text-gray-300" : "text-gray-500"
                  }`}>User</th>
                  <th className={`px-5 py-3 text-left text-xs font-medium uppercase ${
                    isDarkMode ? "text-gray-300" : "text-gray-500"
                  }`}>Nama File</th>
                  <th className={`px-5 py-3 text-left text-xs font-medium uppercase ${
                    isDarkMode ? "text-gray-300" : "text-gray-500"
                  }`}>Sampel</th>
                  <th className={`px-5 py-3 text-left text-xs font-medium uppercase ${
                    isDarkMode ? "text-gray-300" : "text-gray-500"
                  }`}>Confidence</th>
                  <th className={`px-5 py-3 text-left text-xs font-medium uppercase ${
                    isDarkMode ? "text-gray-300" : "text-gray-500"
                  }`}>Akurasi</th>
                  <th className={`px-5 py-3 text-left text-xs font-medium uppercase ${
                    isDarkMode ? "text-gray-300" : "text-gray-500"
                  }`}>Macro-F1</th>
                  <th className={`px-5 py-3 text-left text-xs font-medium uppercase ${
                    isDarkMode ? "text-gray-300" : "text-gray-500"
                  }`}>Aksi</th>
                </tr>
              </thead>
              <tbody className={isDarkMode ? "divide-y divide-gray-700" : "divide-y divide-gray-100"}>
                {stats.recentTests.map((test, index) => (
                  <tr key={index} className={`transition-colors ${
                    isDarkMode ? "hover:bg-gray-700" : "hover:bg-gray-50"
                  }`}>
                    <td className={`px-5 py-3 text-sm ${themeClasses.textMuted}`}>{test.date}</td>
                    <td className="px-5 py-3">
                      <span className="flex items-center gap-1.5 text-sm font-medium text-blue-500">
                        <User className="w-3.5 h-3.5" />
                        {test.username || "Unknown"}
                      </span>
                    </td>
                    <td className={`px-5 py-3 text-sm font-medium ${themeClasses.text}`}>{test.filename}</td>
                    <td className={`px-5 py-3 text-sm ${themeClasses.textMuted}`}>{test.samples || test.total_samples}</td>
                    
                    {/* 🔥 Kolom Confidence */}
                    <td className="px-5 py-3">
                      {test.avg_confidence !== null && test.avg_confidence !== undefined ? (
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          (test.avg_confidence || 0) >= 70 
                            ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" 
                            : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                        }`}>
                          {test.avg_confidence}%
                        </span>
                      ) : (
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          isDarkMode ? "bg-gray-700 text-gray-400" : "bg-gray-100 text-gray-500"
                        }`}>
                          N/A
                        </span>
                      )}
                    </td>
                    
                    {/* 🔥 Kolom Akurasi */}
                    <td className="px-5 py-3">
                      {test.accuracy !== null && test.accuracy !== undefined ? (
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          (test.accuracy || 0) >= 75 
                            ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" 
                            : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                        }`}>
                          {test.accuracy}%
                        </span>
                      ) : (
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          isDarkMode ? "bg-gray-700 text-gray-400" : "bg-gray-100 text-gray-500"
                        }`}>
                          N/A
                        </span>
                      )}
                    </td>
                    
                    {/* 🔥 Kolom Macro-F1 */}
                    <td className={`px-5 py-3 text-sm ${themeClasses.textMuted}`}>
                      {test.macro_f1 !== null && test.macro_f1 !== undefined ? `${test.macro_f1}%` : 'N/A'}
                    </td>
                    
                    <td className="px-5 py-3">
                      <Link 
                        to={`/results/${test.id}`} 
                        className={`text-sm font-medium transition-colors ${
                          isDarkMode ? "text-blue-400 hover:text-blue-300" : "text-blue-600 hover:text-blue-800"
                        }`}
                      >
                        Lihat Detail →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <FileText className={`w-12 h-12 mb-3 ${isDarkMode ? "text-gray-600" : "text-gray-300"}`} />
              <p className={themeClasses.textMuted}>Belum ada pengujian</p>
              <Link 
                to="/upload" 
                className={`mt-3 text-sm font-medium inline-flex items-center gap-1 ${
                  isDarkMode ? "text-blue-400 hover:text-blue-300" : "text-blue-600 hover:text-blue-800"
                }`}
              >
                Upload CSV untuk memulai <Upload className="w-3 h-3" />
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="text-center py-4">
        <p className={`text-xs ${themeClasses.textMuted}`}>
          &copy; 2026 Malware Detection System • Barlow Twins • CSSL • Redundancy Reduction • Admin Dashboard
        </p>
      </div>
    </div>
  );
}