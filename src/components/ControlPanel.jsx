/**
 * ControlPanel Component
 * Glassmorphic Typography Control Dashboard
 * WCAG-compliant with roving tabindex keyboard navigation
 */

import React, { useRef, useEffect, useState } from 'react';
import { rafScheduler } from '../utils/rafScheduler';

export const ControlPanel = ({
  rootElement,
  currentSettings,
  onSettingsChange,
  onAutoHighlightToggle,
  isAutoHighlighting,
  wordDelay,
  onWordDelayChange,
}) => {
  const panelRef = useRef(null);
  const sliderRefs = useRef({});
  const [focusedSlider, setFocusedSlider] = useState('font-size');

  const sliders = [
    {
      id: 'font-size',
      label: 'Font Size',
      cssVar: 'font-size',
      min: 12,
      max: 32,
      unit: 'px',
      value: currentSettings['font-size'] || 18,
    },
    {
      id: 'letter-spacing',
      label: 'Letter Spacing',
      cssVar: 'letter-spacing',
      min: -2,
      max: 8,
      unit: 'px',
      value: currentSettings['letter-spacing'] || 0,
    },
    {
      id: 'word-spacing',
      label: 'Word Spacing',
      cssVar: 'word-spacing',
      min: -2,
      max: 12,
      unit: 'px',
      value: currentSettings['word-spacing'] || 0,
    },
    {
      id: 'line-height',
      label: 'Line Height',
      cssVar: 'line-height',
      min: 1,
      max: 2.5,
      unit: '',
      step: 0.1,
      value: currentSettings['line-height'] || 1.6,
    },
    {
      id: 'column-width',
      label: 'Column Width',
      cssVar: 'column-width',
      min: 200,
      max: 900,
      unit: 'px',
      value: currentSettings['column-width'] || 600,
    },
    {
      id: 'bg-luminance',
      label: 'Background Luminance',
      cssVar: 'bg-luminance',
      min: 5,
      max: 50,
      unit: '%',
      value: currentSettings['bg-luminance'] || 15,
    },
  ];

  const fontFamilies = [
    { id: 'serif', label: 'Serif', value: "'Georgia', serif" },
    { id: 'sans', label: 'Sans-Serif', value: "'Segoe UI', sans-serif" },
    { id: 'mono', label: 'Monospace', value: "'Courier New', monospace" },
  ];

  /**
   * Handle slider change with rAF batching
   */
  const handleSliderChange = (sliderId, newValue) => {
    const slider = sliders.find((s) => s.id === sliderId);
    const numValue = parseFloat(newValue);

    // Schedule CSS update through rAF scheduler
    rafScheduler.scheduleVarUpdate(rootElement, {
      [slider.cssVar]: slider.unit ? `${numValue}${slider.unit}` : numValue,
    });

    // Update React state
    onSettingsChange({
      ...currentSettings,
      [sliderId]: numValue,
    });
  };

  /**
   * Handle font family change
   */
  const handleFontChange = (fontValue) => {
    rafScheduler.scheduleVarUpdate(rootElement, {
      'font-family': fontValue,
    });

    onSettingsChange({
      ...currentSettings,
      'font-family': fontValue,
    });
  };

  /**
   * Keyboard navigation: roving tabindex pattern
   */
  const handleKeyDown = (e, currentSliderId) => {
    const sliderIds = sliders.map((s) => s.id);
    const currentIndex = sliderIds.indexOf(focusedSlider);

    if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
      e.preventDefault();
      const nextIndex = (currentIndex + 1) % sliderIds.length;
      setFocusedSlider(sliderIds[nextIndex]);
      sliderRefs.current[sliderIds[nextIndex]]?.focus();
    } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
      e.preventDefault();
      const prevIndex = (currentIndex - 1 + sliderIds.length) % sliderIds.length;
      setFocusedSlider(sliderIds[prevIndex]);
      sliderRefs.current[sliderIds[prevIndex]]?.focus();
    }
  };

  /**
   * Initialize all sliders with CSS custom properties on mount
   */
  useEffect(() => {
    sliders.forEach((slider) => {
      const value = currentSettings[slider.id] || slider.value;
      rafScheduler.scheduleVarUpdate(rootElement, {
        [slider.cssVar]: slider.unit ? `${value}${slider.unit}` : value,
      });
    });
  }, []);

  return (
    <div
      ref={panelRef}
      className="absolute inset-0 bg-black/40 backdrop-blur-md rounded-2xl border border-white/20 p-8 shadow-2xl hover:shadow-3xl transition-shadow duration-300 overflow-y-auto"
    >
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white mb-1">Typography Engine</h2>
        <p className="text-white/60 text-sm">Premium adaptive reading environment</p>
      </div>

      {/* Font Family Selector */}
      <div className="mb-8">
        <label className="block text-white/80 text-sm font-semibold mb-4">
          Font Family
        </label>
        <div className="grid grid-cols-3 gap-3">
          {fontFamilies.map((font) => (
            <button
              key={font.id}
              onClick={() => handleFontChange(font.value)}
              className={`py-2 px-3 rounded-lg font-medium text-sm transition-all duration-200 border ${
                currentSettings['font-family'] === font.value
                  ? 'bg-blue-500/30 border-blue-400/60 text-blue-100 shadow-lg'
                  : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10 hover:border-white/20'
              }`}
              aria-pressed={currentSettings['font-family'] === font.value}
            >
              {font.label}
            </button>
          ))}
        </div>
      </div>

      {/* Sliders Section */}
      <div className="space-y-6">
        {sliders.map((slider) => (
          <div
            key={slider.id}
            className="group"
          >
            <div className="flex items-center justify-between mb-3">
              <label
                htmlFor={slider.id}
                className="text-white/80 font-semibold text-sm"
              >
                {slider.label}
              </label>
              <output className="text-blue-300 font-mono text-sm bg-blue-500/10 px-3 py-1 rounded border border-blue-400/20">
                {slider.value}
                {slider.unit}
              </output>
            </div>

            <input
              ref={(el) => (sliderRefs.current[slider.id] = el)}
              id={slider.id}
              type="range"
              min={slider.min}
              max={slider.max}
              step={slider.step || 1}
              value={slider.value}
              onChange={(e) => handleSliderChange(slider.id, e.target.value)}
              onKeyDown={(e) => handleKeyDown(e, slider.id)}
              tabIndex={focusedSlider === slider.id ? 0 : -1}
              className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-blue-500 hover:accent-blue-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-transparent"
              aria-label={`${slider.label}: ${slider.value}${slider.unit}`}
              aria-valuemin={slider.min}
              aria-valuemax={slider.max}
              aria-valuenow={slider.value}
              aria-valuetext={`${slider.value}${slider.unit}`}
            />
          </div>
        ))}
      </div>

      {/* Word Highlight Speed Control */}
      <div className="mt-8 pt-8 border-t border-white/10">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <label
              htmlFor="word-delay"
              className="text-white/80 font-semibold text-sm"
            >
              Highlight Speed
            </label>
            <output className="text-green-300 font-mono text-sm bg-green-500/10 px-3 py-1 rounded border border-green-400/20">
              {wordDelay}ms
            </output>
          </div>

          <input
            id="word-delay"
            type="range"
            min={100}
            max={2000}
            step={50}
            value={wordDelay}
            onChange={(e) => onWordDelayChange(parseInt(e.target.value))}
            className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-green-500 hover:accent-green-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2 focus:ring-offset-transparent"
            aria-label={`Highlight speed: ${wordDelay}ms`}
            aria-valuemin={100}
            aria-valuemax={2000}
            aria-valuenow={wordDelay}
            aria-valuetext={`${wordDelay} milliseconds`}
          />
        </div>

        {/* Auto-Highlight Toggle */}
        <button
          onClick={onAutoHighlightToggle}
          className={`w-full py-3 px-4 rounded-lg font-semibold text-sm transition-all duration-200 border ${
            isAutoHighlighting
              ? 'bg-green-500/30 border-green-400/60 text-green-100 shadow-lg'
              : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10 hover:border-white/20'
          } focus:outline-none focus:ring-2 focus:ring-green-400`}
          aria-pressed={isAutoHighlighting}
        >
          {isAutoHighlighting ? '⏸ Stop Auto-Highlight' : '▶ Start Auto-Highlight'}
        </button>
      </div>

      {/* Footer Info */}
      <div className="mt-8 pt-6 border-t border-white/10">
        <p className="text-white/50 text-xs text-center">
          Use arrow keys to navigate sliders • Tab to cycle controls
        </p>
      </div>
    </div>
  );
};
