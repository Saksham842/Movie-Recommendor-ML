import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// ADD THIS — register ScrollToPlugin for smooth scroll-to-top
gsap.registerPlugin(ScrollTrigger);
try {
  const { ScrollToPlugin } = require('gsap/ScrollToPlugin');
  gsap.registerPlugin(ScrollToPlugin);
} catch (e) {
  // ScrollToPlugin not available, will use window.scrollTo fallback
}
// END ADD

export default function BackToTop() {
  const btnRef = useRef(null);

  useEffect(() => {
    if (!btnRef.current) return;

    // ADD THIS — show/hide via GSAP ScrollTrigger
    const st = ScrollTrigger.create({
      start: '300px top',
      toggleActions: 'play none none reverse',
      onEnter: () => {
        gsap.to(btnRef.current, { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' });
      },
      onLeaveBack: () => {
        gsap.to(btnRef.current, { opacity: 0, y: 20, duration: 0.3, ease: 'power2.in' });
      },
    });

    // Start hidden
    gsap.set(btnRef.current, { opacity: 0, y: 20 });

    return () => st.kill();
    // END ADD
  }, []);

  const handleClick = () => {
    // ADD THIS — try GSAP ScrollToPlugin, fallback to native
    try {
      gsap.to(window, { scrollTo: 0, duration: 0.8, ease: 'power3.inOut' });
    } catch {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    // END ADD
  };

  return (
    // ADD THIS — fixed gold circular button
    <motion.button
      ref={btnRef}
      id="back-to-top-btn"
      onClick={handleClick}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      className="fixed bottom-6 right-6 z-40 w-11 h-11 rounded-full bg-yellow-400 text-gray-950 flex items-center justify-center shadow-lg shadow-yellow-400/20 text-lg font-bold"
      aria-label="Back to top"
    >
      ↑
    </motion.button>
    // END ADD
  );
}
