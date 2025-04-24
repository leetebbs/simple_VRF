import React from 'react';
import Header from './Header';
import Footer from './Footer';
import { ThemeProvider, useTheme } from '../context/ThemeContext'; // Import useTheme

interface LayoutProps {
  children: React.ReactNode;
}

// Inner component to access theme context
const ThemedLayout: React.FC<LayoutProps> = ({ children }) => {
  const { isDarkMode } = useTheme(); // Access theme state if needed for conditional logic beyond Tailwind

  return (
    // Apply light mode styles by default
    // Apply dark mode styles using the dark: prefix
    <div className={`min-h-screen flex flex-col 
                     bg-white text-slate-900  // Light mode styles
                     dark:bg-gradient-to-b dark:from-navy-900 dark:to-navy-950 dark:text-slate-200 // Dark mode styles
                    `}>
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8 md:py-12">
        {children}
      </main>
      <Footer />
    </div>
  );
};

// Keep ThemeProvider wrapping the themed layout
const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <ThemeProvider>
      <ThemedLayout>{children}</ThemedLayout>
    </ThemeProvider>
  );
};

export default Layout;