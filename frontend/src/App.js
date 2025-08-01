import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion'; // Import AnimatePresence

import Header from './components/Header';
import Home from './pages/Home';
import Expeditions from './pages/Expeditions';
import About from './pages/About';
import Blogs from './pages/Blog';
import AppFooter from './components/Footer';

import './App.css'; // Your main app CSS

function App() {
    const location = useLocation(); // Hook to get the current location for AnimatePresence

    return (
        <div className="app-container">
            <Header />
            {/* AnimatePresence for page transitions */}
            <AnimatePresence mode='wait'> {/* 'wait' mode waits for the exit animation to complete before new component renders */}
                <Routes location={location} key={location.pathname}>
                    <Route path="/" element={<Home />} />
                    <Route path="/expeditions" element={<Expeditions />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/blogs" element={<Blogs />} />
                    {/* Add other routes as needed */}
                </Routes>
            </AnimatePresence>
            <AppFooter />
        </div>
    );
}

// Wrap App with Router outside, so useLocation works
function RootApp() {
    return (
        <Router>
            <App />
        </Router>
    );
}

export default RootApp;