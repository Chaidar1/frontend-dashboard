// src/pages/Results.jsx
import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import {
  Download,
  ArrowLeft,
  Activity,
  BarChart3,
  TrendingUp,
  PieChart,
  Table,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Brain,
  FileText,
  CheckCircle,
  XCircle,
  Eye,
  EyeOff
} from "lucide-react";
import {
  ResponsiveContainer,
  PieChart as RePieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from "recharts";
import api from "../services/api";
import { useAppTheme } from "../hooks/useTheme";

const COLORS_LIGHT = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#EC4899", "#14B8A6", "#F97316", "#06B6D4", "#84CC16"];
const COLORS_DARK = ["#60A5FA", "#34D399", "#FBBF24", "#F87171", "#A78BFA", "#F472B6", "#2DD4BF", "#FB923C", "#22D3EE", "#A3E635"];

const DEFAULT_CLASSES = ['Backdoor', 'Benign', 'Buffer Overflow', 'DoS attacks', 'Exploits', 'Generic', 'Malware traffic', 'Trojan', 'Unknown', 'Web threats'];

export default function Results() {
  const { isDarkMode, themeClasses } = useAppTheme();
  const { id } = useParams();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage] = useState(50);
  
  // State untuk toggle tampilan data asli
  const [showRawData, setShowRawData] = useState(false);

  const COLORS = isDarkMode ? COLORS_DARK : COLORS_LIGHT;

  useEffect(() => {
    fetchResult();
  }, [id]);

  const fetchResult = async () => {
    try {
      console.log("🔍 Fetching result for ID:", id);
      const response = await api.get(`/predict/result/${id}`);
      console.log("📊 Response data:", response.data);
      
      const data = response.data;
      
      const metrics = data.metrics || { accuracy: 0, macro_f1: 0, precision: 0, recall: 0 };
      
      let classF1Scores = data.class_f1_scores || [];
      if (classF1Scores.length === 0 && data.class_distribution) {
        classF1Scores = DEFAULT_CLASSES.map(cls => ({
          class: cls,
          f1_score: data.class_distribution[cls] ? 1.0 : 0.0
        }));
      }
      
      let confusionMatrix = data.confusion_matrix || [];
      if (confusionMatrix.length === 0 && data.class_distribution) {
        confusionMatrix = DEFAULT_CLASSES.map(cls => 
          DEFAULT_CLASSES.map(() => 0)
        );
        DEFAULT_CLASSES.forEach((cls, idx) => {
          if (data.class_distribution[cls]) {
            confusionMatrix[idx][idx] = data.class_distribution[cls];
          }
        });
      }
      
      console.log("📊 all_predictions:", data.all_predictions?.length || 0);
      console.log("📊 original_data:", data.original_data?.length || 0, "rows");
      console.log("📊 feature_columns:", data.feature_columns?.length || 0, "columns");
      
      setResult({
        ...data,
        metrics: metrics,
        class_f1_scores: classF1Scores,
        confusion_matrix: confusionMatrix,
        classes: data.classes || DEFAULT_CLASSES,
        all_predictions: data.all_predictions || [],
        original_data: data.original_data || [],
        feature_columns: data.feature_columns || []
      });
    } catch (error) {
      console.error("Error fetching result:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    try {
      const response = await api.get(`/predict/download/${id}`, {
        responseType: "blob"
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `prediction_result_${id}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Download error:", error);
    }
  };

  const calculateAvgConfidence = (predictions) => {
    if (!predictions || predictions.length === 0) return 0;
    let total = 0;
    let count = 0;
    predictions.forEach(pred => {
      let conf = pred.confidence_score || 0;
      if (conf > 1) {
        total += conf;
      } else {
        total += conf * 100;
      }
      count++;
    });
    return (total / count).toFixed(1);
  };

  // Fungsi untuk mendapatkan warna berdasarkan kelas prediksi
  const getClassColor = (predictedClass) => {
    const colors = {
      'Benign': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      'Generic': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      'Unknown': 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
      'Backdoor': 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
      'Exploits': 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
      'Trojan': 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
      'Malware traffic': 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400',
      'Web threats': 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
      'DoS attacks': 'bg-red-200 text-red-800 dark:bg-red-800/30 dark:text-red-300',
      'Buffer Overflow': 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
    };
    return colors[predictedClass] || 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
  };

  // Gabungkan data asli dengan prediksi
  const getCombinedData = () => {
    if (!result?.original_data || !result?.all_predictions) {
      return [];
    }
    
    return result.original_data.map((row, index) => {
      const prediction = result.all_predictions[index] || {};
      return {
        ...row,
        row_index: index + 1,
        predicted_class: prediction.predicted_class || 'Unknown',
        confidence_score: prediction.confidence_score || 0,
        is_correct: prediction.is_correct || false,
        actual_class: prediction.actual_class || null
      };
    });
  };

  const customTooltipStyle = {
    backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
    border: `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`,
    borderRadius: '8px',
    padding: '8px 12px',
    color: isDarkMode ? '#f3f4f6' : '#1f2937'
  };

  let allPredictions = result?.all_predictions || [];
  
  if (allPredictions.length === 0 && result?.sample_predictions) {
    console.log("⚠️ all_predictions kosong, menggunakan sample_predictions");
    allPredictions = result.sample_predictions.map((p, i) => ({
      row_index: i,
      actual_class: null,
      predicted_class: p.prediction,
      confidence_score: p.confidence / 100,
      is_correct: false
    }));
  }

  // Data untuk tabel
  const combinedData = getCombinedData();
  const featureColumns = result?.feature_columns || [];
  const hasOriginalData = result?.original_data && result.original_data.length > 0;
  
  // Gunakan combinedData jika ada, otherwise gunakan allPredictions
  const displayData = hasOriginalData ? combinedData : allPredictions;
  const totalDataPages = Math.ceil(displayData.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = Math.min(startIndex + rowsPerPage, displayData.length);
  const currentData = displayData.slice(startIndex, endIndex);

  const totalPages = Math.ceil(allPredictions.length / rowsPerPage);
  const predStartIndex = (currentPage - 1) * rowsPerPage;
  const predEndIndex = Math.min(predStartIndex + rowsPerPage, allPredictions.length);
  const currentPredictions = allPredictions.slice(predStartIndex, predEndIndex);

  const goToPage = (page) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  // Toggle detail data dengan toast info jika tidak tersedia
  const toggleDetailData = () => {
    if (hasOriginalData) {
      setShowRawData(!showRawData);
    } else {
      toast.info("Data detail tidak tersedia untuk pengujian ini. Upload ulang file CSV untuk menyimpan data lengkap.");
    }
  };

  if (loading) {
    return (
      <div className={`flex items-center justify-center h-96 ${themeClasses.bg}`}>
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!result) {
    return (
      <div className="text-center py-12">
        <p className={themeClasses.textMuted}>Hasil tidak ditemukan</p>
        <Link to="/upload" className={`mt-2 inline-block ${isDarkMode ? "text-blue-400 hover:text-blue-300" : "text-blue-600 hover:text-blue-800"}`}>
          Kembali ke Upload
        </Link>
      </div>
    );
  }

  const hasLabel = result.metrics?.has_label || false;
  const accuracy = result.metrics?.accuracy || 0;
  const macroF1 = result.metrics?.macro_f1 || 0;
  const precision = result.metrics?.precision || 0;
  const recall = result.metrics?.recall || 0;
  const avgConfidence = calculateAvgConfidence(allPredictions);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <Link to="/dashboard" className={`p-2 rounded-lg transition-colors ${isDarkMode ? "hover:bg-gray-700" : "hover:bg-gray-100"}`}>
            <ArrowLeft className={`w-5 h-5 ${isDarkMode ? "text-gray-400" : "text-gray-600"}`} />
          </Link>
          <div>
            <h1 className={`text-2xl font-bold ${themeClasses.text}`}>Hasil Klasifikasi</h1>
            <p className={`mt-1 ${themeClasses.textMuted}`}>
              {result.filename} • {result.total_samples} sampel • {result.date}
            </p>
          </div>
        </div>
        <button
          onClick={handleDownload}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <Download className="w-4 h-4" />
          Download CSV
        </button>
      </div>

      {/* Metrics Cards */}
      {hasLabel ? (
        // Mode Evaluasi (Ada Label) - 5 Card dalam 1 baris dengan ukuran lebih kecil
        <div className="grid grid-cols-5 gap-3">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`rounded-xl p-3 shadow-sm border ${isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"}`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-xs ${themeClasses.textMuted}`}>Akurasi</p>
                <p className={`text-lg font-bold ${themeClasses.text}`}>{accuracy}%</p>
              </div>
              <Activity className="w-6 h-6 text-blue-500" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className={`rounded-xl p-3 shadow-sm border ${isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"}`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-xs ${themeClasses.textMuted}`}>Macro-F1</p>
                <p className={`text-lg font-bold ${themeClasses.text}`}>{macroF1}%</p>
              </div>
              <TrendingUp className="w-6 h-6 text-green-500" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className={`rounded-xl p-3 shadow-sm border ${isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"}`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-xs ${themeClasses.textMuted}`}>Precision</p>
                <p className={`text-lg font-bold ${themeClasses.text}`}>{precision}%</p>
              </div>
              <BarChart3 className="w-6 h-6 text-purple-500" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className={`rounded-xl p-3 shadow-sm border ${isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"}`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-xs ${themeClasses.textMuted}`}>Recall</p>
                <p className={`text-lg font-bold ${themeClasses.text}`}>{recall}%</p>
              </div>
              <PieChart className="w-6 h-6 text-orange-500" />
            </div>
          </motion.div>

          {/* Card Mode: Evaluasi */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className={`rounded-xl p-3 shadow-sm border ${isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"}`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-xs ${themeClasses.textMuted}`}>Mode</p>
                <p className={`text-lg font-bold ${themeClasses.text}`}>Evaluasi</p>
              </div>
              <CheckCircle className="w-6 h-6 text-green-500" />
            </div>
          </motion.div>
        </div>
      ) : (
        // Mode Prediksi (Tanpa Label) - 4 Card ukuran NORMAL (seperti semula)
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`rounded-xl p-4 shadow-sm border ${isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"}`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${themeClasses.textMuted}`}>Total Sampel</p>
                <p className={`text-2xl font-bold ${themeClasses.text}`}>{result.total_samples}</p>
              </div>
              <FileText className="w-8 h-8 text-blue-500" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className={`rounded-xl p-4 shadow-sm border ${isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"}`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${themeClasses.textMuted}`}>Confidence Rata-rata</p>
                <p className={`text-2xl font-bold ${themeClasses.text}`}>{avgConfidence}%</p>
              </div>
              <Activity className="w-8 h-8 text-green-500" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className={`rounded-xl p-4 shadow-sm border ${isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"}`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${themeClasses.textMuted}`}>Kelas Terdeteksi</p>
                <p className={`text-2xl font-bold ${themeClasses.text}`}>
                  {Object.keys(result.class_distribution || {}).length}
                </p>
              </div>
              <PieChart className="w-8 h-8 text-purple-500" />
            </div>
          </motion.div>

          {/* Card Mode: Prediksi */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className={`rounded-xl p-4 shadow-sm border ${isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"}`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${themeClasses.textMuted}`}>Mode</p>
                <p className={`text-2xl font-bold ${themeClasses.text}`}>Prediksi</p>
              </div>
              <Brain className="w-8 h-8 text-orange-500" />
            </div>
          </motion.div>
        </div>
      )}

      {/* F1-Score per Class Chart - Hanya tampil jika ada label */}
      {hasLabel && (
        <div className={`rounded-xl shadow-sm border p-6 ${isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"}`}>
          <h2 className={`text-lg font-semibold mb-4 ${themeClasses.text}`}>F1-Score per Kelas Malware</h2>
          {result.class_f1_scores && result.class_f1_scores.length > 0 ? (
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={result.class_f1_scores}>
                <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? "#374151" : "#e5e7eb"} />
                <XAxis dataKey="class" angle={-45} textAnchor="end" height={80} tick={{ fill: isDarkMode ? "#9ca3af" : "#6b7280", fontSize: 11 }} />
                <YAxis domain={[0, 1]} tickFormatter={(v) => `${v * 100}%`} tick={{ fill: isDarkMode ? "#9ca3af" : "#6b7280" }} />
                <Tooltip contentStyle={customTooltipStyle} formatter={(value) => `${(value * 100).toFixed(2)}%`} />
                <Bar dataKey="f1_score" fill={isDarkMode ? "#60A5FA" : "#3B82F6"} radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center py-8">
              <p className={themeClasses.textMuted}>Belum ada data F1-Score</p>
            </div>
          )}
        </div>
      )}

      {/* Confusion Matrix - Hanya tampil jika ada label */}
      {hasLabel && (
        <div className={`rounded-xl shadow-sm border p-6 ${isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"}`}>
          <h2 className={`text-lg font-semibold mb-4 ${themeClasses.text}`}>Confusion Matrix</h2>
          <div className="overflow-x-auto">
            <div className="inline-block min-w-full">
              <table className="min-w-full border-collapse">
                <thead>
                  <tr>
                    <th className={`border p-2 ${isDarkMode ? "bg-gray-700 text-gray-300" : "bg-gray-50 text-gray-700"}`}></th>
                    {(result.classes || DEFAULT_CLASSES).map((cls, i) => (
                      <th key={i} className={`border p-2 text-sm font-medium ${isDarkMode ? "bg-gray-700 text-gray-300" : "bg-gray-50 text-gray-700"}`}>
                        {cls.length > 15 ? cls.substring(0, 12) + "..." : cls}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {(result.confusion_matrix || []).map((row, i) => (
                    <tr key={i}>
                      <th className={`border p-2 text-sm font-medium ${isDarkMode ? "bg-gray-700 text-gray-300" : "bg-gray-50 text-gray-700"}`}>
                        {result.classes?.[i]?.length > 15 ? result.classes[i].substring(0, 12) + "..." : result.classes?.[i] || DEFAULT_CLASSES[i]}
                      </th>
                      {row.map((value, j) => (
                        <td
                          key={j}
                          className={`border p-2 text-center text-sm ${
                            i === j ? (isDarkMode ? "bg-green-900/50 text-green-300" : "bg-green-100 text-green-800") : (isDarkMode ? "text-gray-300" : "text-gray-800")
                          }`}
                        >
                          {value}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Class Distribution & Ringkasan Prediksi */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Distribusi Kelas (Pie Chart) */}
        <div className={`rounded-xl shadow-sm border p-6 ${isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"}`}>
          <h2 className={`text-lg font-semibold mb-4 ${themeClasses.text}`}>Distribusi Kelas (Prediksi)</h2>
          {result.class_distribution && Object.keys(result.class_distribution).length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <RePieChart>
                <Pie
                  data={Object.entries(result.class_distribution).map(([name, value]) => ({ name, value }))}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  labelLine={false}
                >
                  {Object.entries(result.class_distribution).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={customTooltipStyle} />
              </RePieChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center py-8">
              <p className={themeClasses.textMuted}>Belum ada data distribusi</p>
            </div>
          )}
        </div>

        {/* Ringkasan Prediksi */}
        <div className={`rounded-xl shadow-sm border p-6 ${isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"}`}>
          <h2 className={`text-lg font-semibold mb-4 ${themeClasses.text}`}>Ringkasan Prediksi</h2>
          {result.class_distribution && Object.keys(result.class_distribution).length > 0 ? (
            <div className="space-y-3">
              {Object.entries(result.class_distribution).map(([className, count], i) => {
                const percentage = ((count / result.total_samples) * 100).toFixed(1);
                return (
                  <div key={i} className="flex items-center justify-between py-1.5">
                    <div className="flex items-center gap-3 min-w-[140px]">
                      <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }}></div>
                      <span className={`text-sm font-medium ${themeClasses.text}`}>{className}</span>
                    </div>
                    <div className="flex-1 flex items-center gap-4">
                      <div className={`flex-1 h-2 rounded-full overflow-hidden ${isDarkMode ? "bg-gray-700" : "bg-gray-100"}`}>
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${percentage}%`,
                            backgroundColor: COLORS[i % COLORS.length]
                          }}
                        ></div>
                      </div>
                      <div className="flex items-center gap-1 min-w-[100px] justify-end">
                        <span className={`text-sm font-medium ${themeClasses.text}`}>{count}</span>
                        <span className={`text-sm ${themeClasses.textMuted}`}>({percentage}%)</span>
                      </div>
                    </div>
                  </div>
                );
              })}
              
              {/* Informasi Tambahan - Confidence & Total Sampel */}
              <div className={`mt-4 pt-4 border-t ${isDarkMode ? "border-gray-700" : "border-gray-200"}`}>
                <div className="grid grid-cols-2 gap-4">
                  <div className={`p-3 rounded-lg ${isDarkMode ? "bg-gray-700/50" : "bg-gray-50"}`}>
                    <div className="flex items-center gap-2">
                      <Activity className={`w-4 h-4 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`} />
                      <span className={`text-xs ${themeClasses.textMuted}`}>Confidence Rata-rata</span>
                    </div>
                    <p className={`text-lg font-bold mt-1 ${themeClasses.text}`}>{avgConfidence}%</p>
                  </div>
                  <div className={`p-3 rounded-lg ${isDarkMode ? "bg-gray-700/50" : "bg-gray-50"}`}>
                    <div className="flex items-center gap-2">
                      <FileText className={`w-4 h-4 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`} />
                      <span className={`text-xs ${themeClasses.textMuted}`}>Total Sampel</span>
                    </div>
                    <p className={`text-lg font-bold mt-1 ${themeClasses.text}`}>{result.total_samples}</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className={themeClasses.textMuted}>Belum ada data ringkasan</p>
            </div>
          )}
        </div>
      </div>

      {/* ALL Predictions Table - Dengan Detail Data */}
      <div className={`rounded-xl shadow-sm border p-6 ${isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"}`}>
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Table className={`w-5 h-5 ${isDarkMode ? "text-blue-400" : "text-blue-600"}`} />
            <h2 className={`text-lg font-semibold ${themeClasses.text}`}>
              Semua Hasil Prediksi
              <span className={`text-sm font-normal ml-2 ${themeClasses.textMuted}`}>
                ({allPredictions.length} baris)
              </span>
            </h2>
          </div>
          <div className="flex items-center gap-3">
            {/* Button Detail Data - Selalu Tampil */}
            <button
              onClick={toggleDetailData}
              className={`px-3 py-1.5 text-sm rounded-lg transition-colors flex items-center gap-2 ${
                showRawData && hasOriginalData
                  ? isDarkMode ? "bg-blue-600 text-white" : "bg-blue-600 text-white"
                  : isDarkMode ? "bg-gray-700 text-gray-300 hover:bg-gray-600" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              } ${!hasOriginalData ? "opacity-60" : ""}`}
              title={!hasOriginalData ? "Data detail tidak tersedia. Upload ulang file CSV untuk menyimpan data lengkap." : ""}
            >
              {showRawData && hasOriginalData ? (
                <>
                  <EyeOff className="w-4 h-4" />
                  Sembunyikan Detail
                </>
              ) : (
                <>
                  <Eye className="w-4 h-4" />
                  Detail Data
                </>
              )}
            </button>
            <span className={`text-sm ${themeClasses.textMuted}`}>
              Menampilkan {startIndex + 1} - {endIndex} dari {allPredictions.length}
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          {showRawData && hasOriginalData ? (
            // Tabel Data Asli dengan Warna
            <table className="w-full">
              <thead className={isDarkMode ? "bg-gray-700" : "bg-gray-50"}>
                <tr>
                  <th className={`px-4 py-3 text-left text-xs font-medium uppercase ${themeClasses.textMuted}`}>#</th>
                  
                  {/* Kolom fitur dari data asli */}
                  {featureColumns.map((col, idx) => (
                    <th key={idx} className={`px-4 py-3 text-left text-xs font-medium uppercase ${themeClasses.textMuted}`}>
                      {col}
                    </th>
                  ))}
                  
                  {/* Kolom prediksi */}
                  <th className={`px-4 py-3 text-left text-xs font-medium uppercase ${themeClasses.textMuted}`}>Prediksi</th>
                  <th className={`px-4 py-3 text-left text-xs font-medium uppercase ${themeClasses.textMuted}`}>Confidence</th>
                  {hasLabel && (
                    <th className={`px-4 py-3 text-left text-xs font-medium uppercase ${themeClasses.textMuted}`}>Status</th>
                  )}
                </tr>
              </thead>
              <tbody className={`divide-y ${isDarkMode ? "divide-gray-700" : "divide-gray-100"}`}>
                {currentData.map((row, idx) => {
                  const globalIndex = startIndex + idx;
                  const rowClass = getClassColor(row.predicted_class);
                  
                  return (
                    <tr 
                      key={globalIndex} 
                      className={`${isDarkMode ? "hover:bg-gray-700/50" : "hover:bg-gray-50"} transition-colors`}
                    >
                      <td className={`px-4 py-2 text-sm ${themeClasses.textMuted}`}>{row.row_index}</td>
                      
                      {/* 🔥 Data asli - setiap kolom */}
                      {featureColumns.map((col, colIdx) => (
                        <td key={colIdx} className={`px-4 py-2 text-sm ${themeClasses.text}`}>
                          {row[col] !== undefined && row[col] !== null ? String(row[col]) : '-'}
                        </td>
                      ))}
                      
                      {/* Kolom Prediksi dengan Warna */}
                      <td className="px-4 py-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${rowClass}`}>
                          {row.predicted_class}
                        </span>
                      </td>
                      
                      {/* Confidence */}
                      <td className="px-4 py-2">
                        <div className="flex items-center gap-2">
                          <div className={`w-16 rounded-full h-1.5 ${isDarkMode ? "bg-gray-700" : "bg-gray-200"}`}>
                            <div
                              className="h-1.5 rounded-full bg-blue-500"
                              style={{ width: `${(row.confidence_score || 0) * 100}%` }}
                            ></div>
                          </div>
                          <span className={`text-xs ${themeClasses.textMuted}`}>
                            {((row.confidence_score || 0) * 100).toFixed(1)}%
                          </span>
                        </div>
                      </td>
                      
                      {/* Status (jika ada label) */}
                      {hasLabel && (
                        <td className="px-4 py-2">
                          {row.is_correct !== undefined && (
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              row.is_correct 
                                ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" 
                                : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                            }`}>
                              {row.is_correct ? "✅ Benar" : "❌ Salah"}
                            </span>
                          )}
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            // Tabel Prediksi Standar
            <table className="w-full">
              <thead className={isDarkMode ? "bg-gray-700" : "bg-gray-50"}>
                <tr>
                  <th className={`px-4 py-3 text-left text-xs font-medium uppercase ${themeClasses.textMuted}`}>#</th>
                  <th className={`px-4 py-3 text-left text-xs font-medium uppercase ${themeClasses.textMuted}`}>Kelas Aktual</th>
                  <th className={`px-4 py-3 text-left text-xs font-medium uppercase ${themeClasses.textMuted}`}>Prediksi</th>
                  <th className={`px-4 py-3 text-left text-xs font-medium uppercase ${themeClasses.textMuted}`}>Confidence</th>
                  <th className={`px-4 py-3 text-left text-xs font-medium uppercase ${themeClasses.textMuted}`}>Status</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isDarkMode ? "divide-gray-700" : "divide-gray-100"}`}>
                {currentPredictions.length > 0 ? (
                  currentPredictions.map((pred, idx) => {
                    const globalIndex = startIndex + idx;
                    
                    let confidenceValue = pred.confidence_score || 0;
                    let confidencePercent = 0;
                    
                    if (confidenceValue > 1) {
                      confidencePercent = confidenceValue.toFixed(1);
                    } else {
                      confidencePercent = (confidenceValue * 100).toFixed(1);
                    }
                    
                    const isCorrect = pred.is_correct;
                    
                    return (
                      <tr key={globalIndex} className={isDarkMode ? "hover:bg-gray-700" : "hover:bg-gray-50"}>
                        <td className={`px-4 py-3 text-sm ${themeClasses.textMuted}`}>{globalIndex + 1}</td>
                        <td className={`px-4 py-3 text-sm ${themeClasses.text}`}>
                          {pred.actual_class || "-"}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            pred.predicted_class === "Benign" 
                              ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" 
                              : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                          }`}>
                            {pred.predicted_class}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className={`w-20 rounded-full h-2 ${isDarkMode ? "bg-gray-700" : "bg-gray-200"}`}>
                              <div
                                className={`h-2 rounded-full ${
                                  confidencePercent >= 70 ? "bg-green-500" : confidencePercent >= 50 ? "bg-yellow-500" : "bg-red-500"
                                }`}
                                style={{ width: `${confidencePercent}%` }}
                              ></div>
                            </div>
                            <span className={`text-sm ${themeClasses.textMuted}`}>{confidencePercent}%</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          {hasLabel ? (
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              isCorrect 
                                ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" 
                                : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                            }`}>
                              {isCorrect ? "✅ Benar" : "❌ Salah"}
                            </span>
                          ) : (
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              isDarkMode ? "bg-gray-700 text-gray-400" : "bg-gray-100 text-gray-500"
                            }`}>
                              ⚪ Tidak Ada Label
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={5} className={`text-center py-8 ${themeClasses.textMuted}`}>
                      Tidak ada data prediksi
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-700">
            <div className={`text-sm ${themeClasses.textMuted}`}>
              Halaman {currentPage} dari {totalPages}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                className={`p-2 rounded-lg transition-colors ${
                  currentPage === 1
                    ? "opacity-50 cursor-not-allowed"
                    : isDarkMode ? "hover:bg-gray-700" : "hover:bg-gray-100"
                }`}
              >
                <ChevronLeft className={`w-5 h-5 ${themeClasses.text}`} />
              </button>
              {[...Array(Math.min(5, totalPages))].map((_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                return (
                  <button
                    key={i}
                    onClick={() => goToPage(pageNum)}
                    className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                      pageNum === currentPage
                        ? "bg-blue-600 text-white"
                        : isDarkMode ? "hover:bg-gray-700 text-gray-300" : "hover:bg-gray-100 text-gray-700"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              <button
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`p-2 rounded-lg transition-colors ${
                  currentPage === totalPages
                    ? "opacity-50 cursor-not-allowed"
                    : isDarkMode ? "hover:bg-gray-700" : "hover:bg-gray-100"
                }`}
              >
                <ChevronRight className={`w-5 h-5 ${themeClasses.text}`} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}