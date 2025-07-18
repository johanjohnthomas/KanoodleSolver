"use client";

import React, { createContext, useState, useContext } from "react";
import { Theme } from "@/lib/types";

const defaultTheme: Theme = {
  boardBg: "bg-gray-200",
  emptyCellBg: "bg-gray-300",
  pieceColors: {
    A: "bg-red-500",
    B: "bg-blue-500",
    C: "bg-green-500",
    D: "bg-yellow-500",
    E: "bg-purple-500",
    F: "bg-orange-500",
    G: "bg-pink-500",
    H: "bg-indigo-500",
    I: "bg-teal-500",
    J: "bg-lime-500",
    K: "bg-cyan-500",
    L: "bg-amber-500",
  },
};

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: defaultTheme,
  setTheme: () => {},
});

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [theme, setTheme] = useState<Theme>(defaultTheme);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
