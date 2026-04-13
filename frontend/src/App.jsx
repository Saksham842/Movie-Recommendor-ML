import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import MovieDetail from './pages/MovieDetail';
import Dashboard from './pages/Dashboard';
// ADD THIS
import BackToTop from './components/BackToTop';
// END ADD

function App() {
  const location = useLocation();

  return (
    <div className="min-h-screen">
      <Navbar />
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<Home />} />
          <Route path="/movie/:title" element={<MovieDetail />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </AnimatePresence>
      {/* ADD THIS — rendered once outside all routes */}
      <BackToTop />
      {/* END ADD */}
    </div>
  );
}

export default App;
