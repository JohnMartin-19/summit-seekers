// frontend/src/pages/Expeditions.jsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import ExpeditionCard from '../components/ExpeditionCard'; // We'll create this next
import ExpeditionDetailModal from '../components/ExpeditionDetailModal'; // We'll create this after
import '../styles/Expeditions.css'; // Create this CSS file
import heroExpeditionsImage from '../assets/murima3.jpg'; 

// Framer Motion Variants for page transitions
const pageTransitionVariants = {
    initial: { opacity: 0, x: -100 },
    animate: { opacity: 1, x: 0, transition: { duration: 0.7, ease: "easeOut" } },
    exit: { opacity: 0, x: 100, transition: { duration: 0.5, ease: "easeIn" } }
};

const Expeditions = () => {
    const [expeditions, setExpeditions] = useState([]);
    const [selectedExpedition, setSelectedExpedition] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Function to fetch expeditions from your Django backend API
        const fetchExpeditions = async () => {
            try {
                // Adjust this URL to your actual backend API endpoint for expeditions
                const response = await fetch('/api/expeditions/'); // Example: /api/expeditions/
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                setExpeditions(data);
            } catch (error) {
                console.error("Error fetching expeditions:", error);
                setError("Failed to load expeditions. Please try again later.");
            } finally {
                setLoading(false);
            }
        };

        fetchExpeditions();
    }, []); // Empty dependency array means this runs once on component mount

    const handleReadMore = (expedition) => {
        setSelectedExpedition(expedition);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedExpedition(null);
    };

    if (loading) {
        return (
            <motion.div
                className="expeditions-page loading-state"
                variants={pageTransitionVariants}
                initial="initial"
                animate="animate"
            >
                <div className="container">
                    <p>Loading expeditions...</p>
                </div>
            </motion.div>
        );
    }

    if (error) {
        return (
            <motion.div
                className="expeditions-page error-state"
                variants={pageTransitionVariants}
                initial="initial"
                animate="animate"
            >
                <div className="container">
                    <p className="error-message">{error}</p>
                </div>
            </motion.div>
        );
    }

    return (
        <motion.div
            className="expeditions-page"
            variants={pageTransitionVariants}
            initial="initial"
            animate="animate"
            exit="exit"
        >
            {/* Hero Section */}
            <section className="expeditions-hero">
                <div
                    className="expeditions-hero-image"
                    style={{ backgroundImage: `url(${heroExpeditionsImage})` }}
                ></div>
                <div className="expeditions-hero-overlay"></div>
                <div className="expeditions-hero-content">
                    <h1>Expeditions</h1>
                </div>
            </section>

            {/* Expeditions List Section */}
            <section className="expeditions-list-section">
                <div className="container">
                    {expeditions.length > 0 ? (
                        <div className="expedition-cards-grid">
                            {expeditions.map((expedition) => (
                                <ExpeditionCard
                                    key={expedition.slug} // Assuming slug is unique and good for key
                                    expedition={expedition}
                                    onReadMore={handleReadMore}
                                />
                            ))}
                        </div>
                    ) : (
                        <p className="no-expeditions">No expeditions currently available. Check back soon!</p>
                    )}
                </div>
            </section>

            {/* Expedition Detail Modal */}
            {isModalOpen && selectedExpedition && (
                <ExpeditionDetailModal
                    expedition={selectedExpedition}
                    onClose={handleCloseModal}
                    // You'll pass cart/checkout functions here when implemented
                />
            )}
        </motion.div>
    );
};

export default Expeditions;