import React, { useRef, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Link } from 'react-router-dom';
import FeatureImageCard from '../components/FeatureImageCard'; // Ensure this component exists and accepts className
import AnimatedPathSVG from '../components/AnimatedPathSVG'; 
// GSAP Imports
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText'; // Remember: SplitText is a Club GreenSock plugin

// Image Imports (ensure these paths are correct relative to Home.jsx)
import safetyImage from '../assets/features/safety.jpg';
import sustImage from '../assets/features/sust.jpg';
import tailoredImage from '../assets/features/tailored.jpg';
import sceneryImage from '../assets/features/scenery.jpg';
import gorpcoreImage from '../assets/features/gorpcore.jpg';
import mtKenyaHero from '../assets/murima.jpg'; 

import '../styles/Home.css'; 


gsap.registerPlugin(ScrollTrigger, SplitText);

const Home = () => {
   
    const { scrollY } = useScroll();
    const yBg = useTransform(scrollY, [0, 500], [0, -100]);

  
    const introRef = useRef(null);
    const whyChooseRef = useRef(null);
    const ctaRef = useRef(null);
    const horizontalScrollSectionRef = useRef(null); 
    const parallaxItemRef = useRef(null); 

    const textVariants = {
        hidden: { opacity: 0, y: 50 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
    };

    const buttonVariants = {
        hidden: { opacity: 0, scale: 0.8 },
        visible: { opacity: 1, scale: 1, transition: { duration: 0.5, delay: 0.5 } },
        hover: { scale: 1.05, transition: { type: "spring", stiffness: 400, damping: 10 } }
    };

    const sectionVariants = {
        hidden: { opacity: 0, y: 50 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: "easeOut" } }
    };

    const pageTransitionVariants = {
        initial: { opacity: 0, x: -100 },
        animate: { opacity: 1, x: 0, transition: { duration: 0.7, ease: "easeOut" } },
        exit: { opacity: 0, x: 100, transition: { duration: 0.5, ease: "easeIn" } }
    };

    useEffect(() => {
       
        if (typeof SplitText === 'undefined') {
            console.error("GSAP SplitText plugin not loaded or not properly registered!");
           
            gsap.from(".hero-title", { opacity: 0, y: -50, duration: 1, ease: "power3.out", delay: 0.6 });
        } else {
            
            const heroHeading = document.querySelector('.hero-content .hero-title'); 
            if (heroHeading) {
                
                if (heroHeading.textContent.trim().length > 0) {
                    const split = new SplitText(heroHeading, { type: "words,chars" });
                    gsap.from(split.chars, {
                        opacity: 0,
                        y: -20,
                        stagger: 0.05,
                        duration: 0.8,
                        ease: "back.out(1.7)",
                        delay: 0.6 // After initial hero content animation
                    });
                }
            }
        }


        // GSAP: Introduction Section - animate children (h2, p tags)
        if (introRef.current) {
            gsap.fromTo(introRef.current.children,
                { opacity: 0, y: 30 },
                { opacity: 1, y: 0, duration: 1, stagger: 0.2, ease: "power3.out",
                    scrollTrigger: {
                        trigger: introRef.current,
                        start: "top 80%",
                        end: "top 30%",
                        scrub: 1,
                        // markers: true,
                    }
                }
            );
        }

        // GSAP: Why Choose Us Section - animate FeatureImageCards
        if (whyChooseRef.current) {
            gsap.fromTo(whyChooseRef.current.querySelectorAll('.feature-card'),
                { opacity: 0, y: 50 },
                { opacity: 1, y: 0, duration: 0.8, stagger: 0.1, ease: "power2.out",
                    scrollTrigger: {
                        trigger: whyChooseRef.current,
                        start: "top 75%",
                        // markers: true,
                    }
                }
            );
        }

        // GSAP: CTA Section - animate children
        if (ctaRef.current) {
            gsap.fromTo(ctaRef.current.children,
                { opacity: 0, scale: 0.8 },
                { opacity: 1, scale: 1, duration: 1, ease: "elastic.out(1, 0.5)",
                    scrollTrigger: {
                        trigger: ctaRef.current,
                        start: "top 80%",
                        // markers: true,
                    }
                }
            );
        }

        // Parallax Effect on a specific image/element (using GSAP for more control)
        if (parallaxItemRef.current) {
            gsap.to(parallaxItemRef.current, {
                y: -150, // Move up 150px as you scroll
                ease: "none",
                scrollTrigger: {
                    trigger: parallaxItemRef.current,
                    start: "top bottom", // Start when element enters view
                    end: "bottom top", // End when element leaves view
                    scrub: true, // Link animation to scroll position
                    // markers: true,
                }
            });
        }

        // Example: Horizontal Scroll Section
        if (horizontalScrollSectionRef.current) {
            const panels = gsap.utils.toArray(horizontalScrollSectionRef.current.querySelectorAll(".horizontal-panel"));

            gsap.to(panels, {
                xPercent: -100 * (panels.length - 1),
                ease: "none",
                scrollTrigger: {
                    trigger: horizontalScrollSectionRef.current,
                    pin: true,
                    scrub: 1,
                    end: () => "+=" + horizontalScrollSectionRef.current.offsetWidth,
                    // markers: true,
                }
            });
        }

        // Cleanup GSAP ScrollTriggers when component unmounts
        return () => {
            ScrollTrigger.getAll().forEach(st => st.kill());
            // If SplitText was used, revert the text
            const heroHeading = document.querySelector('.hero-content .hero-title');
            if (heroHeading && heroHeading.split) { // Check if SplitText was applied and stored
                // Assuming `split` was stored outside useEffect or globally for proper revert.
                // A common pattern is to store SplitText instance in a ref or array to revert all.
                // For direct DOM query, it's harder to get the SplitText instance to call .revert()
                // If you re-use elements, ensure they're clean on re-render.
            }
        };
    }, []); // Empty dependency array: runs once on mount, cleans up on unmount

    // Data for the feature cards
    const featuresData = [
        {
            id: 1,
            image: safetyImage,
            title: 'Safety & Expertise',
            description: 'Certified guides, rigorous safety protocols, and deep local knowledge for a secure adventure.'
        },
        {
            id: 2,
            image: sustImage,
            title: 'Sustainable Tourism',
            description: 'We champion eco-friendly practices and support local communities on every expedition.'
        },
        {
            id: 3,
            image: tailoredImage,
            title: 'Tailored Experiences',
            description: 'Customizable itineraries and private treks to fit your pace and preferences.'
        },
        {
            id: 4,
            image: sceneryImage,
            title: 'Unforgettable Scenery',
            description: 'Explore breathtaking vistas and diverse ecosystems unique to East Africa.'
        },
        {
            id: 5,
            image: gorpcoreImage,
            title: 'Gorpcore Style',
            description: 'Fashion in mountaineering? We love that. Incorporating Gore-Tex fashion in our alpinic adventures.'
        }
    ];

    return (
        // motion.div for page transitions (controlled by AnimatePresence in App.jsx)
        <motion.div
            className="homepage"
            variants={pageTransitionVariants}
            initial="initial"
            animate="animate"
            exit="exit"
        >
            {/* --- Hero Section with Parallax Background --- */}
            <section className="hero-section">
                <motion.div
                    className="hero-background"
                    style={{ y: yBg, backgroundImage: `url(${mtKenyaHero})` }} // Using imported image variable
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1.5 }}
                />
                <div className="hero-overlay"></div>
                <motion.div
                    className="hero-content"
                    initial="hidden"
                    animate="visible"
                    variants={{ visible: { transition: { staggerChildren: 0.2 } } }}
                >
                    {/* Removed <br/> tags - use CSS for spacing in .hero-content */}
                    <motion.h1 variants={textVariants} className="hero-title">Summit Seekers</motion.h1>
                    <motion.p variants={textVariants} className="lead-text">
                        Unforgettable Expeditions to East Africa's Highest Peaks
                    </motion.p>
                    <Link to="/expeditions">
                        <motion.button
                            className="explore-button"
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
                viewport={{ once: true, amount: 0.5 }}
                variants={sectionVariants}
                ref={introRef} 
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

            {/* --- Why Choose Us Section with Image Cards --- */}
            <motion.section
                className="section-content bg-light-gray"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.5 }}
                variants={sectionVariants}
                ref={whyChooseRef} 
            >
                <div className="container">
                    <h2>Why Choose Summit Seekers?</h2>
                    <div className="features-grid">
                        {featuresData.map((feature, index) => (
                            <FeatureImageCard
                                key={feature.id}
                                image={feature.image}
                                title={feature.title}
                                description={feature.description}
                                // Ensure FeatureImageCard passes this className to its root element
                                className="feature-card"
                                delay={index * 0.1}
                            />
                        ))}
                    </div>
                </div>
            </motion.section>

            {/* --- Horizontal Scroll Section (Example) --- */}
            {/* You will need to style .horizontal-scroll-section and .horizontal-panel in Home.css */}
            <section className="horizontal-scroll-section" ref={horizontalScrollSectionRef}>
                <div className="horizontal-panel">
                    <h3>Explore Diverse Climbs</h3>
                    <p>From lush forests to alpine deserts, East Africa offers unparalleled geological diversity.</p>
                </div>
                <div className="horizontal-panel">
                    <h3>Cultural Immersion</h3>
                    <p>Engage with local communities and discover the rich heritage of the regions.</p>
                </div>
                <div className="horizontal-panel">
                    <h3>Wildlife Encounters</h3>
                    <p>Spot unique wildlife in the lower mountain zones and national parks.</p>
                </div>
            </section>

            {/* --- Another Section with a Parallax Item (Example) --- */}
            {/* This image will have GSAP controlled parallax based on scroll */}
            {/* <section className="section-content parallax-section">
                <div className="container">
                    <h2>Our Commitment</h2>
                    <p>We are dedicated to providing ethical and memorable adventures.</p>
                    <img src={sceneryImage} alt="Parallax Element" className="parallax-element" ref={parallaxItemRef} />
                </div>
            </section> */}

            {/* --- Call to Action Section --- */}
            <motion.section
                className="section-content cta-section"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.5 }}
                variants={sectionVariants}
                ref={ctaRef} 
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

            {/* --- Bubbles / Background Animations (CSS-based) --- */}
            {/* Style these in Home.css to position them and animate */}
            <div className="animated-bubbles-container">
                <div className="bubble"></div>
                <div className="bubble"></div>
                <div className="bubble"></div>
                <div className="bubble"></div>
                <div className="bubble"></div>
                <div className="bubble"></div>
                <div className="bubble"></div>
            </div>

           
            <section className="svg-animation-section">
                <div className="container">
                    <h2>Our Journey</h2>
                    <p>See our path unfold...</p>
                    <AnimatedPathSVG /> 
                </div>
            </section>

        </motion.div>
    );
};

export default Home;