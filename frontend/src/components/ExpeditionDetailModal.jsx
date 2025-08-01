// frontend/src/components/ExpeditionDetailModal.jsx
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import '../styles/ExpeditionDetailModal.css'; // Create this CSS file

const ExpeditionDetailModal = ({ expedition, onClose, onAddToCart }) => {
    if (!expedition) return null;

    const modalVariants = {
        hidden: { opacity: 0, y: "100vh" },
        visible: { opacity: 1, y: "0", transition: { duration: 0.5, type: "spring", damping: 25, stiffness: 200 } },
        exit: { opacity: 0, y: "100vh", transition: { duration: 0.3 } }
    };

    const backdropVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1 },
        exit: { opacity: 0 }
    };

    // Highlight what should be displayed for the user
    // This is subjective, but common important details are:
    // Name, Price, Duration, Difficulty, Description, Itinerary, Included/Excluded.

    return (
        <AnimatePresence>
            <motion.div
                className="modal-backdrop"
                variants={backdropVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                onClick={onClose} // Close modal when clicking outside
            >
                <motion.div
                    className="modal-content"
                    variants={modalVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    onClick={(e) => e.stopPropagation()} // Prevent clicks inside modal from closing it
                >
                    <button className="modal-close-btn" onClick={onClose}>
                        &times;
                    </button>

                    <h2 className="modal-title">{expedition.name}</h2>
                    <p className="modal-price">Price: ${expedition.price_per_person}</p>
                    <p className="modal-duration">Duration: {expedition.duration_days} Days</p>
                    <p className="modal-difficulty">Difficulty: {expedition.difficulty_level}</p>

                    <div className="modal-section">
                        <h3>Description</h3>
                        <p>{expedition.description}</p>
                    </div>

                    <div className="modal-section">
                        <h3>Itinerary</h3>
                        {/* You might want to format itinerary more nicely, e.g., split by lines/paragraphs */}
                        <p className="itinerary-text">{expedition.itinerary}</p>
                    </div>

                    {expedition.included_services && (
                        <div className="modal-section">
                            <h3>What's Included</h3>
                            <p className="included-services-text">{expedition.included_services}</p>
                        </div>
                    )}

                    {expedition.excluded_services && (
                        <div className="modal-section">
                            <h3>What's Excluded</h3>
                            <p className="excluded-services-text">{expedition.excluded_services}</p>
                        </div>
                    )}

                    {/* Add to Cart Button */}
                    <div className="modal-actions">
                        <button className="add-to-cart-btn" onClick={() => onAddToCart(expedition)}>
                            Add to Cart
                        </button>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default ExpeditionDetailModal;