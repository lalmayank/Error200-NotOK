/**
 * Navbar.jsx
 * Sticky glassmorphic navigation with responsive mobile menu
 * Implements: Glassmorphism, micro-interactions, responsive design
 */

import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location]);

  const navLinks = [
    { label: 'Features', href: '#features' },
    { label: 'Engine', href: '#engine' },
    { label: 'About', href: '#about' },
  ];

  return (
    <motion.nav
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? 'bg-slate-950/70 backdrop-blur-xl border-b border-white/[0.06] shadow-[0_4px_30px_rgba(0,0,0,0.4)]'
          : 'bg-transparent border-b border-transparent'
      }`}
      id="main-navbar"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-18">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group" id="nav-logo">
            {/* Logo mark */}
            <div className="relative w-9 h-9">
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-violet-500 to-cyan-400 opacity-80 group-hover:opacity-100 transition-opacity duration-300 blur-[1px]" />
              <div className="relative w-full h-full rounded-xl bg-gradient-to-br from-violet-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-violet-500/20">
                <span className="text-white font-black text-sm tracking-tight">L</span>
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-white font-bold text-lg leading-none tracking-tight">
                Lucida
              </span>
              <span className="text-[9px] text-violet-300/50 tracking-[0.25em] uppercase font-medium leading-none mt-0.5">
                Typography Engine
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="px-4 py-2 text-sm text-slate-400 hover:text-white transition-colors duration-200 rounded-lg hover:bg-white/[0.04] font-medium"
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              to="/workspace"
              className="group relative px-5 py-2.5 rounded-xl text-sm font-semibold text-white overflow-hidden transition-all duration-300 hover:shadow-[0_0_30px_rgba(139,92,246,0.3)]"
              id="nav-workspace-cta"
            >
              {/* Button gradient bg */}
              <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-cyan-500 rounded-xl" />
              {/* Shimmer overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
              <span className="relative z-10 flex items-center gap-2">
                Go to Workspace
                <svg className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </span>
            </Link>
          </div>

          {/* Mobile Hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden relative w-10 h-10 flex items-center justify-center rounded-lg hover:bg-white/[0.05] transition-colors"
            aria-label="Toggle menu"
            id="mobile-menu-toggle"
          >
            <div className="flex flex-col gap-1.5 w-5">
              <motion.span
                animate={mobileMenuOpen ? { rotate: 45, y: 5 } : { rotate: 0, y: 0 }}
                className="block h-0.5 w-full bg-white/70 rounded-full origin-center"
                transition={{ duration: 0.25 }}
              />
              <motion.span
                animate={mobileMenuOpen ? { opacity: 0, x: 8 } : { opacity: 1, x: 0 }}
                className="block h-0.5 w-full bg-white/70 rounded-full"
                transition={{ duration: 0.2 }}
              />
              <motion.span
                animate={mobileMenuOpen ? { rotate: -45, y: -7 } : { rotate: 0, y: 0 }}
                className="block h-0.5 w-full bg-white/70 rounded-full origin-center"
                transition={{ duration: 0.25 }}
              />
            </div>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="md:hidden overflow-hidden bg-slate-950/90 backdrop-blur-xl border-t border-white/[0.06]"
            id="mobile-menu-panel"
          >
            <div className="px-4 py-4 space-y-1">
              {navLinks.map((link, i) => (
                <motion.a
                  key={link.label}
                  href={link.href}
                  initial={{ x: -16, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: i * 0.06 }}
                  className="block px-4 py-3 text-slate-300 hover:text-white hover:bg-white/[0.04] rounded-lg text-sm font-medium transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.label}
                </motion.a>
              ))}
              <div className="pt-3 mt-2 border-t border-white/[0.06]">
                <Link
                  to="/workspace"
                  className="block w-full text-center px-4 py-3 bg-gradient-to-r from-violet-600 to-cyan-500 rounded-xl text-white text-sm font-semibold"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Go to Workspace →
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}

export default Navbar;
