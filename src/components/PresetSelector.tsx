import { useState } from 'react';
import {
  PRESET_CATEGORIES,
  PRESETS,
  getPresetsByCategory,
  getPopularPresets,
  type Preset,
  type PresetCategory,
} from '../lib/presets';

interface PresetSelectorProps {
  onSelect: (preset: Preset) => void;
  selectedPresetId?: string;
  disabled?: boolean;
}

export function PresetSelector({
  onSelect,
  selectedPresetId,
  disabled = false,
}: PresetSelectorProps) {
  const [activeCategory, setActiveCategory] = useState<PresetCategory | 'popular'>('popular');

  const displayedPresets =
    activeCategory === 'popular'
      ? getPopularPresets()
      : getPresetsByCategory(activeCategory);

  return (
    <div className="space-y-3">
      {/* Category Tabs */}
      <div className="flex items-center gap-1 flex-wrap">
        <span className="text-sm text-gray-400 mr-1">Presets:</span>
        <button
          onClick={() => setActiveCategory('popular')}
          disabled={disabled}
          className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
            activeCategory === 'popular'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          } disabled:opacity-50`}
        >
          ⭐ Popular
        </button>
        {PRESET_CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            disabled={disabled}
            className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
              activeCategory === cat.id
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            } disabled:opacity-50`}
          >
            {cat.icon} {cat.name}
          </button>
        ))}
      </div>

      {/* Preset Buttons */}
      <div className="flex items-center gap-2 flex-wrap">
        {displayedPresets.map((preset) => (
          <button
            key={preset.id}
            onClick={() => onSelect(preset)}
            disabled={disabled}
            title={`${preset.description}${preset.maxFileSizeKB ? ` (max ${preset.maxFileSizeKB}KB)` : ''}`}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
              selectedPresetId === preset.id
                ? 'bg-blue-600 text-white ring-2 ring-blue-400'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <div className="flex flex-col items-center gap-1">
              <span className="text-lg">{preset.icon}</span>
              <span className="text-xs">{preset.name}</span>
              <span className="text-xs text-gray-400">
                {preset.width}×{preset.height}
              </span>
            </div>
          </button>
        ))}
      </div>

      {/* Selected preset info */}
      {selectedPresetId && (
        <div className="text-xs text-gray-500">
          {(() => {
            const preset = PRESETS.find((p) => p.id === selectedPresetId);
            if (!preset) return null;
            return (
              <span>
                {preset.description}
                {preset.maxFileSizeKB && (
                  <span className="ml-2 text-yellow-500">
                    Max file size: {preset.maxFileSizeKB}KB
                  </span>
                )}
              </span>
            );
          })()}
        </div>
      )}
    </div>
  );
}
