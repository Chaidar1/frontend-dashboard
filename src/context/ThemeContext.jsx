// src/context/ThemeContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  // Cek localStorage untuk preferensi tema yang tersimpan
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      return savedTheme === 'dark';
    }
    // Cek preferensi sistem
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    // Simpan preferensi ke localStorage
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
    
    // Terapkan class ke html element
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode(prev => !prev);
  };

  // themeClasses 
  const themeClasses = {
    // Background classes
    bg: isDarkMode ? "bg-gray-900" : "bg-gray-50",
    bgPrimary: isDarkMode ? "bg-gray-800" : "bg-white",
    bgSecondary: isDarkMode ? "bg-gray-700" : "bg-gray-100",
    bgCard: isDarkMode ? "bg-gray-800" : "bg-white",
    
    // Text classes
    text: isDarkMode ? "text-white" : "text-gray-900",
    textPrimary: isDarkMode ? "text-white" : "text-gray-900",
    textSecondary: isDarkMode ? "text-gray-300" : "text-gray-600",
    textMuted: isDarkMode ? "text-gray-400" : "text-gray-500",
    
    // Border classes
    border: isDarkMode ? "border-gray-700" : "border-gray-200",
    borderLight: isDarkMode ? "border-gray-600" : "border-gray-300",
    
    // Card classes
    card: isDarkMode ? "bg-gray-800 border-gray-700 text-white" : "bg-white border-gray-200 text-gray-900",
    
    // Input classes
    input: isDarkMode ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400" : "bg-white border-gray-300 text-gray-900 placeholder-gray-500",
    
    // Button classes
    btnPrimary: isDarkMode ? "bg-blue-600 hover:bg-blue-700 text-white" : "bg-blue-600 hover:bg-blue-700 text-white",
    btnSecondary: isDarkMode ? "bg-gray-700 hover:bg-gray-600 text-white" : "bg-gray-200 hover:bg-gray-300 text-gray-900",
    btnDanger: isDarkMode ? "bg-red-600 hover:bg-red-700 text-white" : "bg-red-600 hover:bg-red-700 text-white",
    
    // Table classes
    tableHeader: isDarkMode ? "bg-gray-700 text-white" : "bg-gray-100 text-gray-900",
    tableRow: isDarkMode ? "hover:bg-gray-700" : "hover:bg-gray-50",
    
    // Status colors
    success: isDarkMode ? "text-green-400" : "text-green-600",
    warning: isDarkMode ? "text-yellow-400" : "text-yellow-600",
    error: isDarkMode ? "text-red-400" : "text-red-600",
    info: isDarkMode ? "text-blue-400" : "text-blue-600",
    
    // Chart colors untuk dark mode
    chartGrid: isDarkMode ? "#374151" : "#e5e7eb",
    chartText: isDarkMode ? "#9ca3af" : "#6b7280",
  };

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme, themeClasses }}>
      {children}
    </ThemeContext.Provider>
  );
};