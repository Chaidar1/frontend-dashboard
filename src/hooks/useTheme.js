// src/hooks/useTheme.js
import { useTheme } from '../context/ThemeContext';

export const useAppTheme = () => {
  const { isDarkMode, toggleTheme, themeClasses } = useTheme();
  
  return {
    isDarkMode,
    toggleTheme,
    themeClasses
  };
};