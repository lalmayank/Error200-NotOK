import React, { useCallback } from "react";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import type { ReaderSettings } from "@/hooks/useURLPersistence";

interface ControlPanelProps {
  settings: ReaderSettings;
  onSettingsChange: (settings: Partial<ReaderSettings>) => void;
  isImmersed: boolean;
}

const FONTS = [
  { value: "Inter", label: "Inter" },
  { value: "OpenDyslexic", label: "OpenDyslexic" },
  { value: "Lexie Readable", label: "Lexie Readable" },
  { value: "Georgia", label: "Georgia" },
  { value: "System", label: "System" },
];

const TINTS = [
  { value: "white", label: "White", color: "#FFFFFF" },
  { value: "cream", label: "Cream", color: "#FDFBF7" },
  { value: "pale-blue", label: "Pale Blue", color: "#F0F4F8" },
  { value: "yellow", label: "Yellow", color: "#FEF9E7" },
  { value: "soft-mint", label: "Soft Mint", color: "#F0F9F4" },
];

function ControlGroup({
  label,
  children,
  ariaLabel,
}: {
  label: string;
  children: React.ReactNode;
  ariaLabel?: string;
}) {
  return (
    <div className="mb-7" role="group" aria-label={ariaLabel || label}>
      <Label className="text-[10px] font-semibold tracking-widest uppercase text-violet-400/80 block mb-3">
        {label}
      </Label>
      {children}
    </div>
  );
}

export default function ControlPanel({
  settings,
  onSettingsChange,
  isImmersed,
}: ControlPanelProps) {
  const handleFontChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      onSettingsChange({ font: e.target.value });
    },
    [onSettingsChange]
  );

  const handleTintChange = useCallback(
    (tint: string) => {
      onSettingsChange({ backgroundTint: tint });
    },
    [onSettingsChange]
  );

  const handleSliderChange = useCallback(
    (key: keyof ReaderSettings, value: number[]) => {
      onSettingsChange({ [key]: value[0] });
    },
    [onSettingsChange]
  );

  if (isImmersed) {
    return (
      <div
        className="h-full flex flex-col transition-opacity duration-400"
        style={{ opacity: 0, pointerEvents: "none" }}
        aria-hidden="true"
      />
    );
  }

  return (
    <div className="flex flex-col border-b border-violet-100/50">
      {/* Section Header */}
      <div className="px-5 py-4 border-b border-violet-100/50 bg-violet-50/30">
        <h2 className="text-[10px] font-semibold tracking-widest uppercase text-violet-400/80">
          Typography
        </h2>
      </div>

      <div className="p-5 bg-white/40">
        {/* Font Face */}
        <ControlGroup label="Font Face" ariaLabel="Select reading font">
          <select
            value={settings.font}
            onChange={handleFontChange}
            className="w-full h-10 px-3 bg-white border border-violet-100 text-slate-700 text-sm rounded-xl hover:border-violet-300 focus-visible:outline-2 focus-visible:outline-violet-300 focus-visible:outline-offset-2 transition-colors duration-200"
            aria-label="Select font face"
          >
            {FONTS.map((f) => (
              <option key={f.value} value={f.value} className="bg-white">
                {f.label}
              </option>
            ))}
          </select>
        </ControlGroup>

        {/* Font Size */}
        <ControlGroup label="Font Size" ariaLabel="Adjust font size">
          <div className="flex items-center gap-3">
            <span className="text-[11px] text-slate-400 font-mono w-12 text-right tabular-nums font-semibold">
              {(settings.fontSize || 1.5).toFixed(1)}rem
            </span>
            <Slider
              value={[settings.fontSize || 1.5]}
              onValueChange={(v) => handleSliderChange("fontSize", v)}
              min={0.8}
              max={3.0}
              step={0.1}
              className="flex-1"
              aria-label="Font size"
            />
          </div>
        </ControlGroup>

        {/* Letter Spacing */}
        <ControlGroup label="Letter Spacing" ariaLabel="Adjust letter spacing">
          <div className="flex items-center gap-3">
            <span className="text-[11px] text-slate-400 font-mono w-12 text-right tabular-nums font-semibold">
              {settings.letterSpacing.toFixed(2)}em
            </span>
            <Slider
              value={[settings.letterSpacing]}
              onValueChange={(v) => handleSliderChange("letterSpacing", v)}
              min={-0.05}
              max={0.3}
              step={0.01}
              className="flex-1"
              aria-label="Letter spacing"
            />
          </div>
        </ControlGroup>

        {/* Word Spacing */}
        <ControlGroup label="Word Spacing" ariaLabel="Adjust word spacing">
          <div className="flex items-center gap-3">
            <span className="text-[11px] text-slate-400 font-mono w-12 text-right tabular-nums font-semibold">
              {settings.wordSpacing.toFixed(2)}em
            </span>
            <Slider
              value={[settings.wordSpacing]}
              onValueChange={(v) => handleSliderChange("wordSpacing", v)}
              min={0}
              max={1}
              step={0.01}
              className="flex-1"
              aria-label="Word spacing"
            />
          </div>
        </ControlGroup>

        {/* Line Height */}
        <ControlGroup label="Line Height" ariaLabel="Adjust line height">
          <div className="flex items-center gap-3">
            <span className="text-[11px] text-slate-400 font-mono w-12 text-right tabular-nums font-semibold">
              {settings.lineHeight.toFixed(1)}
            </span>
            <Slider
              value={[settings.lineHeight]}
              onValueChange={(v) => handleSliderChange("lineHeight", v)}
              min={1}
              max={3}
              step={0.1}
              className="flex-1"
              aria-label="Line height"
            />
          </div>
        </ControlGroup>

        {/* Paragraph Spacing */}
        <ControlGroup label="Paragraph Spacing" ariaLabel="Adjust paragraph spacing">
          <div className="flex items-center gap-3">
            <span className="text-[11px] text-slate-400 font-mono w-12 text-right tabular-nums font-semibold">
              {settings.paragraphSpacing.toFixed(1)}em
            </span>
            <Slider
              value={[settings.paragraphSpacing]}
              onValueChange={(v) => handleSliderChange("paragraphSpacing", v)}
              min={0.5}
              max={3}
              step={0.1}
              className="flex-1"
              aria-label="Paragraph spacing"
            />
          </div>
        </ControlGroup>

        {/* Column Width */}
        <ControlGroup label="Column Width" ariaLabel="Adjust column width">
          <div className="flex items-center gap-3">
            <span className="text-[11px] text-slate-400 font-mono w-12 text-right tabular-nums font-semibold">
              {settings.columnWidth}ch
            </span>
            <Slider
              value={[settings.columnWidth]}
              onValueChange={(v) => handleSliderChange("columnWidth", v)}
              min={40}
              max={90}
              step={1}
              className="flex-1"
              aria-label="Column width"
            />
          </div>
        </ControlGroup>

        {/* Background Tint */}
        <ControlGroup label="Background Tint" ariaLabel="Select background color tint">
          <div className="flex gap-2.5">
            {TINTS.map((tint) => (
              <button
                key={tint.value}
                onClick={() => handleTintChange(tint.value)}
                className={`w-8 h-8 rounded-lg border-2 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-2 focus-visible:outline-violet-300 focus-visible:outline-offset-2 ${
                  settings.backgroundTint === tint.value
                    ? "border-violet-500 shadow-[0px_3px_0px_#c4b5fd] scale-110"
                    : "border-slate-200 hover:border-violet-300 shadow-[0px_2px_0px_#e2e8f0]"
                }`}
                style={{ backgroundColor: tint.color }}
                aria-label={`Set background to ${tint.label}`}
                aria-pressed={settings.backgroundTint === tint.value}
                title={tint.label}
              />
            ))}
          </div>
        </ControlGroup>
      </div>
    </div>
  );
}