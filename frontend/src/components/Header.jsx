
import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/Header.css'; 
import logo from '../assests/s.seekers.jpg'; 

const Header = () => {
    return (
        <header style={{ background: 'white', padding: '1rem', borderBottom: '1px solid #e7e7e7' }}>
            <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: '1200px', margin: '0 auto' }}>
                <Link to="/" style={{ textDecoration: 'none', color: 'var(--brand-blue)', fontWeight: 'bold', fontSize: '1.5em' }}>
                    {/* If you add your logo image, you can put it here */}
                     <img src={logo} alt="Summit Seekers Logo" style={{ height: '70px',  }} /> 
                   
                </Link>
                <div className='header-nav'>
                    <Link to="/" style={{ margin: '0 10px', textDecoration: 'none', color: 'var(--text-dark)' }}>Home</Link>
                    <Link to="/expeditions" style={{ margin: '0 10px', textDecoration: 'none', color: 'var(--text-dark)' }}>Expeditions</Link>
                    <Link to="/about" style={{ margin: '0 10px', textDecoration: 'none', color: 'var(--text-dark)' }}>About</Link>
                    <Link to="/blogs" style={{ margin: '0 10px', textDecoration: 'none', color: 'var(--text-dark)' }}>Blogs</Link>
                    <Link to="/login" style={{ margin: '0 10px', textDecoration: 'none', color: 'var(--brand-green)', fontWeight: 'bold' }}>Login</Link> {/* Login in green */}
                    <Link to="/register" style={{ margin: '0 10px', textDecoration: 'none', color: 'var(--brand-blue)', fontWeight: 'bold' }}>Register</Link> {/* Register in blue */}
                </div>
            </nav>
        </header>
    );
};

export default Header;