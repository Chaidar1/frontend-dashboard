import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Search, Eye, Calendar, HardDrive } from "lucide-react";
import api from "../services/api";
import { useAppTheme } from "../hooks/useTheme";

export default function History() {
  const { isDarkMode, themeClasses } = useAppTheme();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const response = await api.get("/history/list");
      setHistory(response.data);
    } catch (error) {
      console.error("Error fetching history:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredHistory = history.filter(item =>
    item.filename.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className={`flex items-center justify-center h-96 ${themeClasses.bg}`}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className={`text-2xl font-bold ${themeClasses.text}`}>Riwayat Pengujian</h1>
        <p className={`mt-1 ${themeClasses.textMuted}`}>Daftar semua pengujian klasifikasi malware yang telah dilakukan</p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${isDarkMode ? "text-gray-500" : "text-gray-400"}`} />
        <input
          type="text"
          placeholder="Cari berdasarkan nama file..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className={`w-full pl-10 pr-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${themeClasses.input} ${themeClasses.border}`}
        />
      </div>

      {/* History List */}
      <div className={`rounded-xl shadow-sm border overflow-hidden ${
        isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"
      }`}>
        {filteredHistory.length === 0 ? (
          <div className="text-center py-12">
            <HardDrive className={`w-12 h-12 mx-auto mb-3 ${isDarkMode ? "text-gray-600" : "text-gray-300"}`} />
            <p className={themeClasses.textMuted}>Belum ada riwayat pengujian</p>
            <Link to="/upload" className={`mt-2 inline-block ${isDarkMode ? "text-blue-400 hover:text-blue-300" : "text-blue-600 hover:text-blue-800"}`}>
              Upload CSV →
            </Link>
          </div>
        ) : (
          <div className={`divide-y ${isDarkMode ? "divide-gray-700" : "divide-gray-100"}`}>
            {filteredHistory.map((item) => (
              <div key={item.id} className={`p-4 transition-colors ${isDarkMode ? "hover:bg-gray-700" : "hover:bg-gray-50"}`}>
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`text-sm flex items-center gap-1 ${themeClasses.textMuted}`}>
                        <Calendar className="w-3 h-3" />
                        {item.date}
                      </span>
                      <span className={`text-sm font-medium ${themeClasses.text}`}>{item.filename}</span>
                    </div>
                    <div className={`flex items-center gap-4 text-sm ${themeClasses.textMuted}`}>
                      <span>{item.samples} sampel</span>
                      <span>Akurasi: {item.accuracy}%</span>
                      <span>Macro-F1: {item.macro_f1}%</span>
                    </div>
                  </div>
                  <Link
                    to={`/results/${item.id}`}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors ${
                      isDarkMode ? "text-blue-400 hover:bg-gray-700" : "text-blue-600 hover:bg-blue-50"
                    }`}
                  >
                    <Eye className="w-4 h-4" />
                    Detail
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}