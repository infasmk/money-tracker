
import React, { createContext, useContext, useEffect } from 'react';

interface ThemeContextType {
    theme: 'dark';
    toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    // Permanent dark mode for enterprise focus
    const theme = 'dark';

    useEffect(() => {
        const root = window.document.documentElement;
        root.classList.add('dark');
        root.classList.remove('light');
    }, []);

    const toggleTheme = () => {
        console.log("Theme is locked to DARK mode for professional consistency.");
    };

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = (): ThemeContextType => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};
