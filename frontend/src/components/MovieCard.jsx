import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { gsap } from 'gsap';

// ADD THIS — accept onClick (for modal) and compact (for horizontal grid rows) props
export default function MovieCard({ movie, index = 0, onClick, compact = false }) {
  const navigate = useNavigate();
  const badgeRef = useRef(null);
  
  // Custom fetch for poster images since the dataset doesn't include poster_path
  const [posterPath, setPosterPath] = useState(movie.poster_path || null);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    if (!posterPath && !imgError && movie.title) {
      // Using a standard public dummy TMDB key for tutorial/portfolio projects
      fetch(`https://api.themoviedb.org/3/search/movie?api_key=4e44d9029b1270a757cddc766a1bcb63&query=${encodeURIComponent(movie.title)}`)
        .then(res => res.json())
        .then(data => {
            if (data.results && data.results.length > 0 && data.results[0].poster_path) {
                setPosterPath(data.results[0].poster_path);
            } else {
                setImgError(true);
            }
        })
        .catch(() => setImgError(true));
    }
  }, [movie.title, posterPath, imgError]);

  // ADD THIS — GSAP count-up on similarity score badge
  useEffect(() => {
    if (movie.similarity_score === undefined || !badgeRef.current) return;
    const counter = { val: 0 };
    const tween = gsap.to(counter, {
      val: movie.similarity_score,
      duration: 1.2,
      delay: index * 0.05,
      ease: 'power2.out',
      onUpdate: () => {
        if (badgeRef.current) {
          badgeRef.current.textContent = Math.round(counter.val) + '% match';
        }
      },
    });
    return () => tween.kill();
  }, [movie.similarity_score, index]);
  // END ADD

  const handleClick = () => {
    // ADD THIS — prefer modal callback if provided, else navigate
    if (onClick) {
      onClick(movie);
    } else {
      navigate(`/movie/${encodeURIComponent(movie.title)}`);
    }
    // END ADD
  };

  return (
    <motion.div
      onClick={handleClick}
      className={`movie-card relative aspect-[2/3] w-full bg-gray-900 rounded-md overflow-hidden cursor-pointer group shadow-lg ${compact ? '' : 'opacity-0'} origin-center flex items-center justify-center`}
      whileHover={{ scale: 1.08, zIndex: 30 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
    >
      {/* Dynamic Image / Placeholder */}
      {posterPath && !imgError ? (
        <img 
          src={`https://image.tmdb.org/t/p/w500${posterPath}`} 
          alt={movie.title} 
          className="absolute inset-0 w-full h-full object-cover"
          onError={() => setImgError(true)}
          loading="lazy"
        />
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-4 bg-gray-800">
          <span className="text-4xl mb-2 block">🎬</span>
          <span className="text-xs text-gray-400 font-medium leading-tight line-clamp-3 text-center">{movie.title}</span>
        </div>
      )}

      {/* Netflix-style Bottom Gradient Overlay (visible on hover) */}
      <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
        
        <h3 className="font-bold text-white text-base leading-snug mb-1 drop-shadow-md">
          {movie.title}
        </h3>
        
        <div className="flex items-center gap-2 mb-2">
          {movie.vote_average > 0 && (
            <span className="text-xs text-green-500 font-bold drop-shadow-md">{Math.round(movie.vote_average * 10)}% Match</span>
          )}
          <span className="border border-gray-400 text-gray-300 text-[10px] px-1 rounded-sm">HD</span>
        </div>

        <div className="flex flex-wrap gap-1.5 text-[10px] text-gray-300 font-medium">
          {(() => {
            const genresStr = movie.genre || movie.genres || '';
            const list = typeof genresStr === 'string' ? genresStr.split(',').slice(0, 3) : [];
            return list.map((g, i) => (
              <React.Fragment key={i}>
                <span>{g.trim()}</span>
                {i < list.length - 1 && <span className="text-gray-600">•</span>}
              </React.Fragment>
            ));
          })()}
        </div>

      </div>

      {/* Persistent Top-Right Similarity Badge (if from search/recomendation) */}
      {movie.similarity_score !== undefined && (
        <div className="absolute top-2 right-2 opacity-100 transition-opacity duration-300">
          <motion.span
            ref={badgeRef}
            className="bg-[#f5c518] text-gray-950 text-xs font-black px-2 py-1 rounded shadow-lg block"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: index * 0.05 + 0.3, type: 'spring', stiffness: 260 }}
          >
            0% Match
          </motion.span>
        </div>
      )}
    </motion.div>
  );
}
