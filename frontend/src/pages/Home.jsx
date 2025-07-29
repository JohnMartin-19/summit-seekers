// client/src/pages/Home.jsx
import React from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Link } from 'react-router-dom';

import '../styles/Home.css'; 

const Home = () => {
   
    const { scrollY } = useScroll();
    const yBg = useTransform(scrollY, [0, 500], [0, -100]); 

    // Animation variants for hero text
    const textVariants = {
        hidden: { opacity: 0, y: 50 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
    };

    // Animation variants for the button
    const buttonVariants = {
        hidden: { opacity: 0, scale: 0.8 },
        visible: { opacity: 1, scale: 1, transition: { duration: 0.5, delay: 0.5 } },
        hover: { scale: 1.05, transition: { type: "spring", stiffness: 400, damping: 10 } }
    };

    // Animation variants for content sections
    const sectionVariants = {
        hidden: { opacity: 0, y: 50 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: "easeOut" } }
    };

    return (
        <div className="homepage">
            {/* --- Hero Section with Parallax Background --- */}
            <section className="hero-section">
                <motion.div
                    className="hero-background"
                    style={{ y: yBg, backgroundImage: 'url("../assets/mt.kenya.jpg")' }} // Use your image here
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1.5 }}
                />
                <div className="hero-overlay"></div> {/* Optional: for a subtle darkening effect */}
                <motion.div
                    className="hero-content"
                    initial="hidden"
                    animate="visible"
                    variants={{ visible: { transition: { staggerChildren: 0.2 } } }}
                >
                    {/* <motion.h1 variants={textVariants}>Summit Seekers Expeditions</motion.h1> */}
                    
                    <motion.p variants={textVariants} className="lead-text">
                        <br /><br />
                        Unforgettable Expeditions to East Africa's Highest Peaks
                    </motion.p>
                    <Link to="/expeditions">
                        <motion.button
                            className="explore-button" // Use a custom class for styling
                            variants={buttonVariants}
                            whileHover="hover"
                        >
                            Explore Expeditions
                        </motion.button>
                    </Link>
                </motion.div>
            </section>

            {/* --- Introduction/Mission Section --- */}
            <motion.section
                className="section-content"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.5 }} // Trigger when 50% of element is in view
                variants={sectionVariants}
            >
                <div className="container">
                    <h2>Your Journey, Our Expertise</h2>
                    <p>
                        At Summit Seekers, we believe every climb is a story waiting to be told. Specializing in guided expeditions across East Africa's majestic landscapes, we offer more than just treks; we provide profound experiences. From the iconic Mount Kilimanjaro and Mount Kenya to the lesser-known but equally stunning peaks, our meticulously planned adventures cater to all skill levels.
                    </p>
                    <p>
                        Our expert local guides, deeply rooted in the culture and terrain, ensure not only your safety but also an immersive and respectful journey through these incredible environments. With Summit Seekers, you're not just conquering a peak; you're connecting with nature, challenging your limits, and creating memories that will last a lifetime.
                    </p>
                </div>
            </motion.section>

            {/* --- Why Choose Us Section --- */}
            <motion.section
                className="section-content bg-light-gray"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.5 }}
                variants={sectionVariants}
            >
                <div className="container">
                    <h2>Why Choose Summit Seekers?</h2>
                    <div className="features-grid">
                        <div className="feature-item">
                            <h3>Safety & Expertise</h3>
                            <p>Certified guides, rigorous safety protocols, and deep local knowledge for a secure adventure.</p>
                        </div>
                        <div className="feature-item">
                            <h3>Sustainable Tourism</h3>
                            <p>We champion eco-friendly practices and support local communities on every expedition.</p>
                        </div>
                        <div className="feature-item">
                            <h3>Tailored Experiences</h3>
                            <p>Customizable itineraries and private treks to fit your pace and preferences.</p>
                        </div>
                        <div className="feature-item">
                            <h3>Unforgettable Scenery</h3>
                            <p>Explore breathtaking vistas and diverse ecosystems unique to East Africa.</p>
                        </div>
                        <div className="feature-item">
                            <h3>Gorpcore Style</h3>
                            <p>Fashion in mountaineering? We love that. Incorporating gortex fashion in our alpinic adventures.</p>
                        </div>
                    </div>
                </div>
            </motion.section>

            {/* --- Call to Action Section --- */}
            <motion.section
                className="section-content cta-section"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.5 }}
                variants={sectionVariants}
            >
                <div className="container">
                    <h2>Ready to Begin Your Ascent?</h2>
                    <p className="lead-text">
                        Your ultimate adventure is just a click away. Discover our range of expeditions and find the one that calls to your spirit.
                    </p>
                    <Link to="/expeditions">
                        <motion.button
                            className="explore-button"
                            variants={buttonVariants}
                            whileHover="hover"
                        >
                            View All Expeditions
                        </motion.button>
                    </Link>
                </div>
            </motion.section>
        </div>
    );
};

export default Home;