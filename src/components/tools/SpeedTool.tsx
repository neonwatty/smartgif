import { useState, useEffect } from 'react';
import type { Frame } from '../../types';
import {
  adjustSpeed,
  setUniformDelay,
  getTotalDuration,
  getAverageFps,
} from '../../lib/frameUtils';

interface SpeedToolProps {
  frames: Frame[];
  onFramesChange: (frames: Frame[]) => void;
}

export function SpeedTool({ frames, onFramesChange }: SpeedToolProps) {
  const [speedMultiplier, setSpeedMultiplier] = useState(1);
  const [customDelay, setCustomDelay] = useState<string>('');
  const [previewFrames, setPreviewFrames] = useState<Frame[]>(frames);
  const [mode, setMode] = useState<'multiplier' | 'uniform'>('multiplier');

  // Calculate current stats
  const currentDuration = getTotalDuration(frames);
  const currentFps = getAverageFps(frames);
  const newDuration = getTotalDuration(previewFrames);
  const newFps = getAverageFps(previewFrames);

  // Update preview when speed multiplier or mode changes
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (mode === 'multiplier') {
      const adjusted = adjustSpeed(frames, speedMultiplier);
      setPreviewFrames(adjusted);
    } else if (mode === 'uniform' && customDelay) {
      const delay = parseInt(customDelay, 10);
      if (!isNaN(delay) && delay >= 10) {
        const uniform = setUniformDelay(frames, delay);
        setPreviewFrames(uniform);
      }
    }
  }, [speedMultiplier, customDelay, mode, frames]);

  const handleSpeedPreset = (multiplier: number) => {
    setSpeedMultiplier(multiplier);
    setMode('multiplier');
  };

  const handleCustomDelayChange = (value: string) => {
    setCustomDelay(value);
    setMode('uniform');
  };

  const handleApply = () => {
    onFramesChange(previewFrames);
  };

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  return (
    <div className="space-y-6 p-6 bg-gray-800 rounded-lg">
      <div>
        <h3 className="text-lg font-semibold text-white mb-2">Speed Tool</h3>
        <p className="text-sm text-gray-400">
          Adjust playback speed or set uniform frame delays
        </p>
      </div>

      {/* Mode Selection */}
      <div className="flex gap-2">
        <button
          onClick={() => setMode('multiplier')}
          className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
            mode === 'multiplier'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          Speed Multiplier
        </button>
        <button
          onClick={() => setMode('uniform')}
          className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
            mode === 'uniform'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          Uniform Delay
        </button>
      </div>

      {mode === 'multiplier' ? (
        <>
          {/* Speed Multiplier Slider */}
          <div className="space-y-3">
            <label className="block">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-300">Speed Multiplier</span>
                <span className="text-sm font-mono text-blue-400">{speedMultiplier.toFixed(2)}x</span>
              </div>
              <input
                type="range"
                min="0.25"
                max="4"
                step="0.25"
                value={speedMultiplier}
                onChange={(e) => setSpeedMultiplier(Number(e.target.value))}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>0.25x (slower)</span>
                <span>1x</span>
                <span>4x (faster)</span>
              </div>
            </label>
          </div>

          {/* Speed Presets */}
          <div className="space-y-2">
            <span className="text-sm font-medium text-gray-300">Presets</span>
            <div className="grid grid-cols-4 gap-2">
              {[0.5, 1, 1.5, 2].map((preset) => (
                <button
                  key={preset}
                  onClick={() => handleSpeedPreset(preset)}
                  className={`py-2 px-3 rounded-lg font-medium text-sm transition-colors ${
                    speedMultiplier === preset
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  {preset}x
                </button>
              ))}
            </div>
          </div>
        </>
      ) : (
        <>
          {/* Custom Frame Delay */}
          <div className="space-y-2">
            <label className="block">
              <span className="text-sm font-medium text-gray-300">Frame Delay (ms)</span>
              <div className="flex gap-2 mt-2">
                <input
                  type="number"
                  min="10"
                  max="5000"
                  step="10"
                  value={customDelay}
                  onChange={(e) => handleCustomDelayChange(e.target.value)}
                  placeholder="e.g., 100"
                  className="flex-1 px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                />
                <span className="flex items-center text-sm text-gray-400">ms</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Minimum: 10ms, sets all frames to the same delay
              </p>
            </label>
          </div>
        </>
      )}

      {/* Duration Info */}
      <div className="grid grid-cols-2 gap-4 p-4 bg-gray-700/50 rounded-lg">
        <div>
          <div className="text-xs text-gray-400 mb-1">Current Duration</div>
          <div className="text-lg font-mono text-white">{formatDuration(currentDuration)}</div>
          <div className="text-xs text-gray-400 mt-1">{currentFps} fps</div>
        </div>
        <div>
          <div className="text-xs text-gray-400 mb-1">New Duration</div>
          <div className="text-lg font-mono text-blue-400">{formatDuration(newDuration)}</div>
          <div className="text-xs text-gray-400 mt-1">{newFps} fps</div>
        </div>
      </div>

      {/* Preview Info */}
      <div className="flex items-center gap-2 p-3 bg-blue-600/10 border border-blue-600/30 rounded-lg">
        <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="text-sm text-blue-300">
          Preview updates automatically. Click Apply to save changes.
        </p>
      </div>

      {/* Apply Button */}
      <button
        onClick={handleApply}
        disabled={frames === previewFrames}
        className="w-full py-3 px-6 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:text-gray-500 text-white font-semibold rounded-lg transition-colors"
      >
        Apply Speed Changes
      </button>

      {/* Stats Summary */}
      <div className="grid grid-cols-3 gap-3 text-center">
        <div className="p-3 bg-gray-700/50 rounded-lg">
          <div className="text-xs text-gray-400">Frames</div>
          <div className="text-lg font-mono text-white">{frames.length}</div>
        </div>
        <div className="p-3 bg-gray-700/50 rounded-lg">
          <div className="text-xs text-gray-400">Speed Change</div>
          <div className="text-lg font-mono text-white">
            {mode === 'multiplier' ? `${speedMultiplier.toFixed(2)}x` : 'Custom'}
          </div>
        </div>
        <div className="p-3 bg-gray-700/50 rounded-lg">
          <div className="text-xs text-gray-400">Duration Change</div>
          <div className="text-lg font-mono text-white">
            {currentDuration > 0 ? `${((newDuration / currentDuration) * 100).toFixed(0)}%` : '-'}
          </div>
        </div>
      </div>
    </div>
  );
}
