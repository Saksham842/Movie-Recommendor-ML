import React, { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Search, Loader2, Sparkles } from 'lucide-react';
import MovieCard from '../components/MovieCard';

gsap.registerPlugin(ScrollTrigger);

const API = 'http://localhost:8000';

// Page transition wrapper
const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

export default function Home() {
  const heroRef = useRef(null);
  const spotlightRef = useRef(null);
  const cardsContainerRef = useRef(null);
  const searchBarRef = useRef(null);

  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const debounceTimer = useRef(null);

  // --- GSAP Cursor Spotlight ---
  useEffect(() => {
    const hero = heroRef.current;
    const spotlight = spotlightRef.current;
    if (!hero || !spotlight) return;

    const handleMouseMove = (e) => {
      const rect = hero.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      gsap.to(spotlight, { x, y, duration: 0.6, ease: 'power2.out' });
    };

    hero.addEventListener('mousemove', handleMouseMove);
    return () => hero.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // --- GSAP ScrollTrigger for movie cards ---
  useEffect(() => {
    if (!results.length) return;

    const cards = document.querySelectorAll('.movie-card');
    if (!cards.length) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        cards,
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          stagger: 0.07,
          duration: 0.5,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: cardsContainerRef.current,
            start: 'top 85%',
          },
        }
      );
    });
    return () => ctx.revert();
  }, [results]);

  // --- Debounced Search ---
  const doSearch = useCallback(async (q) => {
    if (!q.trim()) { setResults([]); setHasSearched(false); return; }
    setLoading(true);
    try {
      const res = await fetch(`${API}/search?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      setResults(data.results || []);
      setHasSearched(true);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleInput = (e) => {
    const val = e.target.value;
    setQuery(val);
    clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => doSearch(val), 350);
  };

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.4 }}>
      {/* ── HERO ── */}
      <section
        ref={heroRef}
        className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-gray-950 px-6"
      >
        {/* Gold cursor spotlight */}
        <div
          ref={spotlightRef}
          className="pointer-events-none absolute w-[500px] h-[500px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(245,197,24,0.08) 0%, transparent 70%)',
            transform: 'translate(-50%, -50%)',
            top: 0,
            left: 0,
          }}
        />

        {/* Heading */}
        <div className="relative z-10 text-center max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="inline-flex items-center gap-2 bg-[#f5c518]/10 border border-[#f5c518]/20 rounded-full px-4 py-1.5 text-[#f5c518] text-sm font-semibold mb-6"
          >
            <Sparkles className="w-3.5 h-3.5" />
            TF-IDF + Cosine Similarity · TMDB 5000 Dataset
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.7 }}
            className="text-5xl md:text-7xl font-black tracking-tight text-white leading-none mb-6"
          >
            Find Your Next<br />
            <span className="text-[#f5c518]">Favorite Film.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-gray-400 text-lg max-w-xl mx-auto mb-10 leading-relaxed"
          >
            Our ML engine reads the DNA of 5,000 films — plot, genre, cast, director — and finds movies that share the same cinematic fingerprint.
          </motion.p>

          {/* ── Animated Search Bar ── */}
          <div ref={searchBarRef} className="flex justify-center">
            <motion.div
              animate={{ width: focused ? '100%' : '60%' }}
              transition={{ type: 'spring', stiffness: 200, damping: 25 }}
              className="relative max-w-2xl w-full"
            >
              <div className={`flex items-center bg-gray-900 border rounded-2xl px-5 py-4 transition-all ${focused ? 'border-[#f5c518]/50 shadow-lg shadow-[#f5c518]/5' : 'border-white/10'}`}>
                {loading ? (
                  <Loader2 className="w-5 h-5 text-[#f5c518] animate-spin shrink-0" />
                ) : (
                  <Search className="w-5 h-5 text-gray-500 shrink-0" />
                )}
                <input
                  type="text"
                  value={query}
                  onChange={handleInput}
                  onFocus={() => setFocused(true)}
                  onBlur={() => setFocused(false)}
                  placeholder="Search by title: Inception, The Dark Knight, Interstellar..."
                  className="flex-1 bg-transparent ml-3 text-white placeholder:text-gray-600 outline-none text-base"
                />
                {query && (
                  <button onClick={() => { setQuery(''); setResults([]); setHasSearched(false); }} className="text-gray-600 hover:text-white transition-colors ml-2">✕</button>
                )}
              </div>
            </motion.div>
          </div>
        </div>

        {/* Scroll nudge */}
        {!hasSearched && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }} className="absolute bottom-10 left-1/2 -translate-x-1/2 text-gray-600 text-xs flex flex-col items-center gap-1">
            <span>Search above to discover</span>
            <motion.div animate={{ y: [0, 6, 0] }} transition={{ repeat: Infinity, duration: 1.5 }}>↓</motion.div>
          </motion.div>
        )}
      </section>

      {/* ── RESULTS ── */}
      <AnimatePresence>
        {hasSearched && (
          <motion.section
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="max-w-7xl mx-auto px-6 py-16"
          >
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-white">
                {results.length > 0 ? (
                  <><span className="text-[#f5c518]">{results.length}</span> results for "<span className="text-[#f5c518]">{query}</span>"</>
                ) : (
                  <>No results found for "<span className="text-gray-400">{query}</span>"</>
                )}
              </h2>
            </div>

            <div ref={cardsContainerRef} className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
              {results.map((movie, i) => (
                <MovieCard key={movie.title + i} movie={movie} index={i} />
              ))}
            </div>

            {results.length === 0 && (
              <div className="text-center py-24 text-gray-600">
                <span className="text-6xl block mb-4">🎬</span>
                <p className="text-lg">No movies match your search. Try a different title.</p>
                <p className="text-sm mt-1">Hint: Search works best with exact titles like "The Matrix" or "Toy Story".</p>
              </div>
            )}
          </motion.section>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
