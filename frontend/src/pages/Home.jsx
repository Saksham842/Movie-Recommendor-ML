import React, { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Search, Loader2, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';
import MovieCard from '../components/MovieCard';

gsap.registerPlugin(ScrollTrigger);

const API = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

// ── Hardcoded TMDB backdrop URLs for hero rotation ──────────────────────────
const BACKDROPS = [
  'https://image.tmdb.org/t/p/w1280/hZk9YQ7onvBk19S6v8m99asfDHz.jpg', // Fight Club
  'https://image.tmdb.org/t/p/w1280/hiKmj9vSpgD9S68L79q5U0e0v9q.jpg', // Parasite
  'https://image.tmdb.org/t/p/w1280/s3TBrRGB1iav7gFOCNx3H31MoES.jpg', // Inception
  'https://image.tmdb.org/t/p/w1280/gNBCvtYyGewR0GHUXaWEKF4QKRS.jpg', // Interstellar
  'https://image.tmdb.org/t/p/w1280/hkBaDkMWbLaf8B1lsWsKX7Ew3Xq.jpg', // The Dark Knight
  'https://image.tmdb.org/t/p/w1280/2Bh2kXdD684K23XlMoamMEFXbCv.jpg', // The Matrix
  'https://image.tmdb.org/t/p/w1280/vI3aUGTuRRdM7J78KIdW98LdxE5.jpg', // John Wick
  'https://image.tmdb.org/t/p/w1280/mZjZgY6ObiKtVuKVDrnS9VnuNlE.jpg', // The Shawshank Redemption
  'https://image.tmdb.org/t/p/w1280/xJHokMbljvjEVAi06p04kUSGNDa.jpg', // Pulp Fiction
  'https://image.tmdb.org/t/p/w1280/7RyHsO4yDXtBv1zUU3mTpHeQ0t5.jpg', // Avengers Endgame
];

const GENRES = ['All', 'Action', 'Comedy', 'Drama', 'Thriller', 'Science Fiction', 'Horror', 'Romance', 'Animation', 'Crime'];

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

const sectionHeadingVariants = {
  initial: { opacity: 0, x: -30 },
  animate: { opacity: 1, x: 0 },
};

const GenreCarousel = ({ genre, movies }) => {
  const rowRef = useRef(null);

  const scroll = (direction) => {
    if (rowRef.current) {
      const scrollAmount = window.innerWidth > 768 ? 600 : 300;
      rowRef.current.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <section 
      id={`genre-section-${genre.toLowerCase().replace(/\s/g,'-')}`} 
      className="max-w-7xl mx-auto px-6 py-10 border-t border-white/5 relative group"
    >
      <motion.h2
        variants={sectionHeadingVariants}
        initial="initial"
        whileInView="animate"
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="border-l-4 border-yellow-400 pl-3 text-xl font-bold text-white mb-6 uppercase tracking-wider"
      >
        {genre} Movies
      </motion.h2>
      
      <button 
        onClick={() => scroll('left')}
        className="absolute left-6 top-1/2 mt-4 -translate-y-1/2 z-40 bg-black/80 hover:bg-yellow-400 hover:text-black text-white p-3 rounded-full opacity-0 group-hover:opacity-100 transition-all border border-white/10 shadow-2xl backdrop-blur-md hidden md:flex items-center justify-center -ml-6"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>
      
      <button 
        onClick={() => scroll('right')}
        className="absolute right-6 top-1/2 mt-4 -translate-y-1/2 z-40 bg-black/80 hover:bg-yellow-400 hover:text-black text-white p-3 rounded-full opacity-0 group-hover:opacity-100 transition-all border border-white/10 shadow-2xl backdrop-blur-md hidden md:flex items-center justify-center -mr-6"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      <div ref={rowRef} className="flex gap-4 overflow-x-auto scrollbar-hide pb-4 pt-2 -mx-2 px-2 scroll-smooth">
        {movies.map((movie, i) => (
          <div key={`${movie.title}-${i}`} className="w-40 md:w-44 lg:w-48 shrink-0">
            <MovieCard movie={movie} index={i} />
          </div>
        ))}
      </div>
    </section>
  );
};

export default function Home() {
  // ── Refs ─────────────────────────────────────────────────────────────────
  const heroRef = useRef(null);
  const spotlightRef = useRef(null);
  const cardsContainerRef = useRef(null);
  const searchBarRef = useRef(null);
  const heroWordsRef = useRef(null);
  const underlineRef = useRef(null);
  const particlesRef = useRef([]);

  // ── State ─────────────────────────────────────────────────────────────────
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const debounceTimer = useRef(null);

  const [homeData, setHomeData] = useState({ trending: [], top_rated: [], by_genre: {} });
  const [homeLoading, setHomeLoading] = useState(true);

  // Hero backdrop rotation
  const [backdropIndex, setBackdropIndex] = useState(0);

  // ── Fetch /home-data ─────────────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API}/home-data`);
        const data = await res.json();
        setHomeData(data);
      } catch {
        setHomeData({ trending: [], top_rated: [] });
      } finally {
        setHomeLoading(false);
      }
    })();
  }, []);

  // ── Backdrop rotation ─────────────────────────────────────────────────────
  useEffect(() => {
    const id = setInterval(() => {
      setBackdropIndex(i => (i + 1) % BACKDROPS.length);
    }, 5000);
    return () => clearInterval(id);
  }, []);

  // ── GSAP: hero word reveal ────────────────────────────────────────────────
  useEffect(() => {
    if (!heroWordsRef.current) return;
    const ctx = gsap.context(() => {
      gsap.from('.hero-word', {
        y: 70,
        opacity: 0,
        stagger: 0.14,
        duration: 0.8,
        ease: 'power3.out',
      });
      gsap.to(underlineRef.current, {
        scaleX: 1,
        duration: 0.7,
        ease: 'power3.out',
        delay: 1,
      });
    }, heroWordsRef);
    return () => ctx.revert();
  }, []);

  // ── GSAP: floating particles ──────────────────────────────────────────────
  useEffect(() => {
    const ctx = gsap.context(() => {
      particlesRef.current.forEach(el => {
        if (!el) return;
        gsap.to(el, {
          y: (Math.random() - 0.5) * 40,
          x: (Math.random() - 0.5) * 20,
          duration: 2 + Math.random() * 2,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
        });
      });
    });
    return () => ctx.revert();
  }, []);

  // ── GSAP: cursor spotlight ────────────────────────────────────────────────
  useEffect(() => {
    const hero = heroRef.current;
    const spotlight = spotlightRef.current;
    if (!hero || !spotlight) return;
    const handleMouseMove = (e) => {
      const rect = hero.getBoundingClientRect();
      gsap.to(spotlight, { x: e.clientX - rect.left, y: e.clientY - rect.top, duration: 0.6, ease: 'power2.out' });
    };
    hero.addEventListener('mousemove', handleMouseMove);
    return () => hero.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // ── GSAP: horizontal grid rows ────────────────────────────────────────────
  // (Horizontal tracking is now strictly CSS-based via .animate-marquee for seamless infinite loop)

  // ── Debounced search ──────────────────────────────────────────────────────
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

  // ── Scroll to Genre ───────────────────────────────────────────────────────
  const scrollToGenre = (genre) => {
    const el = document.getElementById(`genre-section-${genre.toLowerCase().replace(/\s/g,'-')}`);
    if (el) {
      const y = el.getBoundingClientRect().top + window.scrollY - 80; // Offset for any fixed navs
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  const trendingMovies = homeData.trending || [];
  const topRatedMovies = homeData.top_rated || [];

  // ── Skeleton loader ───────────────────────────────────────────────────────
  const SkeletonRow = () => (
    <div className="flex gap-4 overflow-hidden pb-4">
      {Array.from({ length: 10 }).map((_, i) => (
        <div key={i} className="animate-pulse bg-gray-800 rounded-md w-44 h-64 shrink-0" />
      ))}
    </div>
  );

  // Hero words array
  const heroWords = ['Find', 'Your', 'Next'];

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.4 }}>
      {/* ── HERO ── */}
      <section ref={heroRef} className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-gray-950 px-6">

        {/* Rotating backdrops */}
        <div className="absolute inset-0 overflow-hidden">
          <AnimatePresence>
            <motion.img
              key={backdropIndex}
              src={BACKDROPS[backdropIndex]}
              alt=""
              className="absolute inset-0 w-full h-full object-cover"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1 }}
              onError={(e) => { e.target.style.display = 'none'; }}
            />
          </AnimatePresence>
          {/* Dark gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/60 to-transparent" />
        </div>

        {/* Gold cursor spotlight */}
        <div
          ref={spotlightRef}
          className="pointer-events-none absolute w-[500px] h-[500px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(245,197,24,0.08) 0%, transparent 70%)', transform: 'translate(-50%, -50%)', top: 0, left: 0 }}
        />

        {/* Floating particles (18) */}
        {Array.from({ length: 18 }).map((_, i) => (
          <div
            key={i}
            ref={el => (particlesRef.current[i] = el)}
            className="pointer-events-none absolute w-1 h-1 rounded-full bg-yellow-400"
            style={{ top: `${Math.random() * 90 + 5}%`, left: `${Math.random() * 90 + 5}%`, opacity: 0.15 + Math.random() * 0.1 }}
          />
        ))}

        {/* Heading */}
        <div ref={heroWordsRef} className="relative z-10 text-center max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="inline-flex items-center gap-2 bg-[#f5c518]/10 border border-[#f5c518]/20 rounded-full px-4 py-1.5 text-[#f5c518] text-sm font-semibold mb-6"
          >
            <Sparkles className="w-3.5 h-3.5" />
            TF-IDF + Cosine Similarity · TMDB 5000 Dataset
          </motion.div>

          <h1 className="text-5xl md:text-7xl font-black tracking-tight text-white leading-none mb-6">
            {heroWords.map((word, i) => (
              <span key={i} className="hero-word inline-block mr-4">{word}</span>
            ))}
            <br />
            <span className="relative">
              {['Favorite', 'Film.'].map((word, i) => (
                <span key={i} className={`hero-word inline-block ${i === 0 ? 'text-[#f5c518] mr-4' : 'text-[#f5c518]'}`}>{word}</span>
              ))}
              <span ref={underlineRef} className="absolute bottom-0 left-0 h-0.5 w-full bg-yellow-400 origin-left" style={{ scaleX: 0 }} />
            </span>
          </h1>

          <motion.p
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
            className="text-gray-300 text-lg max-w-xl mx-auto mb-10 leading-relaxed"
          >
            Our ML engine reads the DNA of 5,000 films — plot, genre, cast, director — and finds movies that share the same cinematic fingerprint.
          </motion.p>

          {/* Animated Search Bar */}
          <div ref={searchBarRef} className="flex justify-center">
            <motion.div
              animate={{ width: focused ? '100%' : '60%' }}
              transition={{ type: 'spring', stiffness: 200, damping: 25 }}
              className="relative max-w-2xl w-full"
            >
              <div className={`flex items-center bg-gray-900/90 border rounded-2xl px-5 py-4 transition-all ${focused ? 'border-[#f5c518]/50 shadow-lg shadow-[#f5c518]/5' : 'border-white/10'}`}>
                {loading ? <Loader2 className="w-5 h-5 text-[#f5c518] animate-spin shrink-0" /> : <Search className="w-5 h-5 text-gray-500 shrink-0" />}
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
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }} className="absolute bottom-10 left-1/2 -translate-x-1/2 text-gray-500 text-xs flex flex-col items-center gap-1">
            <span>Scroll to discover</span>
            <motion.div animate={{ y: [0, 6, 0] }} transition={{ repeat: Infinity, duration: 1.5 }}>↓</motion.div>
          </motion.div>
        )}
      </section>

      {/* ── Below hero content ── */}
      <div className="bg-gray-950">

        {/* ── Search Results (Rendered at top when active) ── */}
        <AnimatePresence mode="wait">
          {hasSearched && (
            <motion.section
              key="search-results"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="max-w-7xl mx-auto px-6 py-16 min-h-[50vh]"
            >
              <div className="flex items-center justify-between mb-8">
                <h2 className="border-l-4 border-yellow-400 pl-3 text-2xl font-bold text-white">
                  {results.length > 0 ? (
                    <><span className="text-[#f5c518]">{results.length}</span> results for "<span className="text-[#f5c518]">{query}</span>"</>
                  ) : (
                    <>No results for "<span className="text-gray-400">{query}</span>"</>
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

        {/* ── Generic Home Sections (Hidden when searching) ── */}
        <AnimatePresence mode="wait">
          {!hasSearched && (
            <motion.div
              key="home-sections"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {/* ── Genre Filter Bar ── */}
              <section className="max-w-7xl mx-auto px-6 pt-12 pb-2">
          <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2 justify-center">
            {GENRES.map(genre => {
              if (genre === 'All') return null; // 'All' is implicitly the whole page now
              return (
                <motion.button
                  key={genre}
                  whileTap={{ scale: 0.93 }}
                  onClick={() => scrollToGenre(genre)}
                  className="px-4 py-1.5 rounded-full text-sm cursor-pointer shrink-0 transition-colors bg-gray-800 text-gray-300 hover:bg-yellow-400 hover:text-gray-950 font-medium"
                >
                  {genre}
                </motion.button>
              );
            })}
          </div>
        </section>

        {/* ── Trending Now ── */}
        <section className="max-w-7xl mx-auto px-6 pt-10 pb-6">
          <motion.h2
            variants={sectionHeadingVariants}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="border-l-4 border-yellow-400 pl-3 text-xl font-bold text-white mb-4"
          >
            🔥 Trending Now
          </motion.h2>

          <AnimatePresence mode="wait">
            <motion.div
              key="trending-movies"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
            >
              {homeLoading ? (
                <SkeletonRow />
              ) : (
                <div className="flex overflow-hidden relative w-full group">
                  <div className="flex gap-4 w-max animate-marquee pb-4">
                    {trendingMovies.length === 0 ? (
                      <p className="text-gray-600 text-sm py-8">No movies available.</p>
                    ) : (
                      <>
                        {trendingMovies.map((movie, i) => (
                          <div key={`trend1-${movie.title}-${i}`} className="w-44 lg:w-48 shrink-0">
                            <MovieCard movie={movie} index={i} compact />
                          </div>
                        ))}
                        {/* Duplicate for infinite loop */}
                        {trendingMovies.map((movie, i) => (
                          <div key={`trend2-${movie.title}-${i}`} className="w-44 lg:w-48 shrink-0">
                            <MovieCard movie={movie} index={i} compact />
                          </div>
                        ))}
                      </>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </section>

        {/* ── Top Rated ── */}
        <section className="max-w-7xl mx-auto px-6 pb-10">
          <motion.h2
            variants={sectionHeadingVariants}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="border-l-4 border-yellow-400 pl-3 text-xl font-bold text-white mb-4"
          >
            ⭐ Top Rated
          </motion.h2>

          <AnimatePresence mode="wait">
            <motion.div
              key="toprated-movies"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
            >
              {homeLoading ? (
                <SkeletonRow />
              ) : (
                <div className="flex overflow-hidden relative w-full group">
                  <div className="flex gap-4 w-max animate-marquee pb-4">
                    {topRatedMovies.length === 0 ? (
                      <p className="text-gray-600 text-sm py-8">No movies available.</p>
                    ) : (
                      <>
                        {topRatedMovies.map((movie, i) => (
                          <div key={`top1-${movie.title}-${i}`} className="w-44 lg:w-48 shrink-0">
                            <MovieCard movie={movie} index={i} compact />
                          </div>
                        ))}
                        {/* Duplicate for infinite loop */}
                        {topRatedMovies.map((movie, i) => (
                          <div key={`top2-${movie.title}-${i}`} className="w-44 lg:w-48 shrink-0">
                            <MovieCard movie={movie} index={i} compact />
                          </div>
                        ))}
                      </>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </section>

        {/* ── Static Genre Grids ── */}
        {GENRES.map(genre => {
          if (genre === 'All') return null;
          const movies = homeData.by_genre ? homeData.by_genre[genre] || [] : [];
          if (movies.length === 0) return null;

          return <GenreCarousel key={genre} genre={genre} movies={movies} />;
        })}

            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
