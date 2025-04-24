import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom'; // Import Link and useLocation
import { Menu, X, Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { isDarkMode, toggleTheme } = useTheme();
  const location = useLocation(); // Get current location

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    // Close mobile menu on route change
    setIsMenuOpen(false); 
    return () => window.removeEventListener('scroll', handleScroll);
  }, [location]); // Add location as dependency to close menu on navigation

  // Helper function to determine active link
  const isActive = (path: string) => location.pathname === path;

  return (
    <header className={`sticky top-0 z-50 transition-all duration-300 ${
      isScrolled ? 'bg-navy-900/90 backdrop-blur-md shadow-lg' : 'bg-transparent'
    }`}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between py-4">
          <div className="flex items-center">
            {/* Link the brand name to home */}
            <Link to="/" className="text-xl font-bold text-teal-400">RandomizeX</Link>
          </div>

          {/* Desktop navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {/* Use Link component and check active state */}
            <Link to="/" className={`nav-link ${isActive('/') ? 'active' : ''}`}>Home</Link>
            <Link to="/features" className={`nav-link ${isActive('/features') ? 'active' : ''}`}>Features</Link> {/* Added Features route */}
            <Link to="/about" className={`nav-link ${isActive('/about') ? 'active' : ''}`}>About</Link>
            <Link to="/contact" className={`nav-link ${isActive('/contact') ? 'active' : ''}`}>Contact</Link> {/* Added Contact route */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full bg-navy-800/50 hover:bg-navy-700/50 transition-colors"
              aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
            >
              {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </nav>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={toggleTheme}
              className="p-2 mr-2 rounded-full bg-navy-800/50 hover:bg-navy-700/50 transition-colors"
              aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
            >
              {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-lg bg-navy-800/50 hover:bg-navy-700/50 transition-colors"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile navigation */}
      {isMenuOpen && (
        <div className="md:hidden bg-navy-900/95 backdrop-blur-md">
          <div className="container mx-auto px-4 py-4">
            <nav className="flex flex-col space-y-4">
              {/* Use Link component and check active state */}
              <Link to="/" className={`mobile-nav-link ${isActive('/') ? 'active' : ''}`}>Home</Link>
              <Link to="/features" className={`mobile-nav-link ${isActive('/features') ? 'active' : ''}`}>Features</Link> {/* Added Features route */}
              <Link to="/about" className={`mobile-nav-link ${isActive('/about') ? 'active' : ''}`}>About</Link>
              <Link to="/contact" className={`mobile-nav-link ${isActive('/contact') ? 'active' : ''}`}>Contact</Link> {/* Added Contact route */}
            </nav>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;