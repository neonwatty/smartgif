import type { ConversionSettings } from '../types';

interface ControlsProps {
  settings: ConversionSettings;
  onChange: (settings: ConversionSettings) => void;
  originalWidth: number;
  originalHeight: number;
  originalFps: number;
  disabled?: boolean;
}

export function Controls({
  settings,
  onChange,
  originalWidth,
  originalHeight,
  originalFps,
  disabled = false,
}: ControlsProps) {
  const aspectRatio = originalWidth / originalHeight;

  const handleWidthChange = (width: number) => {
    onChange({
      ...settings,
      width,
      height: Math.round(width / aspectRatio),
    });
  };

  const handleHeightChange = (height: number) => {
    onChange({
      ...settings,
      height,
      width: Math.round(height * aspectRatio),
    });
  };

  return (
    <div className="space-y-6">
      {/* Mode Toggle */}
      <div className="flex gap-2">
        <button
          onClick={() => onChange({ ...settings, mode: 'auto' })}
          disabled={disabled}
          className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
            settings.mode === 'auto'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          } disabled:opacity-50`}
        >
          Target Size
        </button>
        <button
          onClick={() => onChange({ ...settings, mode: 'manual' })}
          disabled={disabled}
          className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
            settings.mode === 'manual'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          } disabled:opacity-50`}
        >
          Manual
        </button>
      </div>

      {settings.mode === 'auto' ? (
        /* Auto Mode: Target Size */
        <div className="space-y-4">
          <label className="block">
            <span className="text-sm text-gray-400">Target Size (KB)</span>
            <div className="flex items-center gap-3 mt-1">
              <input
                type="range"
                min="100"
                max="10000"
                step="100"
                value={settings.targetSizeKB}
                onChange={(e) => onChange({ ...settings, targetSizeKB: Number(e.target.value) })}
                disabled={disabled}
                className="flex-1"
              />
              <input
                type="number"
                min="100"
                max="50000"
                value={settings.targetSizeKB}
                onChange={(e) => onChange({ ...settings, targetSizeKB: Number(e.target.value) })}
                disabled={disabled}
                className="w-24 px-3 py-1 bg-gray-700 rounded border border-gray-600 text-white text-right"
              />
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>100 KB</span>
              <span>{(settings.targetSizeKB / 1024).toFixed(1)} MB</span>
              <span>10 MB</span>
            </div>
          </label>
        </div>
      ) : (
        /* Manual Mode */
        <div className="space-y-4">
          {/* Dimensions */}
          <div className="grid grid-cols-2 gap-4">
            <label className="block">
              <span className="text-sm text-gray-400">Width</span>
              <input
                type="number"
                min="50"
                max={originalWidth}
                value={settings.width}
                onChange={(e) => handleWidthChange(Number(e.target.value))}
                disabled={disabled}
                className="w-full mt-1 px-3 py-2 bg-gray-700 rounded border border-gray-600 text-white"
              />
            </label>
            <label className="block">
              <span className="text-sm text-gray-400">Height</span>
              <input
                type="number"
                min="50"
                max={originalHeight}
                value={settings.height}
                onChange={(e) => handleHeightChange(Number(e.target.value))}
                disabled={disabled}
                className="w-full mt-1 px-3 py-2 bg-gray-700 rounded border border-gray-600 text-white"
              />
            </label>
          </div>

          {/* Colors */}
          <label className="block">
            <span className="text-sm text-gray-400">Colors: {settings.colors}</span>
            <input
              type="range"
              min="8"
              max="256"
              step="8"
              value={settings.colors}
              onChange={(e) => onChange({ ...settings, colors: Number(e.target.value) })}
              disabled={disabled}
              className="w-full mt-1"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>8</span>
              <span>256</span>
            </div>
          </label>

          {/* FPS */}
          <label className="block">
            <span className="text-sm text-gray-400">FPS: {settings.fps}</span>
            <input
              type="range"
              min="5"
              max={originalFps}
              step="1"
              value={settings.fps}
              onChange={(e) => onChange({ ...settings, fps: Number(e.target.value) })}
              disabled={disabled}
              className="w-full mt-1"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>5</span>
              <span>{originalFps} (original)</span>
            </div>
          </label>
        </div>
      )}
    </div>
  );
}
