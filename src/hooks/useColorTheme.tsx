import React, { ReactNode, useContext, useEffect, useState } from 'react';
import useBrowserStorage from './useBrowserStorage';

// This has been copy pasted with slight mdifications from RevokeCash/revoke.cash

export type Theme = 'system' | 'light' | 'dark';

interface ColorThemeContext {
  darkMode: boolean;
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

interface Props {
  children: ReactNode;
}

const ColorThemeContext = React.createContext<ColorThemeContext>({} as ColorThemeContext);

export const ColorThemeProvider = ({ children }: Props) => {
  const [theme, setTheme] = useBrowserStorage<Theme>('sync', 'theme', 'system');
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    if (theme === 'system') {
      setDarkMode(typeof window === 'undefined' ? false : window.matchMedia('(prefers-color-scheme: dark)').matches);
    } else {
      setDarkMode(theme === 'dark');
    }
  }, [theme]);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  return <ColorThemeContext.Provider value={{ darkMode, theme, setTheme }}>{children}</ColorThemeContext.Provider>;
};

export const useColorTheme = () => useContext(ColorThemeContext);
