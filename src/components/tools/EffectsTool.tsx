import { useState, useEffect, useRef, useCallback } from 'react';
import type { Frame } from '../../types';
import {
  applyEffect,
  type EffectName,
} from '../../lib/effects';

interface EffectsToolProps {
  frames: Frame[];
  onFramesChange: (frames: Frame[]) => void;
}

interface EffectConfig {
  name: EffectName;
  label: string;
  icon: string;
  description: string;
  type: 'toggle' | 'slider';
  min?: number;
  max?: number;
  default?: number;
  unit?: string;
}

const EFFECTS: EffectConfig[] = [
  { name: 'grayscale', label: 'Grayscale', icon: '⚫', description: 'Convert to black & white', type: 'slider', min: 0, max: 100, default: 100, unit: '%' },
  { name: 'sepia', label: 'Sepia', icon: '🟤', description: 'Vintage warm tone', type: 'slider', min: 0, max: 100, default: 100, unit: '%' },
  { name: 'invert', label: 'Invert', icon: '🔄', description: 'Invert all colors', type: 'slider', min: 0, max: 100, default: 100, unit: '%' },
  { name: 'brightness', label: 'Brightness', icon: '☀️', description: 'Adjust light levels', type: 'slider', min: -100, max: 100, default: 0, unit: '' },
  { name: 'contrast', label: 'Contrast', icon: '◐', description: 'Adjust contrast', type: 'slider', min: -100, max: 100, default: 0, unit: '' },
  { name: 'saturation', label: 'Saturation', icon: '🎨', description: 'Color intensity', type: 'slider', min: -100, max: 100, default: 0, unit: '' },
  { name: 'hue', label: 'Hue Rotate', icon: '🌈', description: 'Shift colors', type: 'slider', min: 0, max: 360, default: 0, unit: '°' },
  { name: 'blur', label: 'Blur', icon: '💨', description: 'Soften the image', type: 'slider', min: 0, max: 100, default: 0, unit: '' },
  { name: 'sharpen', label: 'Sharpen', icon: '🔪', description: 'Enhance edges', type: 'slider', min: 0, max: 100, default: 0, unit: '' },
];

type EffectValues = Record<EffectName, number>;

const getDefaultValues = (): EffectValues => {
  const values: Partial<EffectValues> = {};
  for (const effect of EFFECTS) {
    values[effect.name] = effect.default ?? 0;
  }
  return values as EffectValues;
};

// Deep copy frames to preserve original state
const deepCopyFrames = (frames: Frame[]): Frame[] => {
  return frames.map(frame => ({
    ...frame,
    imageData: new ImageData(
      new Uint8ClampedArray(frame.imageData.data),
      frame.imageData.width,
      frame.imageData.height
    ),
  }));
};

export function EffectsTool({ frames, onFramesChange }: EffectsToolProps) {
  const [effectValues, setEffectValues] = useState<EffectValues>(getDefaultValues);
  const [originalFrames, setOriginalFrames] = useState<Frame[]>(() => deepCopyFrames(frames));
  const [previewFrames, setPreviewFrames] = useState<Frame[]>(frames);
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeEffect, setActiveEffect] = useState<EffectName | null>(null);

  // Animation state
  const [originalFrameIndex, setOriginalFrameIndex] = useState(0);
  const [previewFrameIndex, setPreviewFrameIndex] = useState(0);
  const originalCanvasRef = useRef<HTMLCanvasElement>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);

  // Update original frames only when a new file is loaded (dimensions change)
  useEffect(() => {
    if (frames.length > 0 && originalFrames.length > 0) {
      const newDims = `${frames[0].imageData.width}x${frames[0].imageData.height}`;
      const oldDims = `${originalFrames[0].imageData.width}x${originalFrames[0].imageData.height}`;
      if (newDims !== oldDims || frames.length !== originalFrames.length) {
        setOriginalFrames(deepCopyFrames(frames));
        setOriginalFrameIndex(0);
        setPreviewFrameIndex(0);
      }
    } else if (frames.length > 0 && originalFrames.length === 0) {
      setOriginalFrames(deepCopyFrames(frames));
    }
  }, [frames, originalFrames]);

  // Check if any effects are applied
  const hasChanges = EFFECTS.some(effect => {
    const value = effectValues[effect.name];
    const defaultValue = effect.default ?? 0;
    return value !== defaultValue;
  });

  // Apply all effects to frames
  const applyAllEffects = useCallback((sourceFrames: Frame[]): Frame[] => {
    return sourceFrames.map(frame => {
      let imageData = frame.imageData;

      for (const effect of EFFECTS) {
        const value = effectValues[effect.name];
        const defaultValue = effect.default ?? 0;

        if (value !== defaultValue) {
          // Determine options based on effect type
          if (effect.name === 'brightness' || effect.name === 'contrast' ||
              effect.name === 'saturation' || effect.name === 'hue') {
            imageData = applyEffect(imageData, effect.name, { value });
          } else {
            imageData = applyEffect(imageData, effect.name, { intensity: value });
          }
        }
      }

      return { ...frame, imageData };
    });
  }, [effectValues]);

  // Update preview when effect values change
  useEffect(() => {
    if (originalFrames.length === 0) return;

    setIsProcessing(true);
    const timeoutId = setTimeout(() => {
      const processed = applyAllEffects(originalFrames);
      setPreviewFrames(processed);
      setIsProcessing(false);
    }, 50);

    return () => clearTimeout(timeoutId);
  }, [effectValues, originalFrames, applyAllEffects]);

  // Animate original frames
  useEffect(() => {
    if (originalFrames.length === 0) return;
    const frame = originalFrames[originalFrameIndex];
    const timeout = setTimeout(() => {
      setOriginalFrameIndex((prev) => (prev + 1) % originalFrames.length);
    }, frame.delay);
    return () => clearTimeout(timeout);
  }, [originalFrameIndex, originalFrames]);

  // Animate preview frames
  useEffect(() => {
    if (previewFrames.length === 0) return;
    const frame = previewFrames[previewFrameIndex];
    const timeout = setTimeout(() => {
      setPreviewFrameIndex((prev) => (prev + 1) % previewFrames.length);
    }, frame.delay);
    return () => clearTimeout(timeout);
  }, [previewFrameIndex, previewFrames]);

  // Draw original frame
  useEffect(() => {
    const canvas = originalCanvasRef.current;
    if (!canvas || originalFrames.length === 0) return;
    const frame = originalFrames[originalFrameIndex];
    canvas.width = frame.imageData.width;
    canvas.height = frame.imageData.height;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.putImageData(frame.imageData, 0, 0);
    }
  }, [originalFrameIndex, originalFrames]);

  // Draw preview frame
  useEffect(() => {
    const canvas = previewCanvasRef.current;
    if (!canvas || previewFrames.length === 0) return;
    const frame = previewFrames[previewFrameIndex];
    canvas.width = frame.imageData.width;
    canvas.height = frame.imageData.height;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.putImageData(frame.imageData, 0, 0);
    }
  }, [previewFrameIndex, previewFrames]);

  const handleEffectChange = (name: EffectName, value: number) => {
    setEffectValues(prev => ({ ...prev, [name]: value }));
  };

  const handleReset = () => {
    setEffectValues(getDefaultValues());
  };

  const handleApply = () => {
    onFramesChange(previewFrames);
    // Reset values after applying
    setEffectValues(getDefaultValues());
  };

  // Quick preset buttons
  const handlePreset = (preset: 'vintage' | 'dramatic' | 'cool' | 'warm') => {
    const presets: Record<string, Partial<EffectValues>> = {
      vintage: { sepia: 60, contrast: 20, saturation: -20 },
      dramatic: { contrast: 50, saturation: 30, brightness: -10 },
      cool: { hue: 200, saturation: 20, brightness: 5 },
      warm: { hue: 30, saturation: 20, brightness: 5 },
    };
    setEffectValues({ ...getDefaultValues(), ...presets[preset] });
  };

  // Calculate canvas display size
  const maxDisplaySize = 280;
  const displayScale = originalFrames.length > 0
    ? Math.min(maxDisplaySize / originalFrames[0].imageData.width, maxDisplaySize / originalFrames[0].imageData.height, 1)
    : 1;
  const displayWidth = originalFrames.length > 0 ? originalFrames[0].imageData.width * displayScale : maxDisplaySize;
  const displayHeight = originalFrames.length > 0 ? originalFrames[0].imageData.height * displayScale : maxDisplaySize;

  // Get active effects summary
  const activeEffects = EFFECTS.filter(e => effectValues[e.name] !== (e.default ?? 0));

  return (
    <div className="space-y-4">
      {/* Quick Presets */}
      <div className="bg-gray-800 rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-gray-400">Quick Presets</span>
          {hasChanges && (
            <button
              onClick={handleReset}
              className="text-xs text-gray-500 hover:text-gray-300"
            >
              Reset All
            </button>
          )}
        </div>
        <div className="flex gap-2 flex-wrap">
          {[
            { id: 'vintage', label: 'Vintage', icon: '📷' },
            { id: 'dramatic', label: 'Dramatic', icon: '🎭' },
            { id: 'cool', label: 'Cool', icon: '❄️' },
            { id: 'warm', label: 'Warm', icon: '🔥' },
          ].map(preset => (
            <button
              key={preset.id}
              onClick={() => handlePreset(preset.id as 'vintage' | 'dramatic' | 'cool' | 'warm')}
              className="px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm transition-colors"
            >
              {preset.icon} {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* Effects Grid */}
      <div className="bg-gray-800 rounded-lg p-4">
        <div className="text-sm text-gray-400 mb-3">Adjustments</div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {EFFECTS.map(effect => {
            const value = effectValues[effect.name];
            const isActive = value !== (effect.default ?? 0);
            const isExpanded = activeEffect === effect.name;

            return (
              <div
                key={effect.name}
                className={`rounded-lg p-3 transition-colors ${
                  isActive ? 'bg-blue-900/30 border border-blue-700/50' : 'bg-gray-700/50'
                }`}
              >
                <button
                  onClick={() => setActiveEffect(isExpanded ? null : effect.name)}
                  className="w-full flex items-center justify-between text-left"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{effect.icon}</span>
                    <div>
                      <div className="text-sm font-medium text-white">{effect.label}</div>
                      <div className="text-xs text-gray-500">{effect.description}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {isActive && (
                      <span className="text-xs text-blue-400 font-mono">
                        {value}{effect.unit}
                      </span>
                    )}
                    <span className="text-gray-500">{isExpanded ? '▼' : '▶'}</span>
                  </div>
                </button>

                {isExpanded && (
                  <div className="mt-3 pt-3 border-t border-gray-600">
                    <div className="flex items-center gap-3">
                      <input
                        type="range"
                        min={effect.min}
                        max={effect.max}
                        value={value}
                        onChange={(e) => handleEffectChange(effect.name, Number(e.target.value))}
                        className="flex-1"
                      />
                      <input
                        type="number"
                        min={effect.min}
                        max={effect.max}
                        value={value}
                        onChange={(e) => handleEffectChange(effect.name, Number(e.target.value))}
                        className="w-16 px-2 py-1 bg-gray-600 border border-gray-500 rounded text-sm text-white text-center"
                      />
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>{effect.min}{effect.unit}</span>
                      <button
                        onClick={() => handleEffectChange(effect.name, effect.default ?? 0)}
                        className="text-gray-400 hover:text-white"
                      >
                        Reset
                      </button>
                      <span>{effect.max}{effect.unit}</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Active Effects Summary */}
      {activeEffects.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {activeEffects.map(effect => (
            <span
              key={effect.name}
              className="px-2 py-1 bg-blue-900/50 border border-blue-700/50 rounded text-xs text-blue-300"
            >
              {effect.icon} {effect.label}: {effectValues[effect.name]}{effect.unit}
            </span>
          ))}
        </div>
      )}

      {/* Apply Button */}
      <button
        onClick={handleApply}
        disabled={!hasChanges || isProcessing}
        className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:text-gray-500 text-white font-medium rounded-lg transition-colors"
      >
        {isProcessing ? 'Processing...' : hasChanges ? 'Apply Effects' : 'No Changes'}
      </button>

      {/* Side-by-Side Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Original Preview */}
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="text-sm text-gray-400 mb-3">Original</div>
          <div
            className="flex items-center justify-center bg-gray-900 rounded overflow-hidden"
            style={{ minHeight: '200px' }}
          >
            <canvas
              ref={originalCanvasRef}
              style={{ width: displayWidth, height: displayHeight }}
              className="object-contain"
            />
          </div>
        </div>

        {/* Preview with Effects */}
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="text-sm text-gray-400 mb-3 flex items-center gap-2">
            <span>Preview</span>
            {isProcessing && (
              <span className="text-xs text-blue-400 animate-pulse">Processing...</span>
            )}
          </div>
          <div
            className="flex items-center justify-center bg-gray-900 rounded overflow-hidden"
            style={{ minHeight: '200px' }}
          >
            <canvas
              ref={previewCanvasRef}
              style={{ width: displayWidth, height: displayHeight }}
              className="object-contain"
            />
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="text-center text-xs text-gray-500">
        {originalFrames.length} frame{originalFrames.length !== 1 ? 's' : ''} • Effects are applied to all frames
      </div>
    </div>
  );
}
