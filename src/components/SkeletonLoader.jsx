/**
 * SkeletonLoader.jsx
 * Pulsing skeleton loader simulating the "Rehydrating Corpus" phase
 * Used as both a functional loader and a visual asset on the landing page
 */

import React from 'react';
import { motion } from 'framer-motion';

const shimmerLine = (width, delay = 0) => (
  <motion.div
    className="h-3 rounded-full bg-white/[0.06]"
    style={{ width }}
    initial={{ opacity: 0, x: -8 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay: 0.15 + delay * 0.08, duration: 0.5, ease: 'easeOut' }}
  >
    <div className="h-full rounded-full bg-gradient-to-r from-transparent via-white/[0.07] to-transparent animate-[shimmer_2s_infinite] bg-[length:200%_100%]" />
  </motion.div>
);

export function SkeletonLoader({ className = '' }) {
  return (
    <div
      className={`bg-slate-900/60 backdrop-blur-md rounded-2xl border border-white/[0.06] p-6 overflow-hidden ${className}`}
      role="status"
      aria-label="Loading content"
    >
      {/* Header skeleton */}
      <div className="flex items-center gap-3 mb-6">
        <motion.div
          className="w-10 h-10 rounded-xl bg-white/[0.06] animate-pulse"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
        />
        <div className="flex-1 space-y-2">
          {shimmerLine('60%', 0)}
          {shimmerLine('40%', 1)}
        </div>
      </div>

      {/* Status bar */}
      <motion.div
        className="flex items-center gap-2 mb-5 px-3 py-2 rounded-lg bg-violet-500/[0.06] border border-violet-400/[0.08]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        <div className="w-2 h-2 rounded-full bg-violet-400/60 animate-pulse" />
        <span className="text-[10px] tracking-[0.2em] uppercase text-violet-300/50 font-medium">
          Rehydrating Corpus…
        </span>
      </motion.div>

      {/* Text block skeleton lines */}
      <div className="space-y-3">
        {shimmerLine('100%', 2)}
        {shimmerLine('92%', 3)}
        {shimmerLine('85%', 4)}
        {shimmerLine('96%', 5)}
        {shimmerLine('70%', 6)}
        {shimmerLine('88%', 7)}
        {shimmerLine('50%', 8)}
      </div>

      {/* Bottom controls skeleton */}
      <div className="mt-6 pt-4 border-t border-white/[0.04] flex gap-3">
        <motion.div
          className="h-8 flex-1 rounded-lg bg-white/[0.04] animate-pulse"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        />
        <motion.div
          className="h-8 w-20 rounded-lg bg-white/[0.04] animate-pulse"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
        />
      </div>
    </div>
  );
}

export default SkeletonLoader;
