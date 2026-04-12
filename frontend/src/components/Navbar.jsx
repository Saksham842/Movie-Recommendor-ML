import React, { useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { gsap } from 'gsap';
import { Film, BarChart2 } from 'lucide-react';

export default function Navbar() {
  const logoRef = useRef(null);
  const linksRef = useRef([]);

  useEffect(() => {
    const tl = gsap.timeline();

    // Logo slides in from left
    tl.from(logoRef.current, {
      x: -80,
      opacity: 0,
      duration: 0.7,
      ease: 'power3.out',
    });

    // Nav links stagger in from top
    tl.from(linksRef.current, {
      y: -30,
      opacity: 0,
      stagger: 0.1,
      duration: 0.5,
      ease: 'power2.out',
    }, '-=0.3');
  }, []);

  const location = useLocation();

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/dashboard', label: 'How It Works' },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-gray-950/80 backdrop-blur-md border-b border-white/5">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link ref={logoRef} to="/" className="flex items-center gap-2.5 group">
          <div className="bg-[#f5c518]/10 p-2 rounded-lg group-hover:bg-[#f5c518]/20 transition-colors">
            <Film className="w-5 h-5 text-[#f5c518]" />
          </div>
          <span className="text-xl font-black tracking-tight text-white">
            CineRec<span className="text-[#f5c518]">ML</span>
          </span>
        </Link>

        <div className="flex items-center gap-1">
          {navLinks.map((link, i) => (
            <Link
              key={link.to}
              ref={(el) => (linksRef.current[i] = el)}
              to={link.to}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                location.pathname === link.to
                  ? 'bg-[#f5c518]/10 text-[#f5c518]'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {link.label}
            </Link>
          ))}
          <a
            ref={(el) => (linksRef.current[navLinks.length] = el)}
            href="https://github.com"
            target="_blank"
            rel="noreferrer"
            className="ml-2 px-4 py-2 rounded-lg text-sm font-semibold bg-[#f5c518] text-gray-950 hover:bg-[#f5c518]/90 transition-colors"
          >
            GitHub
          </a>
        </div>
      </div>
    </nav>
  );
}
