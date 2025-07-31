// frontend/src/components/FeatureImageCard.jsx
import React from 'react';
import { motion } from 'framer-motion';
import '../components/FeatureImageCard.css';
const FeatureImageCard = ({ image, title, description, delay = 0 }) => {
    // Variants for the card's entry animation
    const cardVariants = {
        hidden: { opacity: 0, y: 50 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.6,
                ease: "easeOut",
                delay: delay 
            }
        }
    };

    return (
        <motion.div
            className="feature-image-card"
            variants={cardVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }} 
        >
            <div
                className="card-image"
                style={{ backgroundImage: `url(${image})` }}
            ></div>
            <div className="card-overlay"></div>
            <div className="card-content">
                <h3>{title}</h3>
                <p style={{color:'white'}}>{description}</p>
            </div>
        </motion.div>
    );
};

export default FeatureImageCard;