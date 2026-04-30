import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext(null);

const DEFAULTS = {
  mode:     'dark',
  accent:   '#7c6af7',
  fontSize: 15,
  font:     "'DM Sans', sans-serif",
  chatBg:   '#0f0f13',
  bubble:   '#3d3680',
};

export function ThemeProvider({ children }) {
  const [settings, setSettings] = useState(() => {
    try {
      const saved = localStorage.getItem('acad_theme');
      return saved ? { ...DEFAULTS, ...JSON.parse(saved) } : DEFAULTS;
    } catch { return DEFAULTS; }
  });

  const apply = (next) => {
    const root = document.documentElement;
    root.setAttribute('data-theme', next.mode === 'light' ? 'light' : '');
    root.style.setProperty('--accent', next.accent);
    // Slightly lighter accent2
    const hex = next.accent.slice(1);
    const r = Math.min(255, parseInt(hex.slice(0,2),16)+30);
    const g = Math.min(255, parseInt(hex.slice(2,4),16)+30);
    const b = Math.min(255, parseInt(hex.slice(4,6),16)+30);
    root.style.setProperty('--accent2', `rgb(${r},${g},${b})`);
    root.style.setProperty('--font-size', next.fontSize + 'px');
    root.style.setProperty('--font', next.font);
    document.body.style.fontFamily = next.font;
  };

  useEffect(() => {
    apply(settings);
    localStorage.setItem('acad_theme', JSON.stringify(settings));
  }, [settings]);

  const update = (patch) => setSettings(prev => ({ ...prev, ...patch }));
  const toggleMode = () => update({ mode: settings.mode === 'dark' ? 'light' : 'dark' });

  return (
    <ThemeContext.Provider value={{ settings, update, toggleMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
