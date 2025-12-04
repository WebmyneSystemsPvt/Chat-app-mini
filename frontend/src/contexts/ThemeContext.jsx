import { createContext, useContext, useState, useEffect, useCallback } from "react";

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const getSystemTheme = useCallback(
    () => (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"),
    []
  );

  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem("theme");
    return saved === "system" ? getSystemTheme() : saved || "light";
  });

  const [isSystemTheme, setIsSystemTheme] = useState(
    localStorage.getItem("theme") === "system"
  );

  const applyTheme = useCallback((mode) => {
    document.documentElement.setAttribute('data-theme', mode);
    document.documentElement.classList.toggle("dark", mode === "dark");
    setTheme(mode);
  }, []);

  useEffect(() => {
    if (!isSystemTheme) return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = (e) => applyTheme(e.matches ? "dark" : "light");
    mediaQuery.addEventListener("change", handler);

    return () => mediaQuery.removeEventListener("change", handler);
  }, [isSystemTheme, applyTheme]);

  useEffect(() => {
    applyTheme(theme);
  }, [theme, applyTheme]);

  const setThemePreference = (preference) => {
    if (preference === "system") {
      setIsSystemTheme(true);
      localStorage.setItem("theme", "system");
      applyTheme(getSystemTheme());
    } else {
      setIsSystemTheme(false);
      localStorage.setItem("theme", preference);
      applyTheme(preference);
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, isSystemTheme, setThemePreference }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within a ThemeProvider");
  return ctx;
};
