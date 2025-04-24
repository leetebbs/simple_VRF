import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import RandomGenerator from './components/RandomGenerator';
import About from './pages/About'; // Import the About page
// Import other pages if you have them (e.g., Features, Contact)
import Features from './pages/Features'; // <-- Uncomment this line
import Contact from './pages/Contact';

// Assuming ThemeProvider is used within Layout or globally, otherwise import and wrap Router
// import { ThemeProvider } from './context/ThemeContext'; 

function App() {
  // Placeholder components if you haven't created them yet
  // const Features = () => <div className="container mx-auto px-4 py-8"><h1 className="text-3xl font-bold">Features Page</h1><p>Details about features.</p></div>; // <-- Remove or comment out this line
  // const Contact = () => <div className="container mx-auto px-4 py-8"><h1 className="text-3xl font-bold">Contact Page</h1><p>Contact information.</p></div>;


  return (
    // <ThemeProvider> {/* Wrap Router if ThemeProvider isn't handled in Layout */}
      <Router>
        <Layout> {/* Layout likely contains the Header and renders children */}
          <Routes>
            <Route path="/" element={<RandomGenerator />} />
            <Route path="/about" element={<About />} />
            <Route path="/features" element={<Features />} /> {/* This will now use the imported Features component */}
            <Route path="/contact" element={<Contact />} /> {/* Add route for Contact */}
            {/* Define other routes here */}
          </Routes>
        </Layout>
      </Router>
    // </ThemeProvider>
  );
}

export default App;