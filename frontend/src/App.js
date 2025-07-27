// frontend/src/App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';

// Page Components
import Home from './pages/Home';
import ExpeditionList from './pages/ExpeditionList';
import ExpeditionDetail from './pages/ExpeditionDetail';
import About from './pages/About';
import Blog from './pages/Blog';
import Login from './pages/Login';
import Register from './pages/Register';

function App() {
    return (
        <Router>
            <Header />
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/expeditions" element={<ExpeditionList />} />
                <Route path="/expeditions/:slug" element={<ExpeditionDetail />} />
                <Route path="/about" element={<About />} />
                <Route path="/blogs" element={<Blog />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                {/* Fallback for unknown routes */}
                <Route path="*" element={<div>404 Not Found</div>} />
            </Routes>
            <Footer />
        </Router>
    );
}

export default App;