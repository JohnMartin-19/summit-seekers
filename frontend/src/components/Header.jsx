import React, { useState, useEffect } from 'react'; // Import useState and useEffect
import { Link } from 'react-router-dom';
import '../styles/Header.css';
import logo from '../assets/s.seekers.jpg'; // Assuming your logo path is correct

const Header = () => {
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            const offset = window.scrollY;
            if (offset > 100) { // Adjust this value as needed (e.g., 100px)
                setScrolled(true);
            } else {
                setScrolled(false);
            }
        };

        window.addEventListener('scroll', handleScroll);

        // Clean up the event listener when the component unmounts
        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []); // Empty dependency array means this effect runs once on mount and cleans up on unmount

    // Dynamically apply a class based on scroll state
    const headerClasses = `app-header ${scrolled ? 'scrolled' : ''}`;

    return (
        <header className={headerClasses}>
            <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: '1200px', margin: '0 auto' }}>
                <Link to="/" style={{ textDecoration: 'none', color: 'var(--brand-blue)', fontWeight: 'bold', fontSize: '1.5em' }}>
                    <img src={logo} alt="Summit Seekers Logo" className="header-logo" />
                </Link>
                <div className='header-nav'>
                    <Link to="/" className="nav-link">Home</Link>
                    <Link to="/expeditions" className="nav-link">Expeditions</Link>
                    <Link to="/about" className="nav-link">About</Link>
                    <Link to="/blogs" className="nav-link">Blogs</Link>
                    <Link to="/login" className="nav-link login-btn">Login</Link>
                    <Link to="/register" className="nav-link register-btn">Register</Link>
                </div>
            </nav>
        </header>
    );
};

export default Header;