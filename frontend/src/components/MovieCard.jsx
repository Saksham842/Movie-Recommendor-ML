import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

export default function MovieCard({ movie, index = 0 }) {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/movie/${encodeURIComponent(movie.title)}`);
  };

  return (
    <motion.div
      onClick={handleClick}
      className="movie-card bg-gray-900 rounded-xl p-4 cursor-pointer border border-white/5 group opacity-0"
      whileHover={{ scale: 1.04, y: -4 }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
      {/* Poster Placeholder */}
      <div className="aspect-[2/3] w-full bg-gray-800 rounded-lg mb-4 overflow-hidden relative flex items-center justify-center">
        <div className="text-center p-4">
          <span className="text-4xl mb-2 block">🎬</span>
          <span className="text-xs text-gray-400 font-medium leading-tight line-clamp-2">{movie.title}</span>
        </div>
        {movie.similarity_score !== undefined && (
          <div className="absolute top-2 right-2">
            <motion.span
              className="bg-[#f5c518] text-gray-950 text-xs font-black px-2 py-1 rounded-md"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: index * 0.05 + 0.3, type: 'spring', stiffness: 260 }}
            >
              {movie.similarity_score}% match
            </motion.span>
          </div>
        )}
      </div>

      {/* Info */}
      <h3 className="font-semibold text-white text-sm leading-snug mb-1 group-hover:text-[#f5c518] transition-colors line-clamp-2">
        {movie.title}
      </h3>
      {movie.genre && (
        <p className="text-xs text-gray-500 line-clamp-1">{movie.genre}</p>
      )}
      {movie.overview && (
        <p className="text-xs text-gray-500 mt-2 line-clamp-2 leading-relaxed">{movie.overview}</p>
      )}
    </motion.div>
  );
}
