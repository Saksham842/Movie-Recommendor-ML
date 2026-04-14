import React, { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { gsap } from 'gsap';
import { Loader2, X, ChevronDown, ChevronUp } from 'lucide-react';
import MovieCard from './MovieCard';

const API = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};

const panelVariants = {
  hidden: { y: 80, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { type: 'spring', damping: 28, stiffness: 220 } },
  exit: { y: 80, opacity: 0, transition: { duration: 0.2 } },
};

const chipContainerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const chipVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { opacity: 1, scale: 1 },
};

export default function MovieModal({ movie, onClose }) {
  const [recs, setRecs] = useState([]);
  const [recsLoading, setRecsLoading] = useState(false);
  const [features, setFeatures] = useState([]);
  const [featuresLoading, setFeaturesLoading] = useState(false);
  const [whyOpen, setWhyOpen] = useState(false);
  const [searched, setSearched] = useState(false);
  const simRefs = useRef({});

  // ── ESC key to close ─────────────────────────────────────────────────────
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  // ── Count-up animation for similarity badges ──────────────────────────────
  // (Now handled natively by MovieCard for recommendations)

  // ── Fetch similar movies ─────────────────────────────────────────────────
  const findSimilar = async () => {
    setRecsLoading(true);
    setSearched(true);
    try {
      const res = await fetch(`${API}/recommend?title=${encodeURIComponent(movie.title)}`);
      const data = await res.json();
      setRecs(data.recommendations || []);
    } catch {
      setRecs([]);
    } finally {
      setRecsLoading(false);
    }
  };

  // ── Fetch TF-IDF features ─────────────────────────────────────────────────
  const loadFeatures = useCallback(async () => {
    if (features.length) return;
    setFeaturesLoading(true);
    try {
      const res = await fetch(`${API}/movie/${encodeURIComponent(movie.title)}`);
      const data = await res.json();
      setFeatures(data.top_features || []);
    } catch {
      setFeatures([]);
    } finally {
      setFeaturesLoading(false);
    }
  }, [movie.title, features.length]);

  const handleWhyToggle = () => {
    const next = !whyOpen;
    setWhyOpen(next);
    if (next) loadFeatures();
  };

  // ── Animate badges after recs load ──────────────────────────────────────
  // (Now handled natively by MovieCard for recommendations)

  const genres = movie.genres
    ? (typeof movie.genres === 'string' ? movie.genres.split(', ') : movie.genres)
    : [];

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center">
      {/* Backdrop */}
      <motion.div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        variants={backdropVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        onClick={onClose}
      />

      {/* Panel */}
      <motion.div
        className="relative bg-gray-900 rounded-t-2xl md:rounded-2xl w-full md:max-w-2xl max-h-[85vh] overflow-y-auto p-6 z-10 shadow-2xl border border-white/10"
        variants={panelVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
      >
        {/* Close button */}
        <button
          id="modal-close-btn"
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title */}
        <h2 className="text-2xl font-bold text-white pr-8 mb-3">{movie.title}</h2>

        {/* Vote average */}
        {movie.vote_average > 0 && (
          <p className="text-[#f5c518] font-semibold mb-3">
            ⭐ {movie.vote_average} / 10
          </p>
        )}

        {/* Genre chips */}
        {genres.length > 0 && (
          <motion.div
            className="flex flex-wrap gap-2 mb-4"
            variants={chipContainerVariants}
            initial="hidden"
            animate="visible"
          >
            {genres.map(g => (
              <motion.span
                key={g}
                variants={chipVariants}
                className="px-3 py-1 rounded-full text-xs border border-yellow-400/50 text-yellow-400 font-medium"
              >
                {g.trim()}
              </motion.span>
            ))}
          </motion.div>
        )}

        {/* Overview */}
        {movie.overview && (
          <p className="text-gray-300 text-sm leading-relaxed mb-4">{movie.overview}</p>
        )}

        <hr className="border-white/10 mb-4" />

        {/* Find Similar button */}
        <motion.button
          id="find-similar-btn"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={findSimilar}
          disabled={recsLoading}
          className="w-full bg-yellow-400 text-gray-950 font-bold py-3 rounded-xl mb-5 flex items-center justify-center gap-2 hover:bg-yellow-300 transition-colors disabled:opacity-60"
        >
          {recsLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : '🎬'}
          {recsLoading ? 'Finding similar movies...' : 'Find Similar Movies'}
        </motion.button>

        {/* Similar results */}
        <AnimatePresence>
          {searched && !recsLoading && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mb-5"
            >
              {recs.length === 0 ? (
                <p className="text-gray-500 text-sm text-center py-4">No recommendations found for this movie.</p>
              ) : (
                <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2">
                  {recs.map((rec, i) => (
                    <div key={rec.title + i} className="shrink-0 w-40">
                      <MovieCard movie={rec} index={i} compact={true} />
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Why these? — collapsible */}
        <div>
          <button
            id="why-these-toggle"
            onClick={handleWhyToggle}
            className="flex items-center gap-2 font-semibold text-yellow-400 cursor-pointer text-sm hover:text-yellow-300 transition-colors mb-2"
          >
            {whyOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            Why these? (TF-IDF keywords)
          </button>
          <motion.div
            animate={{ height: whyOpen ? 'auto' : 0 }}
            style={{ overflow: 'hidden' }}
            transition={{ type: 'spring', stiffness: 200, damping: 25 }}
          >
            {featuresLoading ? (
              <div className="flex items-center gap-2 text-gray-500 text-sm py-2">
                <Loader2 className="w-4 h-4 animate-spin" /> Loading keywords...
              </div>
            ) : (
              <div className="flex flex-wrap gap-2 py-2">
                {features.map(f => (
                  <span key={f} className="px-3 py-1 rounded-full text-xs bg-yellow-400/10 border border-yellow-400/30 text-yellow-400 font-medium">
                    {f}
                  </span>
                ))}
                {features.length === 0 && whyOpen && !featuresLoading && (
                  <p className="text-gray-600 text-xs">No keyword data available.</p>
                )}
              </div>
            )}
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
