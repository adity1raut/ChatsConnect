import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  useSyncExternalStore,
} from "react";

const ThemeContext = createContext();

const THEME_KEY = "themeMode";
const DARK_QUERY = "(prefers-color-scheme: dark)";

const readStoredMode = () => {
  try {
    return localStorage.getItem(THEME_KEY) || "system";
  } catch {
    return "system";
  }
};

// OS dark-mode preference as an external store, so it is correct on first render
const subscribeToSystemTheme = (onChange) => {
  const media = window.matchMedia(DARK_QUERY);
  media.addEventListener("change", onChange);
  return () => media.removeEventListener("change", onChange);
};
const getSystemPrefersDark = () => window.matchMedia(DARK_QUERY).matches;

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [themeMode, setThemeModeState] = useState(readStoredMode);
  const systemPrefersDark = useSyncExternalStore(
    subscribeToSystemTheme,
    getSystemPrefersDark,
  );
  const isDark =
    themeMode === "dark" || (themeMode === "system" && systemPrefersDark);

  // Drive Tailwind's `dark:` variant and native form controls from one place
  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", isDark);
    root.style.colorScheme = isDark ? "dark" : "light";
  }, [isDark]);

  const setThemeMode = useCallback((mode) => {
    try {
      localStorage.setItem(THEME_KEY, mode);
    } catch {
      // Storage unavailable (private mode) — theme still applies for this session
    }
    setThemeModeState(mode);
  }, []);

  const value = {
    themeMode,
    setThemeMode,
    isDark,
  };

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};
