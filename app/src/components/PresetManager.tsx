import React, { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { ReaderSettings } from "@/hooks/useURLPersistence";
import type { Preset } from "@/hooks/usePresets";

interface PresetManagerProps {
  presets: Preset[];
  currentSettings: ReaderSettings;
  onSavePreset: (name: string, settings: ReaderSettings) => void;
  onDeletePreset: (id: string) => void;
  onLoadPreset: (settings: ReaderSettings) => void;
  isImmersed: boolean;
}

export default function PresetManager({
  presets,
  currentSettings,
  onSavePreset,
  onDeletePreset,
  onLoadPreset,
  isImmersed,
}: PresetManagerProps) {
  const [newName, setNewName] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = useCallback(() => {
    if (!newName.trim()) return;
    onSavePreset(newName.trim(), currentSettings);
    setNewName("");
    setIsSaving(false);
  }, [newName, currentSettings, onSavePreset]);

  const handleLoad = useCallback(
    (preset: Preset) => {
      onLoadPreset(preset.settings);
    },
    [onLoadPreset]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        handleSave();
      }
      if (e.key === "Escape") {
        setIsSaving(false);
        setNewName("");
      }
    },
    [handleSave]
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
    <div className="flex flex-col bg-muted border-t border-border">
      <div className="px-5 py-4 border-b border-border">
        <h2 className="text-sm font-medium tracking-widest uppercase text-muted-foreground">
          Presets
        </h2>
      </div>

      <div className="p-5">
        {/* Save New Preset */}
        {isSaving ? (
          <div className="mb-4 flex gap-2">
            <Input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Preset name..."
              className="flex-1 h-10 border border-border rounded-none text-sm focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2"
              autoFocus
              aria-label="Enter preset name"
            />
            <Button
              onClick={handleSave}
              className="h-10 px-3 bg-primary text-primary-foreground hover:bg-primary/90 rounded-none"
              aria-label="Save preset"
            >
              Save
            </Button>
          </div>
        ) : (
          <Button
            onClick={() => setIsSaving(true)}
            variant="outline"
            className="w-full h-10 mb-4 border border-border text-muted-foreground hover:bg-muted rounded-none"
            aria-label="Save current settings as preset"
          >
            Save Current
          </Button>
        )}

        {/* Preset List */}
        <div className="space-y-2" role="list" aria-label="Saved presets">
          {presets.map((preset) => (
            <div
              key={preset.id}
              className="flex items-center gap-2 group"
              role="listitem"
            >
              <button
                onClick={() => handleLoad(preset)}
                className="flex-1 text-left px-3 py-2.5 bg-background border border-border text-sm text-foreground hover:border-foreground hover:bg-muted transition-colors focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2"
                aria-label={`Load preset ${preset.name}`}
              >
                <div className="font-medium">{preset.name}</div>
                <div className="text-xs text-muted-foreground font-mono mt-0.5">
                  {preset.settings.font} · {preset.settings.wpm} WPM ·{" "}
                  {preset.settings.backgroundTint}
                </div>
              </button>
              <button
                onClick={() => onDeletePreset(preset.id)}
                className="w-10 h-10 flex items-center justify-center bg-background border border-border text-muted-foreground hover:text-foreground hover:border-foreground transition-colors focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2"
                aria-label={`Delete preset ${preset.name}`}
                title="Delete preset"
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                  <path d="M1 1L13 13M13 1L1 13" stroke="currentColor" strokeWidth="1.5" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
