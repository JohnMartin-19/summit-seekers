
import React from 'react';
import { motion } from 'framer-motion';
import '../styles/ExpeditionCard.css'; 

const ExpeditionCard = ({ expedition, onReadMore }) => {

    const isSoldOut = expedition.max_participants <= 0;
  
    const imageUrl = expedition.image
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

            {/* Image Wrapper with img tag */}
            <div className="card-image-wrapper">
                <img src={imageUrl} alt={expedition.name} className="card-image" />
            </div>

            {/* Card Content with details */}
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