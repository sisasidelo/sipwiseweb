"use client";
import React, { createContext, useContext, useState, Dispatch, SetStateAction } from "react";
import { ACTIVE_THEME } from "@/config/theme";

export type ThemeName = "default" | "heineken" | "corona" | "blacklabel";

type ThemeContextType = {
  theme: ThemeName;
  setTheme: Dispatch<SetStateAction<ThemeName>>;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<ThemeName>(ACTIVE_THEME);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      <div data-theme={theme} className="min-h-screen bg-bg text-text">
        {children}
      </div>
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used inside ThemeProvider");
  return context;
}
