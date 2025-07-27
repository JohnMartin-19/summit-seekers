// frontend/src/components/Footer.jsx
import React from 'react';

const Footer = () => {
    return (
        <footer style={{ background: '#343a40', color: 'white', textAlign: 'center', padding: '1rem', marginTop: 'auto' }}>
            <p>&copy; {new Date().getFullYear()} Summit Seekers. All rights reserved.</p>
        </footer>
    );
};

export default Footer;