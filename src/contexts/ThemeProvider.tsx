import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

type Theme = 'light' | 'dark' | 'system';
type FontSize = 'small' | 'medium' | 'large';

interface ThemeContextType {
    theme: Theme;
    fontSize: FontSize;
    setTheme: (theme: Theme) => void;
    setFontSize: (size: FontSize) => void;
}

const ThemeContext = createContext<ThemeContextType>({
    theme: 'system',
    fontSize: 'medium',
    setTheme: () => { },
    setFontSize: () => { },
});

export function useTheme() {
    return useContext(ThemeContext);
}

const fontSizeMap: Record<FontSize, string> = {
    small: '14px',
    medium: '16px',
    large: '18px',
};

export function ThemeProvider({ children }: { children: ReactNode }) {
    const [theme, setTheme] = useState<Theme>(() => {
        return (localStorage.getItem('app-theme') as Theme) || 'system';
    });
    const [fontSize, setFontSize] = useState<FontSize>(() => {
        return (localStorage.getItem('app-font-size') as FontSize) || 'medium';
    });

    // Apply theme
    useEffect(() => {
        const root = document.documentElement;

        const applyTheme = (t: Theme) => {
            if (t === 'dark') {
                root.classList.add('dark');
            } else if (t === 'light') {
                root.classList.remove('dark');
            } else {
                // system
                const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                if (prefersDark) {
                    root.classList.add('dark');
                } else {
                    root.classList.remove('dark');
                }
            }
        };

        applyTheme(theme);
        localStorage.setItem('app-theme', theme);

        // Listen for system changes when in 'system' mode
        if (theme === 'system') {
            const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
            const handler = () => applyTheme('system');
            mediaQuery.addEventListener('change', handler);
            return () => mediaQuery.removeEventListener('change', handler);
        }
    }, [theme]);

    // Apply font size
    useEffect(() => {
        document.documentElement.style.fontSize = fontSizeMap[fontSize];
        localStorage.setItem('app-font-size', fontSize);
    }, [fontSize]);

    return (
        <ThemeContext.Provider value={{ theme, fontSize, setTheme, setFontSize }}>
            {children}
        </ThemeContext.Provider>
    );
}
