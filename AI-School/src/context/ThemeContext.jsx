import React, { createContext, useState, useEffect, useContext } from 'react';

const ThemeContext = createContext();

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => {
    // Check for a saved theme in localStorage, or default to 'light'
    const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');

    // This effect runs whenever the theme changes
    useEffect(() => {
        const root = window.document.documentElement;
        
        // Remove the old theme class and add the new one to the <html> tag
        root.classList.remove('light', 'dark');
        root.classList.add(theme);

        // Save the user's preference in localStorage
        localStorage.setItem('theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
    };

    const value = {
        theme,
        toggleTheme,
    };

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
};
