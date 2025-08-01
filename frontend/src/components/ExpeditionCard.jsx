// frontend/src/components/ExpeditionCard.jsx
import React from 'react';
import { motion } from 'framer-motion';
import '../styles/ExpeditionCard.css'; // Create this CSS file

const ExpeditionCard = ({ expedition, onReadMore }) => {
    // Determine if the expedition is sold out (assuming 0 max_participants means sold out, or 0 available slots)
    // You might need a more sophisticated logic here, e.g., tracking current bookings.
    // For now, let's assume if max_participants is 0 or very low, it's 'sold out' for simplicity,
    // or you have an 'available_slots' field from your backend.
    const isSoldOut = expedition.max_participants <= 0; // Simple example

    // Placeholder image if expedition.image_url is not available
    // You'll likely need an 'image_url' field in your Expedition model and serializer.
    const imageUrl = expedition.image_url || 'https://via.placeholder.com/400x250?text=Expedition+Image';

    const cardVariants = {
        hidden: { opacity: 0, y: 50 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.6, ease: "easeOut" }
        }
    };

    return (
        <motion.div
            className={`expedition-card ${isSoldOut ? 'sold-out' : ''}`}
            variants={cardVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
        >
            {isSoldOut && <div className="sold-out-overlay">SOLD OUT</div>}
            <div className="card-image-wrapper">
                <img src={imageUrl} alt={expedition.name} className="card-image" />
            </div>
            <div className="card-content">
                <h3>{expedition.name}</h3>
                <p className="card-price">From ${expedition.price_per_person}</p>
                <p className="card-duration">{expedition.duration_days} Days</p>
                <p className="card-difficulty">Difficulty: {expedition.difficulty_level}</p>

                {!isSoldOut && (
                    <button className="read-more-btn" onClick={() => onReadMore(expedition)}>
                        Read More
                    </button>
                )}
            </div>
        </motion.div>
    );
};

export default ExpeditionCard;