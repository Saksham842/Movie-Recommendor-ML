import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { gsap } from 'gsap';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { ArrowLeft, Brain, Zap } from 'lucide-react';
import MovieCard from '../components/MovieCard';

const API = 'http://localhost:8000';
const TMDB_KEY = '4e44d9029b1270a757cddc766a1bcb63';
const GOLD = '#f5c518';

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

// Skeleton loader
const Skeleton = ({ className }) => (
  <div className={`animate-pulse bg-white/5 rounded-lg ${className}`} />
);

// Genre chip variants for staggered animation
const chipContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};
const chipItem = {
  hidden: { opacity: 0, scale: 0.7, y: 10 },
  show: { opacity: 1, scale: 1, y: 0, transition: { type: 'spring', stiffness: 220 } },
};

// Custom tooltip for Recharts
const CustomTooltip = ({ active, payload }) => {
  if (active && payload?.length) {
    return (
      <div className="bg-gray-900 border border-white/10 rounded-lg px-3 py-2 text-xs">
        <span className="text-white font-semibold">{payload[0].payload.title}</span>
        <br />
        <span className="text-[#f5c518]">{payload[0].value}% match</span>
      </div>
    );
  }
  return null;
};

export default function MovieDetail() {
  const { title } = useParams();
  const navigate = useNavigate();
  const decodedTitle = decodeURIComponent(title);

  const [movie, setMovie] = useState(null);
  const [recs, setRecs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [posterUrl, setPosterUrl] = useState(null);

  const barsRef = useRef(null);
  const chartDataRef = useRef([]);

  useEffect(() => {
    window.scrollTo(0, 0);
    async function fetchData() {
      setLoading(true);
      try {
        const [detailRes, recRes] = await Promise.all([
          fetch(`${API}/movie/${encodeURIComponent(decodedTitle)}`),
          fetch(`${API}/recommend?title=${encodeURIComponent(decodedTitle)}`),
        ]);
        const detail = await detailRes.json();
        const recData = await recRes.json();
        setMovie(detail);
        setRecs(recData.recommendations || []);

        // Fetch actual poster from TMDB if available
        const tmdbRes = await fetch(`https://api.themoviedb.org/3/search/movie?api_key=${TMDB_KEY}&query=${encodeURIComponent(decodedTitle)}`);
        const tmdbData = await tmdbRes.json();
        if (tmdbData.results?.length > 0) {
          const mainResult = tmdbData.results[0];
          setPosterUrl(`https://image.tmdb.org/t/p/w500${mainResult.poster_path}`);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [decodedTitle]);

  // --- GSAP: animate chart bars width from 0 ---
  useEffect(() => {
    if (!recs.length) return;
    // Wait for chart to paint then animate
    const timer = setTimeout(() => {
      const bars = document.querySelectorAll('.recharts-bar-rectangle');
      if (bars.length) {
        gsap.from(bars, { scaleX: 0, transformOrigin: 'left center', duration: 0.8, stagger: 0.06, ease: 'power3.out' });
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [recs]);

  const chartData = recs.slice(0, 10).map((r) => ({
    title: r.title, // No longer truncating names
    score: r.similarity_score,
  }));

  if (loading) {
    return (
      <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" className="pt-24 max-w-6xl mx-auto px-6 py-12">
        <Skeleton className="h-8 w-32 mb-8" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-1"><Skeleton className="h-80 w-full" /></div>
          <div className="md:col-span-2 space-y-4">
            <Skeleton className="h-10 w-2/3" />
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-24 w-full" />
          </div>
        </div>
      </motion.div>
    );
  }

  if (!movie) return (
    <div className="pt-32 text-center text-gray-400">
      <p>Movie not found. Make sure the dataset is loaded.</p>
      <button onClick={() => navigate('/')} className="mt-4 text-[#f5c518] hover:underline">← Back to search</button>
    </div>
  );

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.4 }}>
      <div className="max-w-6xl mx-auto px-6 pt-24 pb-20">

        {/* Back */}
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-500 hover:text-white transition-colors mb-10 group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm">Back</span>
        </button>

        {/* ── Top Section ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-16">
          {/* Movie Poster */}
          <div className="md:col-span-1">
            <div className="aspect-[2/3] bg-gray-900 rounded-2xl border border-white/5 overflow-hidden group shadow-2xl relative">
              {posterUrl ? (
                <img src={posterUrl} alt={movie.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-center p-6">
                  <span className="text-6xl block mb-3">🎬</span>
                  <span className="text-white font-bold text-sm leading-tight">{movie.title}</span>
                </div>
              )}
            </div>
          </div>

          {/* Details */}
          <div className="md:col-span-2 flex flex-col justify-center">
            <div className="flex items-center gap-4 mb-4">
              <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">{movie.title}</h1>
              {movie.vote_average > 0 && (
                <div className="bg-yellow-400 text-black px-3 py-1 rounded-lg font-black text-sm flex items-center shrink-0">
                  ⭐ {movie.vote_average}
                </div>
              )}
            </div>
            {movie.genre && (
              <p className="text-[#f5c518] font-semibold text-sm mb-5">{movie.genre}</p>
            )}
            <p className="text-gray-400 leading-relaxed mb-8">{movie.overview || 'No overview available.'}</p>

            {/* TF-IDF Keyword Chips with stagger */}
            {movie.top_features?.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-gray-600 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5" /> Top TF-IDF Keywords
                </p>
                <motion.div
                  variants={chipContainer}
                  initial="hidden"
                  animate="show"
                  className="flex flex-wrap gap-2"
                >
                  {movie.top_features.map((kw) => (
                    <motion.span
                      key={kw}
                      variants={chipItem}
                      className="glass px-3 py-1.5 rounded-full text-xs font-semibold text-[#f5c518] border border-[#f5c518]/20"
                    >
                      {kw}
                    </motion.span>
                  ))}
                </motion.div>
              </div>
            )}
          </div>
        </div>

        {/* ── Glassmorphism Explainer Card ── */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 120, damping: 15, delay: 0.3 }}
          className="glass rounded-2xl p-6 mb-14 flex gap-4 items-start"
        >
          <div className="bg-[#f5c518]/10 p-3 rounded-xl shrink-0">
            <Brain className="w-6 h-6 text-[#f5c518]" />
          </div>
          <div>
            <h3 className="text-white font-bold mb-2">Decoding the Recommendation DNA</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Our engine uses <strong className="text-white">TF-IDF (Term Frequency-Inverse Document Frequency)</strong> to analyze plot summaries, cast, and genres. 
              The <span className="text-[#f5c518] font-semibold">keywords above</span> are the most "defining" terms for <span className="text-white">"{movie.title}"</span>—meaning they appear frequently here but rarely in other films. 
              By calculating the <strong className="text-white">Cosine Similarity</strong> between these word signatures, we find movies that share the exact same cinematic fingerprints.
            </p>
          </div>
        </motion.div>

        {/* ── Recharts Similarity Bar Chart ── */}
        {recs.length > 0 && (
          <div className="mb-16">
            <h2 className="text-2xl font-bold text-white mb-2">Similarity Scores — Top 10 Recommendations</h2>
            <p className="text-gray-500 text-sm mb-8">Higher = more overlapping words in combined genre, cast, director, overview text.</p>
            <div ref={barsRef} className="bg-gray-900 rounded-2xl p-6 border border-white/5">
              <ResponsiveContainer width="100%" height={340}>
                <BarChart data={chartData} layout="vertical" margin={{ left: 20, right: 30 }}>
                  <XAxis type="number" domain={[0, 100]} tick={{ fill: '#6b7280', fontSize: 11 }} tickFormatter={(v) => `${v}%`} />
                  <YAxis type="category" dataKey="title" tick={{ fill: '#d1d5db', fontSize: 11 }} width={140} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="score" radius={[0, 6, 6, 0]} maxBarSize={24}>
                    {chartData.map((_, idx) => (
                      <Cell key={idx} fill={idx === 0 ? GOLD : `rgba(245,197,24,${0.9 - idx * 0.07})`} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* ── Recommended Cards ── */}
        {recs.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">Movies Like <span className="text-[#f5c518]">{movie.title}</span></h2>
            <p className="text-gray-500 text-sm mb-8">Ranked by cosine similarity on the TF-IDF feature space.</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
              {recs.map((rec, i) => (
                <MovieCard key={rec.title + i} movie={rec} index={i} />
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
