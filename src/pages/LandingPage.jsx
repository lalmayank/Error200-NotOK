/**
 * LandingPage.jsx
 * Premium cinematic marketing page for Project Lucida
 * Implements: Antigravity floating animations, Bento Grid, Typography Hierarchy,
 *             Glassmorphism, Skeuomorphic CTA, Micro-interactions
 */

import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import { Navbar } from '../components/Navbar';
import { SkeletonLoader } from '../components/SkeletonLoader';

/* ─── Reusable Antigravity Float Wrapper ─── */
function Float({ children, delay = 0, distance = 10, duration = 6, className = '' }) {
  return (
    <motion.div
      animate={{ y: [0, -distance, 0] }}
      transition={{ repeat: Infinity, duration, delay, ease: 'easeInOut' }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ─── Section Reveal Wrapper ─── */
function Reveal({ children, className = '' }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-60px' });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ─── Animated orb decorator ─── */
function GlowOrb({ color = 'violet', size = 400, top, left, right, bottom, delay = 0 }) {
  const colorMap = {
    violet: 'from-violet-600/20 to-purple-800/5',
    cyan: 'from-cyan-500/15 to-blue-700/5',
    blue: 'from-blue-500/15 to-indigo-800/5',
  };

  return (
    <Float delay={delay} distance={15} duration={8}>
      <div
        className={`absolute rounded-full bg-gradient-radial ${colorMap[color]} blur-3xl pointer-events-none`}
        style={{
          width: size,
          height: size,
          top,
          left,
          right,
          bottom,
          background: `radial-gradient(circle, ${
            color === 'violet'
              ? 'rgba(139,92,246,0.15), rgba(88,28,135,0.02)'
              : color === 'cyan'
              ? 'rgba(6,182,212,0.12), rgba(29,78,216,0.02)'
              : 'rgba(59,130,246,0.12), rgba(67,56,202,0.02)'
          })`,
        }}
      />
    </Float>
  );
}

/* ─── Bento Feature Card ─── */
function BentoCard({ title, description, icon, accent = 'violet', className = '', children }) {
  const accentBorder = {
    violet: 'hover:border-violet-400/30 hover:shadow-[0_20px_50px_rgba(139,92,246,0.1)]',
    cyan: 'hover:border-cyan-400/30 hover:shadow-[0_20px_50px_rgba(6,182,212,0.1)]',
    blue: 'hover:border-blue-400/30 hover:shadow-[0_20px_50px_rgba(59,130,246,0.1)]',
    emerald: 'hover:border-emerald-400/30 hover:shadow-[0_20px_50px_rgba(52,211,153,0.1)]',
    amber: 'hover:border-amber-400/30 hover:shadow-[0_20px_50px_rgba(251,191,36,0.1)]',
  };

  const accentDot = {
    violet: 'bg-violet-400',
    cyan: 'bg-cyan-400',
    blue: 'bg-blue-400',
    emerald: 'bg-emerald-400',
    amber: 'bg-amber-400',
  };

  return (
    <motion.div
      whileHover={{ scale: 1.03, y: -4 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className={`group relative bg-white/[0.03] backdrop-blur-xl border border-white/[0.07] rounded-3xl p-6 md:p-8 transition-all duration-500 cursor-default ${accentBorder[accent]} ${className}`}
    >
      {/* Subtle gradient on hover */}
      <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

      <div className="relative z-10">
        {/* Icon dot + label */}
        <div className="flex items-center gap-2.5 mb-4">
          <div className={`w-2 h-2 rounded-full ${accentDot[accent]}`} />
          <span className="text-[10px] tracking-[0.2em] uppercase text-slate-500 font-semibold">
            {icon}
          </span>
        </div>

        <h3 className="text-xl md:text-2xl font-bold text-white mb-2 tracking-tight">
          {title}
        </h3>
        <p className="text-sm text-slate-400 leading-relaxed">
          {description}
        </p>
        {children}
      </div>
    </motion.div>
  );
}

/* ─── Main Landing Page ─── */
export function LandingPage() {
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });
  const heroOpacity = useTransform(scrollYProgress, [0, 1], [1, 0]);
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 120]);

  return (
    <div className="min-h-screen bg-slate-950 text-white overflow-x-hidden">
      <Navbar />

      {/* ════════════════════════════════════════════
          HERO SECTION
          ════════════════════════════════════════════ */}
      <section
        ref={heroRef}
        className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 overflow-hidden"
        id="hero"
      >
        {/* Background orbs */}
        <GlowOrb color="violet" size={600} top="-10%" left="-10%" delay={0} />
        <GlowOrb color="cyan" size={450} top="20%" right="-8%" delay={2} />
        <GlowOrb color="blue" size={350} bottom="10%" left="20%" delay={4} />

        {/* Grid pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
            backgroundSize: '64px 64px',
          }}
        />

        {/* Hero content */}
        <motion.div
          style={{ opacity: heroOpacity, y: heroY }}
          className="relative z-10 text-center max-w-5xl mx-auto"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.08] mb-8"
          >
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[11px] tracking-[0.15em] uppercase text-slate-400 font-medium">
              v1.0 — Production Ready
            </span>
          </motion.div>

          {/* Massive headline – Typography Hierarchy */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="text-5xl sm:text-6xl md:text-8xl font-black tracking-tight leading-[0.9] mb-6"
          >
            <span className="block text-white">Read at the</span>
            <span className="block bg-gradient-to-r from-violet-400 via-cyan-300 to-blue-400 bg-clip-text text-transparent">
              Speed of Thought
            </span>
          </motion.h1>

          {/* Subtitle – clean sans-serif, wide tracking */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55, duration: 0.7 }}
            className="text-sm sm:text-base md:text-lg tracking-widest text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed font-light"
          >
            A high-performance typography engine with rAF-batched rendering,
            tokenized corpus highlighting, and WCAG-compliant adaptive optics.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.6 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            {/* Primary CTA – Skeuomorphic 3D pressed button */}
            <Link
              to="/workspace"
              className="group relative inline-flex items-center gap-2 px-8 py-4 rounded-2xl text-base font-bold text-white overflow-hidden transition-all duration-300 hover:shadow-[0_0_40px_rgba(139,92,246,0.35)] active:scale-[0.97]"
              id="hero-cta-primary"
              style={{
                background: 'linear-gradient(145deg, #7c3aed, #6d28d9)',
                boxShadow:
                  'inset 0 1px 1px rgba(255,255,255,0.15), inset 0 -2px 4px rgba(0,0,0,0.3), 0 8px 32px rgba(139,92,246,0.25), 0 2px 8px rgba(0,0,0,0.4)',
              }}
            >
              {/* Shimmer sweep */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.08] to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
              <span className="relative z-10">Launch Workspace</span>
              <svg
                className="relative z-10 w-5 h-5 transition-transform duration-300 group-hover:translate-x-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>

            {/* Secondary CTA */}
            <a
              href="#features"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl text-sm font-medium text-slate-300 border border-white/[0.08] hover:border-white/20 hover:bg-white/[0.03] transition-all duration-300"
              id="hero-cta-secondary"
            >
              Explore Features
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </a>
          </motion.div>

          {/* Floating demo preview */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="mt-16 md:mt-20 relative max-w-3xl mx-auto"
          >
            <Float distance={8} duration={7}>
              <div className="relative">
                {/* Glow behind */}
                <div className="absolute -inset-4 bg-gradient-to-r from-violet-600/10 via-cyan-500/10 to-blue-600/10 rounded-3xl blur-2xl" />

                {/* The skeleton loader preview */}
                <SkeletonLoader className="relative" />

                {/* Floating badge */}
                <motion.div
                  animate={{ y: [0, -6, 0] }}
                  transition={{ repeat: Infinity, duration: 4, delay: 1 }}
                  className="absolute -top-4 -right-4 md:-right-6 px-3 py-1.5 bg-emerald-500/20 border border-emerald-400/20 rounded-full text-emerald-300 text-[10px] tracking-[0.15em] uppercase font-semibold backdrop-blur-md"
                >
                  60fps
                </motion.div>

                <motion.div
                  animate={{ y: [0, -5, 0] }}
                  transition={{ repeat: Infinity, duration: 5, delay: 2 }}
                  className="absolute -bottom-3 -left-3 md:-left-5 px-3 py-1.5 bg-violet-500/20 border border-violet-400/20 rounded-full text-violet-300 text-[10px] tracking-[0.15em] uppercase font-semibold backdrop-blur-md"
                >
                  WCAG AA+
                </motion.div>
              </div>
            </Float>
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2, duration: 1 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="w-5 h-8 rounded-full border border-white/20 flex items-start justify-center pt-1.5"
          >
            <div className="w-1 h-2 rounded-full bg-white/40" />
          </motion.div>
        </motion.div>
      </section>

      {/* ════════════════════════════════════════════
          FEATURES / BENTO GRID SECTION
          ════════════════════════════════════════════ */}
      <section className="relative py-24 md:py-32 px-4 sm:px-6" id="features">
        {/* Section bg orbs */}
        <GlowOrb color="cyan" size={500} top="10%" right="-5%" delay={1} />
        <GlowOrb color="violet" size={400} bottom="20%" left="-8%" delay={3} />

        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <Reveal className="text-center mb-16 md:mb-20">
            <span className="inline-block text-[10px] tracking-[0.3em] uppercase text-violet-400/70 font-semibold mb-4">
              Engineered for Excellence
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-6xl font-black tracking-tight text-white mb-4">
              Every Pixel,{' '}
              <span className="bg-gradient-to-r from-violet-400 to-cyan-300 bg-clip-text text-transparent">
                Intentional
              </span>
            </h2>
            <p className="text-slate-400 max-w-xl mx-auto tracking-wide text-sm md:text-base">
              Built from first principles with performance as the foundation.
            </p>
          </Reveal>

          {/* Bento Grid – Asymmetrical Apple-style layout */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5 auto-rows-[minmax(180px,auto)]">
            {/* Card 1 – rAF Scheduling (large, spans 2 cols) */}
            <Reveal className="md:col-span-2 lg:col-span-2 md:row-span-2">
              <BentoCard
                title="rAF Scheduling"
                description="Every DOM mutation is batched through requestAnimationFrame. Zero layout thrashing. Buttery 60fps rendering even with thousands of tokens."
                icon="Performance"
                accent="violet"
                className="h-full"
              >
                {/* Mini visual: animated frame timeline */}
                <div className="mt-6 flex items-end gap-1 h-12">
                  {Array.from({ length: 20 }).map((_, i) => (
                    <motion.div
                      key={i}
                      className="flex-1 bg-gradient-to-t from-violet-500/40 to-violet-400/10 rounded-sm"
                      animate={{
                        height: ['30%', `${40 + Math.sin(i * 0.7) * 35}%`, '30%'],
                      }}
                      transition={{
                        repeat: Infinity,
                        duration: 2,
                        delay: i * 0.1,
                        ease: 'easeInOut',
                      }}
                      style={{ minHeight: 4 }}
                    />
                  ))}
                </div>
                <div className="mt-2 flex items-center justify-between text-[10px] text-slate-500">
                  <span>0ms</span>
                  <span className="text-violet-400/60">16.67ms/frame</span>
                  <span>333ms</span>
                </div>
              </BentoCard>
            </Reveal>

            {/* Card 2 – Tokenized Corpus */}
            <Reveal className="lg:col-span-2">
              <BentoCard
                title="Tokenized Corpus"
                description="Text is parsed into an immutable token stream with IDs, enabling O(1) lookups and instant word-by-word traversal."
                icon="Data Structure"
                accent="cyan"
                className="h-full"
              >
                {/* Token stream visual */}
                <div className="mt-5 flex flex-wrap gap-1.5">
                  {['The', 'typography', 'engine', 'optimizes', 'your', 'reading', 'flow'].map(
                    (word, i) => (
                      <motion.span
                        key={word}
                        initial={{ opacity: 0, scale: 0.8 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.06 }}
                        className={`px-2.5 py-1 rounded-md text-[11px] font-mono border ${
                          i === 2
                            ? 'bg-cyan-400/15 border-cyan-400/30 text-cyan-300'
                            : 'bg-white/[0.03] border-white/[0.06] text-slate-500'
                        }`}
                      >
                        <span className="text-slate-600 mr-1">{i}:</span>
                        {word}
                      </motion.span>
                    )
                  )}
                </div>
              </BentoCard>
            </Reveal>

            {/* Card 3 – WCAG Compliance */}
            <Reveal>
              <BentoCard
                title="WCAG AA+"
                description="Contrast ratios, focus indicators, and semantic ARIA roles baked in. Accessible by design."
                icon="Accessibility"
                accent="emerald"
                className="h-full"
              >
                <div className="mt-4 flex items-center gap-3">
                  <div className="flex -space-x-1">
                    {['bg-emerald-400', 'bg-emerald-500', 'bg-emerald-600'].map((c, i) => (
                      <div key={i} className={`w-5 h-5 rounded-full ${c} border-2 border-slate-950`} />
                    ))}
                  </div>
                  <span className="text-[10px] text-emerald-400/60 tracking-wide font-medium">4.5:1+</span>
                </div>
              </BentoCard>
            </Reveal>

            {/* Card 4 – Adaptive Optics */}
            <Reveal>
              <BentoCard
                title="Adaptive Optics"
                description="Real-time font size, letter-spacing, line-height, and luminance controls via CSS custom properties."
                icon="Typography"
                accent="blue"
                className="h-full"
              >
                <div className="mt-4 space-y-2">
                  {[
                    { label: 'Size', value: 65 },
                    { label: 'Spacing', value: 40 },
                    { label: 'Height', value: 80 },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center gap-2">
                      <span className="text-[10px] text-slate-600 w-12">{item.label}</span>
                      <div className="flex-1 h-1 bg-white/[0.04] rounded-full overflow-hidden">
                        <motion.div
                          className="h-full rounded-full bg-gradient-to-r from-blue-500/50 to-blue-400/30"
                          initial={{ width: 0 }}
                          whileInView={{ width: `${item.value}%` }}
                          viewport={{ once: true }}
                          transition={{ duration: 1, ease: 'easeOut' }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </BentoCard>
            </Reveal>

            {/* Card 5 – GPU-Accelerated (wide card) */}
            <Reveal className="md:col-span-2">
              <BentoCard
                title="GPU-Accelerated Transitions"
                description="All visual transitions leverage transform and opacity — composited by the GPU. No paint, no reflow, no jank."
                icon="Rendering"
                accent="amber"
                className="h-full"
              >
                <div className="mt-5 relative h-8 overflow-hidden rounded-lg bg-white/[0.02]">
                  <motion.div
                    className="absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-amber-500/20 via-amber-400/10 to-transparent rounded-lg"
                    animate={{ x: ['-100%', '400%'] }}
                    transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center text-[10px] text-amber-400/40 tracking-[0.2em] uppercase font-medium">
                    composite → paint → idle
                  </div>
                </div>
              </BentoCard>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════
          ENGINE SHOWCASE SECTION
          ════════════════════════════════════════════ */}
      <section className="relative py-24 md:py-32 px-4 sm:px-6" id="engine">
        <div className="max-w-5xl mx-auto">
          <Reveal className="text-center mb-16">
            <span className="inline-block text-[10px] tracking-[0.3em] uppercase text-cyan-400/70 font-semibold mb-4">
              Under the Hood
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white mb-4">
              Architecture That{' '}
              <span className="bg-gradient-to-r from-cyan-300 to-blue-400 bg-clip-text text-transparent">
                Breathes
              </span>
            </h2>
          </Reveal>

          {/* Pipeline visualization */}
          <Reveal>
            <div className="relative bg-white/[0.02] backdrop-blur-md border border-white/[0.06] rounded-3xl p-6 md:p-10">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
                {[
                  {
                    step: '01',
                    title: 'Tokenize',
                    desc: 'Raw text is split into an indexed token stream with unique IDs for each word.',
                    color: 'violet',
                  },
                  {
                    step: '02',
                    title: 'Schedule',
                    desc: 'DOM updates are batched via requestAnimationFrame to maintain 60fps compositing.',
                    color: 'cyan',
                  },
                  {
                    step: '03',
                    title: 'Render',
                    desc: 'CSS custom properties drive GPU-accelerated transitions with zero layout thrash.',
                    color: 'blue',
                  },
                ].map((item, i) => (
                  <motion.div
                    key={item.step}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.15, duration: 0.6 }}
                    className="text-center md:text-left"
                  >
                    <div
                      className={`inline-block text-5xl md:text-6xl font-black mb-3 bg-gradient-to-b from-${item.color}-400/40 to-transparent bg-clip-text text-transparent`}
                      style={{
                        backgroundImage: `linear-gradient(to bottom, ${
                          item.color === 'violet'
                            ? 'rgba(167,139,250,0.4)'
                            : item.color === 'cyan'
                            ? 'rgba(34,211,238,0.4)'
                            : 'rgba(96,165,250,0.4)'
                        }, transparent)`,
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                      }}
                    >
                      {item.step}
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2 tracking-tight">
                      {item.title}
                    </h3>
                    <p className="text-sm text-slate-400 leading-relaxed">{item.desc}</p>
                  </motion.div>
                ))}
              </div>

              {/* Pipeline arrows (desktop only) */}
              <div className="hidden md:flex absolute top-1/2 left-0 right-0 justify-around pointer-events-none px-20 -translate-y-1/2">
                {[0, 1].map((i) => (
                  <motion.svg
                    key={i}
                    width="40"
                    height="16"
                    viewBox="0 0 40 16"
                    className="text-white/10"
                    animate={{ x: [0, 4, 0] }}
                    transition={{ repeat: Infinity, duration: 2, delay: i * 0.5 }}
                  >
                    <path
                      d="M0 8h32M28 3l5 5-5 5"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </motion.svg>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ════════════════════════════════════════════
          FINAL CTA SECTION
          ════════════════════════════════════════════ */}
      <section className="relative py-24 md:py-32 px-4 sm:px-6" id="about">
        <GlowOrb color="violet" size={500} top="20%" left="30%" delay={0} />

        <div className="max-w-3xl mx-auto text-center relative z-10">
          <Reveal>
            <span className="inline-block text-[10px] tracking-[0.3em] uppercase text-violet-400/70 font-semibold mb-4">
              Ready?
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-6xl font-black tracking-tight text-white mb-6">
              Words Deserve{' '}
              <span className="bg-gradient-to-r from-violet-400 via-fuchsia-300 to-cyan-300 bg-clip-text text-transparent">
                Better
              </span>
            </h2>
            <p className="text-slate-400 text-sm md:text-base tracking-wide max-w-lg mx-auto mb-10 leading-relaxed">
              Step into a reading environment engineered for focus, clarity, and comfort. Your text. Our engine. Zero compromise.
            </p>

            {/* CTA */}
            <Link
              to="/workspace"
              className="group relative inline-flex items-center gap-3 px-10 py-5 rounded-2xl text-lg font-bold text-white overflow-hidden transition-all duration-300 hover:shadow-[0_0_50px_rgba(139,92,246,0.4)] active:scale-[0.97]"
              id="final-cta"
              style={{
                background: 'linear-gradient(145deg, #7c3aed, #6d28d9)',
                boxShadow:
                  'inset 0 1px 1px rgba(255,255,255,0.15), inset 0 -2px 4px rgba(0,0,0,0.3), 0 12px 40px rgba(139,92,246,0.3), 0 4px 12px rgba(0,0,0,0.4)',
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.08] to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
              <span className="relative z-10">Enter the Workspace</span>
              <svg
                className="relative z-10 w-5 h-5 transition-transform duration-300 group-hover:translate-x-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </Reveal>
        </div>
      </section>

      {/* ════════════════════════════════════════════
          FOOTER
          ════════════════════════════════════════════ */}
      <footer className="relative border-t border-white/[0.04] py-12 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-violet-500 to-cyan-400 flex items-center justify-center">
              <span className="text-white font-black text-[9px]">L</span>
            </div>
            <span className="text-slate-500 text-sm">
              Project Lucida · {new Date().getFullYear()}
            </span>
          </div>
          <div className="flex items-center gap-6 text-slate-600 text-xs tracking-wide">
            <span>React + Vite</span>
            <span className="w-1 h-1 rounded-full bg-slate-700" />
            <span>Tailwind CSS</span>
            <span className="w-1 h-1 rounded-full bg-slate-700" />
            <span>Framer Motion</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;
