// client/src/App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Header from './components/Header'; // Renamed Navbar to Header
import Footer from './components/Footer';

// Page Components
import HomePage from './pages/Home';
import ExpeditionListPage from './pages/ExpeditionList';
import ExpeditionDetailPage from './pages/ExpeditionDetail';
import AboutPage from './pages/About';
import BlogsPage from './pages/Blog';
import LoginPage from './pages/Login';
import RegisterPage from './pages/Register';

function App() {
    return (
        <Router>
           
                <Header /> {/* Your main navigation */}
                <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/expeditions" element={<ExpeditionListPage />} />
                    <Route path="/expeditions/:slug" element={<ExpeditionDetailPage />} />
                    <Route path="/about" element={<AboutPage />} />
                    <Route path="/blogs" element={<BlogsPage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                    {/* Fallback for unknown routes */}
                    <Route path="*" element={<div>404 Not Found</div>} />
                </Routes>
                <Footer />
           
        </Router>
    );
}

export default App;