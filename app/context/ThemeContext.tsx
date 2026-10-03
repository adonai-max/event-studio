"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

export type Theme = "system" | "light" | "dark";

type ThemeContextType = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(
  undefined,
);

const THEME_KEY = "event-studio-theme";

function getSystemTheme(): "light" | "dark" {
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function applyTheme(theme: Theme) {
  const root = document.documentElement;

  const effectiveTheme =
    theme === "system" ? getSystemTheme() : theme;

  root.classList.toggle("dark", effectiveTheme === "dark");
  root.style.colorScheme = effectiveTheme;
}

export function ThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [theme, setThemeState] = useState<Theme>("system");

  useEffect(() => {
    const savedTheme = localStorage.getItem(THEME_KEY);

    const initialTheme: Theme =
      savedTheme === "light" ||
      savedTheme === "dark" ||
      savedTheme === "system"
        ? savedTheme
        : "system";

    setThemeState(initialTheme);
    applyTheme(initialTheme);

    const mediaQuery = window.matchMedia(
      "(prefers-color-scheme: dark)",
    );

    function handleSystemThemeChange() {
      if (initialTheme === "system") {
        applyTheme("system");
      }
    }

    mediaQuery.addEventListener(
      "change",
      handleSystemThemeChange,
    );

    return () => {
      mediaQuery.removeEventListener(
        "change",
        handleSystemThemeChange,
      );
    };
  }, []);

  function setTheme(theme: Theme) {
    setThemeState(theme);
    localStorage.setItem(THEME_KEY, theme);
    applyTheme(theme);
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error(
      "useTheme doit être utilisé à l'intérieur de ThemeProvider.",
    );
  }

  return context;
}
