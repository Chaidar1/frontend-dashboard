import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Upload, FileCheck, AlertCircle, Loader2 } from "lucide-react";
import { toast } from "react-toastify";
import api from "../services/api";
import { useAppTheme } from "../hooks/useTheme";

export default function UploadPage() {
  const { isDarkMode, themeClasses } = useAppTheme();
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const droppedFile = e.dataTransfer.files[0];
    console.log("File dropped:", droppedFile);
    
    // Cek berdasarkan ekstensi file
    if (droppedFile && droppedFile.name.toLowerCase().endsWith('.csv')) {
      setFile(droppedFile);
      toast.info(`File "${droppedFile.name}" siap diupload`);
    } else {
      toast.error("Harap unggah file dengan ekstensi .csv");
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    console.log("File selected:", selectedFile);
    console.log("File name:", selectedFile?.name);
    console.log("File type:", selectedFile?.type);
    
    // Cek berdasarkan ekstensi file
    if (selectedFile && selectedFile.name.toLowerCase().endsWith('.csv')) {
      setFile(selectedFile);
      toast.info(`File "${selectedFile.name}" siap diupload`);
    } else {
      toast.error("Harap unggah file dengan ekstensi .csv");
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error("Pilih file CSV terlebih dahulu");
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      console.log("Uploading file:", file.name);
      console.log("File size:", file.size);
      
      const response = await api.post("/predict/upload", formData, {
        headers: { 
          "Content-Type": "multipart/form-data",
        },
        timeout: 30000,
      });
      
      console.log("Response:", response.data);
      toast.success("File berhasil diproses!");
      navigate(`/results/${response.data.test_id}`);
    } catch (error) {
      console.error("Upload error:", error);
      console.error("Error response:", error.response);
      
      if (error.response?.data?.detail) {
        toast.error(error.response.data.detail);
      } else if (error.code === "ECONNABORTED") {
        toast.error("Request timeout, silakan coba lagi");
      } else {
        toast.error("Gagal memproses file");
      }
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className={`text-2xl font-bold ${themeClasses.text}`}>Upload File CSV</h1>
        <p className={`mt-1 ${themeClasses.textMuted}`}>
          Unggah file CSV berisi data lalu lintas jaringan untuk diklasifikasikan
        </p>
      </div>

      <div className={`rounded-xl shadow-sm border p-6 ${isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"}`}>
        {/* Format Info */}
        <div className={`mb-6 p-4 rounded-lg ${isDarkMode ? "bg-blue-900/30 border border-blue-800" : "bg-blue-50"}`}>
          <div className={`flex items-center gap-2 mb-2 ${isDarkMode ? "text-blue-300" : "text-blue-700"}`}>
            <FileCheck className="w-5 h-5" />
            <span className="font-medium">Format File CSV yang Diperlukan</span>
          </div>
          <p className={`text-sm ${isDarkMode ? "text-blue-400" : "text-blue-600"}`}>
            File CSV harus memiliki kolom: <code className={`px-1 rounded ${isDarkMode ? "bg-gray-700 text-blue-300" : "bg-blue-100 text-blue-700"}`}>src_ip</code>, 
            <code className={`px-1 rounded ${isDarkMode ? "bg-gray-700 text-blue-300" : "bg-blue-100 text-blue-700"}`}>dst_ip</code>, 
            <code className={`px-1 rounded ${isDarkMode ? "bg-gray-700 text-blue-300" : "bg-blue-100 text-blue-700"}`}>dst_port</code>, 
            <code className={`px-1 rounded ${isDarkMode ? "bg-gray-700 text-blue-300" : "bg-blue-100 text-blue-700"}`}>protocol</code>, 
            <code className={`px-1 rounded ${isDarkMode ? "bg-gray-700 text-blue-300" : "bg-blue-100 text-blue-700"}`}>count</code>
          </p>
        </div>

        {/* Drop Zone */}
        <div
          className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
            dragActive
              ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
              : isDarkMode ? "border-gray-600 hover:border-gray-500" : "border-gray-300 hover:border-gray-400"
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <Upload className={`w-12 h-12 mx-auto mb-4 ${isDarkMode ? "text-gray-500" : "text-gray-400"}`} />
          <p className={`mb-2 ${themeClasses.text}`}>
            {file ? file.name : "Drag & drop file CSV di sini"}
          </p>
          <p className={`text-sm mb-4 ${themeClasses.textMuted}`}>atau</p>
          <label className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer transition-colors">
            Pilih File
            <input
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>
        </div>

        {/* File Info */}
        {file && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mt-4 p-3 rounded-lg flex items-center justify-between ${isDarkMode ? "bg-green-900/30 border border-green-800" : "bg-green-50"}`}
          >
            <div className="flex items-center gap-2">
              <FileCheck className={`w-5 h-5 ${isDarkMode ? "text-green-400" : "text-green-600"}`} />
              <span className={isDarkMode ? "text-green-300" : "text-green-700"}>{file.name}</span>
              <span className={`text-sm ${isDarkMode ? "text-green-400" : "text-green-500"}`}>
                ({(file.size / 1024).toFixed(2)} KB)
              </span>
            </div>
            <button
              onClick={() => setFile(null)}
              className="text-sm text-red-500 hover:text-red-700"
            >
              Hapus
            </button>
          </motion.div>
        )}

        {/* Warning */}
        <div className={`mt-6 p-3 rounded-lg flex items-start gap-2 ${isDarkMode ? "bg-yellow-900/30 border border-yellow-800" : "bg-yellow-50"}`}>
          <AlertCircle className={`w-5 h-5 flex-shrink-0 mt-0.5 ${isDarkMode ? "text-yellow-400" : "text-yellow-600"}`} />
          <p className={`text-sm ${isDarkMode ? "text-yellow-300" : "text-yellow-700"}`}>
            Pastikan file CSV memiliki format yang benar. Sistem akan melakukan validasi
            dan preprocessing secara otomatis sebelum klasifikasi.
          </p>
        </div>

        {/* Upload Button */}
        <button
          onClick={handleUpload}
          disabled={!file || uploading}
          className={`mt-6 w-full py-3 rounded-lg font-medium transition-all ${
            !file || uploading
              ? "bg-gray-300 dark:bg-gray-700 cursor-not-allowed text-gray-500 dark:text-gray-400"
              : "bg-blue-600 hover:bg-blue-700 text-white"
          }`}
        >
          {uploading ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin" />
              Memproses...
            </span>
          ) : (
            "Upload dan Klasifikasikan"
          )}
        </button>
      </div>
    </div>
  );
}