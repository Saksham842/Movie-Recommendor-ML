import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  Cell, PieChart, Pie, Legend
} from 'recharts';
import { Loader2 } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const API = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
const GOLD = '#f5c518';

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

const Skeleton = ({ className }) => (
  <div className={`animate-pulse bg-white/5 rounded-xl ${className}`} />
);

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div className="bg-gray-900 border border-white/10 rounded-lg px-3 py-2 text-xs">
        <span className="text-white font-semibold">{label || payload[0].name}</span>
        <br />
        <span className="text-[#f5c518]">{payload[0].value}{payload[0].name === 'score' ? '' : ' movies'}</span>
      </div>
    );
  }
  return null;
};

// A single chart section that GSAP ScrollTrigger fades + slides up
function ChartSection({ title, description, children, refEl }) {
  return (
    <div ref={refEl} className="chart-section opacity-0 translate-y-10 mb-20">
      <h2 className="text-2xl font-bold text-white mb-2">{title}</h2>
      <p className="text-gray-500 text-sm leading-relaxed mb-8 max-w-2xl">{description}</p>
      <div className="bg-gray-900 rounded-2xl p-6 border border-white/5">
        {children}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const section1Ref = useRef(null);
  const section2Ref = useRef(null);
  const section3Ref = useRef(null);

  useEffect(() => {
    async function fetchDashboard() {
      try {
        const res = await fetch(`${API}/dashboard`);
        const json = await res.json();
        setData(json);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    fetchDashboard();
  }, []);

  // GSAP ScrollTrigger for each chart section
  useEffect(() => {
    if (!data) return;
    const sections = [section1Ref.current, section2Ref.current, section3Ref.current];
    const ctx = gsap.context(() => {
      sections.forEach((el) => {
        if (!el) return;
        gsap.to(el, {
          opacity: 1,
          y: 0,
          duration: 0.7,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: el,
            start: 'top 82%',
          },
        });
      });
    });
    return () => ctx.revert();
  }, [data]);

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.4 }}>
      <div className="max-w-5xl mx-auto px-6 pt-28 pb-20">
        {/* Header */}
        <div className="mb-16">
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-[#f5c518] text-sm font-bold uppercase tracking-widest"
          >
            Under the Hood
          </motion.span>
          <h1 className="text-5xl font-black text-white mt-2 mb-4 leading-tight">
            How the ML<br />Engine Works
          </h1>
          <p className="text-gray-400 max-w-xl leading-relaxed">
            Three interactive visualizations showing exactly what TF-IDF learned from 5,000 movies — the vocabulary it values, the genre landscape, and similarity scores it computed in real time.
          </p>
        </div>

        {loading ? (
          <div className="space-y-8">
            <Skeleton className="h-72 w-full" />
            <Skeleton className="h-72 w-full" />
            <Skeleton className="h-72 w-full" />
          </div>
        ) : !data || Object.keys(data).length === 0 ? (
          <div className="text-center py-24 text-gray-500">
            <Loader2 className="w-10 h-10 animate-spin mx-auto mb-4 text-[#f5c518]" />
            <p>Dashboard needs the dataset loaded. Run <code className="text-[#f5c518]">preprocess.py</code> first.</p>
          </div>
        ) : (
          <>
            {/* ── Chart 1: Inception Similarity ── */}
            <ChartSection
              refEl={section1Ref}
              title='Similarity Scores — "Inception"'
              description='TF-IDF found these 10 films most similar to Inception. The scores represent cosine similarity (0–100) of the combined genre + cast + director + overview word vectors. Higher = more overlapping unique vocabulary.'
            >
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={(data.inception_sims || []).map(r => ({ title: r.title.slice(0, 16) + (r.title.length > 16 ? '…' : ''), score: r.similarity_score }))} layout="vertical">
                  <XAxis type="number" domain={[0, 100]} tick={{ fill: '#6b7280', fontSize: 11 }} tickFormatter={v => `${v}%`} />
                  <YAxis type="category" dataKey="title" tick={{ fill: '#d1d5db', fontSize: 11 }} width={130} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="score" radius={[0, 6, 6, 0]} maxBarSize={22}>
                    {(data.inception_sims || []).map((_, i) => (
                      <Cell key={i} fill={i === 0 ? GOLD : `rgba(245,197,24,${Math.max(0.15, 0.9 - i * 0.08)})`} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartSection>

            {/* ── Chart 2: Top Word Frequencies ── */}
            <ChartSection
              refEl={section2Ref}
              title="Top 10 TF-IDF Words Across All Movies"
              description="These words appear most frequently across all 5,000 movie soups (after stop-word removal). Words like character names and genre labels tend to dominate — they're rare in real life but common in cinematic vocabulary."
            >
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={data.global_word_frequencies || []}>
                  <XAxis dataKey="word" tick={{ fill: '#9ca3af', fontSize: 11 }} />
                  <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="score" fill={GOLD} radius={[6, 6, 0, 0]} maxBarSize={50} />
                </BarChart>
              </ResponsiveContainer>
            </ChartSection>

            {/* ── Chart 3: Genre Distribution ── */}
            <ChartSection
              refEl={section3Ref}
              title="Top 10 Genres in the Dataset"
              description="Drama and Comedy dominate the TMDB 5000 dataset. This matters for recommendations — when a movie belongs to a rare genre, TF-IDF relies more heavily on cast overlap and plot keywords than genre labels."
            >
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data.genre_counts || []}>
                  <XAxis dataKey="genre" tick={{ fill: '#9ca3af', fontSize: 11 }} />
                  <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="count" fill={GOLD} radius={[6, 6, 0, 0]} maxBarSize={50}>
                    {(data.genre_counts || []).map((_, i) => (
                      <Cell key={i} fill={i === 0 ? GOLD : `rgba(245,197,24,${Math.max(0.15, 0.9 - i * 0.08)})`} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartSection>
          </>
        )}
      </div>
    </motion.div>
  );
}
