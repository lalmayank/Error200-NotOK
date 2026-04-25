/**
 * App.jsx - Root Application Router
 * Routes `/` to the Landing Page and `/workspace` to the existing app workspace.
 * The original workspace code is preserved in WorkspaceApp below (untouched logic).
 */

import React, { useRef, useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { LandingPage } from './pages/LandingPage';
import { useTextEngine } from './hooks/useTextEngine';
import { ControlPanel } from './components/ControlPanel';
import { rafScheduler } from './utils/rafScheduler';

/* ─────────────────────────────────────────────────────
   WorkspaceApp — The original App component, untouched.
   This is the dual-pane adaptive reading environment.
   ───────────────────────────────────────────────────── */
function WorkspaceApp() {
  const readingPaneRef = useRef(null);
  const textInputRef = useRef(null);

  // Text engine state
  const {
    tokens,
    highlightedTokenIndex,
    isAutoHighlighting,
    wordDelay,
    handleTextInput,
    startAutoHighlight,
    stopAutoHighlight,
    nextWord,
    prevWord,
    setAutoHighlightSpeed,
  } = useTextEngine();

  // Typography settings state
  const [settings, setSettings] = useState({
    'font-size': 18,
    'letter-spacing': 0,
    'word-spacing': 0,
    'line-height': 1.6,
    'column-width': 600,
    'bg-luminance': 15,
    'font-family': "'Georgia', serif",
  });

  /**
   * Initialize CSS custom properties on mount
   */
  useEffect(() => {
    const initializeCSS = () => {
      if (readingPaneRef.current) {
        const props = {
          'font-size': `${settings['font-size']}px`,
          'letter-spacing': `${settings['letter-spacing']}px`,
          'word-spacing': `${settings['word-spacing']}px`,
          'line-height': settings['line-height'],
          'column-width': `${settings['column-width']}px`,
          'bg-luminance': `${settings['bg-luminance']}%`,
          'font-family': settings['font-family'],
          'highlight-index': highlightedTokenIndex,
        };

        Object.entries(props).forEach(([key, value]) => {
          readingPaneRef.current.style.setProperty(`--${key}`, value);
        });
      }
    };

    // Use rAF scheduler for initial setup
    rafScheduler.schedule(initializeCSS);
  }, []);

  /**
   * Update highlight index CSS variable whenever it changes
   */
  useEffect(() => {
    if (readingPaneRef.current) {
      readingPaneRef.current.style.setProperty('--highlight-index', highlightedTokenIndex);
    }
  }, [highlightedTokenIndex]);

  /**
   * Handle text input from textarea
   */
  const handlePasteText = (e) => {
    const text = e.target.value;
    handleTextInput(text);
  };

  /**
   * Toggle auto-highlight mode
   */
  const handleAutoHighlightToggle = () => {
    if (isAutoHighlighting) {
      stopAutoHighlight();
    } else {
      startAutoHighlight();
    }
  };

  /**
   * Handle keyboard shortcuts in reading pane
   */
  const handleReadingPaneKeyDown = (e) => {
    if (e.key === 'ArrowRight' || e.key === ' ') {
      e.preventDefault();
      nextWord();
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      prevWord();
    }
  };

  /**
   * Clear all text and reset
   */
  const handleClear = () => {
    if (textInputRef.current) {
      textInputRef.current.value = '';
    }
    stopAutoHighlight();
    handleTextInput('');
  };

  /**
   * Sample text for quick demo
   */
  const loadSampleText = () => {
    const sampleText = `The typography engine optimizes your reading experience. Adjust font size, letter spacing, and line height in real-time. The progressive word highlighting helps maintain focus across long passages. Each control is fully keyboard accessible.`;
    if (textInputRef.current) {
      textInputRef.current.value = sampleText;
    }
    handleTextInput(sampleText);
  };

  return (
    <div className="w-full h-screen bg-slate-950 text-white overflow-hidden">
      {/* Main Container */}
      <div className="flex h-full gap-6 p-6">
        {/* LEFT PANE: Input & Controls */}
        <div className="w-2/5 flex flex-col gap-6">
          {/* Input Section */}
          <div className="bg-black/40 backdrop-blur-md rounded-2xl border border-white/20 p-6 shadow-2xl">
            <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              Lucida
            </h1>
            <p className="text-white/60 text-sm mb-6">
              Premium adaptive reading environment
            </p>

            {/* Text Textarea */}
            <textarea
              ref={textInputRef}
              value={undefined}
              onChange={handlePasteText}
              placeholder="Paste or type text here to begin..."
              className="w-full h-40 bg-white/5 border border-white/10 rounded-lg p-4 text-white placeholder-white/40 resize-none focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent font-[var(--font-family)] text-[var(--font-size)] leading-[var(--line-height)] transition-all duration-200"
              aria-label="Text input area"
            />

            {/* Action Buttons */}
            <div className="flex gap-3 mt-4">
              <button
                onClick={loadSampleText}
                className="flex-1 py-2 px-3 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-400/30 hover:border-blue-400/60 rounded-lg text-blue-300 font-semibold text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
                aria-label="Load sample text"
              >
                📄 Sample
              </button>
              <button
                onClick={handleClear}
                className="flex-1 py-2 px-3 bg-red-500/20 hover:bg-red-500/30 border border-red-400/30 hover:border-red-400/60 rounded-lg text-red-300 font-semibold text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-400"
                aria-label="Clear text"
              >
                🗑 Clear
              </button>
            </div>

            {/* Stats */}
            <div className="mt-6 pt-6 border-t border-white/10 grid grid-cols-2 gap-4">
              <div className="bg-blue-500/10 rounded-lg p-3 border border-blue-400/20">
                <div className="text-blue-300 text-xs font-semibold uppercase tracking-wider">
                  Words
                </div>
                <div className="text-2xl font-bold text-blue-100 mt-1">
                  {tokens.length}
                </div>
              </div>
              <div className="bg-green-500/10 rounded-lg p-3 border border-green-400/20">
                <div className="text-green-300 text-xs font-semibold uppercase tracking-wider">
                  Current
                </div>
                <div className="text-2xl font-bold text-green-100 mt-1">
                  {highlightedTokenIndex + 1}
                </div>
              </div>
            </div>
          </div>

          {/* Control Panel */}
          <div className="flex-1 relative min-h-0">
            <ControlPanel
              rootElement={readingPaneRef.current}
              currentSettings={settings}
              onSettingsChange={setSettings}
              onAutoHighlightToggle={handleAutoHighlightToggle}
              isAutoHighlighting={isAutoHighlighting}
              wordDelay={wordDelay}
              onWordDelayChange={setAutoHighlightSpeed}
            />
          </div>
        </div>

        {/* RIGHT PANE: Adaptive Reading Environment */}
        <div
          ref={readingPaneRef}
          className="flex-1 relative bg-slate-900/50 rounded-2xl border border-white/10 p-8 overflow-hidden"
          style={{
            '--font-size': `${settings['font-size']}px`,
            '--letter-spacing': `${settings['letter-spacing']}px`,
            '--word-spacing': `${settings['word-spacing']}px`,
            '--line-height': settings['line-height'],
            '--column-width': `${settings['column-width']}px`,
            '--bg-luminance': `${settings['bg-luminance']}%`,
            '--font-family': settings['font-family'],
            '--highlight-index': highlightedTokenIndex,
            backgroundColor: `rgb(${15 + settings['bg-luminance']}, ${15 + settings['bg-luminance'] * 0.8}, ${20 + settings['bg-luminance'] * 1.2})`,
          }}
          onKeyDown={handleReadingPaneKeyDown}
          tabIndex={tokens.length > 0 ? 0 : -1}
          role="region"
          aria-label="Reading environment"
          aria-live="polite"
          aria-relevant="text"
        >
          {/* Gradient Backdrop */}
          <div className="absolute inset-0 pointer-events-none bg-gradient-to-br from-transparent via-blue-500/5 to-cyan-500/5 rounded-2xl" />

          {/* Content Container */}
          <div className="relative z-10 h-full overflow-y-auto">
            {tokens.length > 0 ? (
              <div
                className="text-white leading-relaxed"
                style={{
                  fontFamily: settings['font-family'],
                  fontSize: `${settings['font-size']}px`,
                  letterSpacing: `${settings['letter-spacing']}px`,
                  wordSpacing: `${settings['word-spacing']}px`,
                  lineHeight: settings['line-height'],
                  maxWidth: `${settings['column-width']}px`,
                }}
              >
                {tokens.map((token, index) => (
                  <span
                    key={token.id}
                    className={`transition-all duration-200 ${
                      index === highlightedTokenIndex
                        ? 'bg-yellow-400/40 px-1 py-0.5 rounded font-semibold text-yellow-100 shadow-lg shadow-yellow-500/20'
                        : 'text-white/80 hover:text-white/95'
                    }`}
                    role="button"
                    tabIndex={0}
                    onClick={() => {
                      // Allow click-to-highlight
                      // Manual highlight update would go here
                    }}
                    aria-label={`Word ${index + 1}: ${token.word}`}
                  >
                    {token.word}
                    {index < tokens.length - 1 ? ' ' : ''}
                  </span>
                ))}
              </div>
            ) : (
              <div className="h-full flex items-center justify-center">
                <div className="text-center">
                  <div className="text-white/40 text-lg mb-3">📖</div>
                  <div className="text-white/50 text-sm">
                    Paste or type text to begin reading
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Keyboard Shortcuts Help */}
          {tokens.length > 0 && (
            <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur border border-white/20 rounded-lg p-3 text-xs text-white/60 z-20">
              <div>→ Space: Next word</div>
              <div>← : Previous word</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────
   App — Root Router
   ───────────────────────────────────────────────────── */
function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/workspace" element={<WorkspaceApp />} />
    </Routes>
  );
}

export default App;
