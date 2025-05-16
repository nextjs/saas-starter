import { AppThemeContext } from "@/src/context/theme-context";
import { useContext } from "react";

export function useTheme() {
  const context = useContext(AppThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
