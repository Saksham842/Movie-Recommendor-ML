import React, { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { gsap } from 'gsap';
import { Film } from 'lucide-react';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const logoRef = useRef(null);
  const linksRef = useRef([]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    let ctx = gsap.context(() => {
      const tl = gsap.timeline();

      // Logo slides in from left
      tl.fromTo(logoRef.current, {
        x: -80,
        opacity: 0,
      }, {
        x: 0,
        opacity: 1,
        duration: 0.7,
        ease: 'power3.out',
      });

      // Nav links stagger in from top
      tl.fromTo(linksRef.current, {
        y: -30,
        opacity: 0,
      }, {
        y: 0,
        opacity: 1,
        stagger: 0.1,
        duration: 0.5,
        ease: 'power2.out',
      }, '-=0.3');
    });

    return () => ctx.revert();
  }, []);

  const location = useLocation();

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/dashboard', label: 'How It Works' },
  ];

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-colors duration-500 ${isScrolled ? 'bg-gray-950/95 backdrop-blur-md shadow-lg' : 'bg-transparent'}`}>
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        
        {/* Left Side: Logo & Links */}
        <div className="flex items-center gap-8">
          <Link ref={logoRef} to="/" className="flex items-center gap-2.5 group">
            <Film className="w-6 h-6 text-red-600 drop-shadow-md" />
            <span className="text-2xl font-black tracking-tight text-white drop-shadow-md">
              CineRec<span className="text-red-600">ML</span>
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-4">
            {navLinks.map((link, i) => (
              <Link
                key={link.to}
                ref={(el) => (linksRef.current[i] = el)}
                to={link.to}
                className={`text-sm font-medium transition-colors drop-shadow-md ${
                  location.pathname === link.to
                    ? 'text-white'
                    : 'text-gray-300 hover:text-gray-400'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>

      </div>
    </nav>
  );
}
