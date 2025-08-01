// frontend/src/components/AnimatedPathSVG.jsx
import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger); // Ensure ScrollTrigger is registered here or globally

const AnimatedPathSVG = () => {
    const svgRef = useRef(null);

    useEffect(() => {
        if (svgRef.current) {
            // Target the path inside your SVG
            const path = svgRef.current.querySelector('#mountainPath'); // Give your path an ID in the SVG

            if (path) {
                const length = path.getTotalLength(); // Get the total length of the path

                // Set initial styles for animation
                gsap.set(path, { strokeDasharray: length, strokeDashoffset: length });

                // Animate the path drawing
                gsap.to(path, {
                    strokeDashoffset: 0,
                    duration: 2, // Animation duration
                    ease: "power1.inOut",
                    scrollTrigger: {
                        trigger: svgRef.current, // Trigger when SVG section comes into view
                        start: "top 70%", // Start animation when SVG is 70% from top of viewport
                        // end: "bottom center", // Optional: end point
                        toggleActions: "play none none none", // Play once on scroll into view
                        // markers: true,
                    }
                });
            }
        }

        // Cleanup
        return () => {
            ScrollTrigger.getById("svgPathAnimation")?.kill(); // If you give it an ID
            // Or use getAll and filter/kill specific ones
        };
    }, []);

    return (
        <div className="svg-container">
            <svg
                ref={svgRef}
                width="100%"
                height="300"
                viewBox="0 0 800 300"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="animated-svg"
            >
                {/* Replace this path with your actual SVG path data */}
                <path
                    id="mountainPath"
                    d="M0 250 C 150 150, 300 280, 450 100, 600 200, 800 50" // Example path, replace with yours
                    stroke="var(--brand-blue)" // Use your CSS variable for stroke color
                    strokeWidth="4"
                    fill="none"
                />
            </svg>
        </div>
    );
};

export default AnimatedPathSVG;