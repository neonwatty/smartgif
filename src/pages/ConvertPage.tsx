import { useState, useCallback } from 'react';
import { DropZone } from '../components/DropZone';
import { Controls } from '../components/Controls';
import { Preview } from '../components/Preview';
import { ProgressBar } from '../components/ProgressBar';
import { decodeFile } from '../lib/decoder';
import { optimizeForTargetSize, encodeWithSettings } from '../lib/optimizer';
import type { Frame, ConversionSettings, ConversionProgress } from '../types';

const defaultSettings: ConversionSettings = {
  mode: 'auto',
  targetSizeKB: 5000,
  width: 800,
  height: 600,
  colors: 256,
  fps: 15,
  dithering: 'floyd-steinberg',
  loop: 0,
};

export function ConvertPage() {
  const [file, setFile] = useState<File | null>(null);
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [frames, setFrames] = useState<Frame[]>([]);
  const [originalDimensions, setOriginalDimensions] = useState({ width: 0, height: 0, fps: 10 });
  const [settings, setSettings] = useState<ConversionSettings>(defaultSettings);
  const [progress, setProgress] = useState<ConversionProgress | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [resultDimensions, setResultDimensions] = useState<{ width: number; height: number } | null>(null);

  const handleFileSelect = useCallback(async (selectedFile: File) => {
    setFile(selectedFile);
    setOriginalUrl(URL.createObjectURL(selectedFile));
    setResultUrl(null);
    setResultBlob(null);
    setResultDimensions(null);
    setProgress({ stage: 'decoding', percent: 0, message: 'Loading file...' });

    try {
      const result = await decodeFile(selectedFile, (percent, message) => {
        setProgress({ stage: 'decoding', percent, message });
      });

      setFrames(result.frames);
      setOriginalDimensions({
        width: result.width,
        height: result.height,
        fps: result.fps,
      });

      setSettings((prev) => ({
        ...prev,
        width: result.width,
        height: result.height,
        fps: result.fps,
      }));

      setProgress(null);
    } catch (error) {
      console.error('Decode error:', error);
      setProgress({
        stage: 'error',
        percent: 0,
        message: `Error: ${error instanceof Error ? error.message : 'Failed to decode file'}`,
      });
    }
  }, []);

  const handleConvert = useCallback(async () => {
    if (frames.length === 0) return;

    setProgress({ stage: 'encoding', percent: 0, message: 'Starting conversion...' });

    try {
      let data: Uint8Array;
      let finalWidth = settings.width;
      let finalHeight = settings.height;

      if (settings.mode === 'auto') {
        setProgress({ stage: 'optimizing', percent: 0, message: 'Finding optimal settings...' });

        const result = await optimizeForTargetSize(
          frames,
          {
            targetSizeKB: settings.targetSizeKB,
            originalWidth: originalDimensions.width,
            originalHeight: originalDimensions.height,
            originalFps: originalDimensions.fps,
          },
          (optimizeProgress) => {
            setProgress({
              stage: 'optimizing',
              percent: (optimizeProgress.attempt / optimizeProgress.totalAttempts) * 100,
              message: optimizeProgress.message,
              currentAttempt: {
                scale: optimizeProgress.scale,
                colors: optimizeProgress.colors,
                sizeKB: optimizeProgress.sizeKB,
              },
            });
          }
        );

        if (!result) {
          throw new Error('Could not find settings to meet target size. Try increasing the target size.');
        }

        data = result.data;
        finalWidth = result.width;
        finalHeight = result.height;
      } else {
        setProgress({ stage: 'encoding', percent: 0, message: 'Encoding GIF...' });

        data = await encodeWithSettings(
          frames,
          {
            width: settings.width,
            height: settings.height,
            colors: settings.colors,
            fps: settings.fps,
            originalFps: originalDimensions.fps,
          },
          (percent) => {
            setProgress({ stage: 'encoding', percent, message: 'Encoding GIF...' });
          }
        );

        finalWidth = settings.width;
        finalHeight = settings.height;
      }

      const arrayBuffer = new ArrayBuffer(data.length);
      new Uint8Array(arrayBuffer).set(data);
      const blob = new Blob([arrayBuffer], { type: 'image/gif' });
      const url = URL.createObjectURL(blob);

      setResultBlob(blob);
      setResultUrl(url);
      setResultDimensions({ width: finalWidth, height: finalHeight });
      setProgress({ stage: 'done', percent: 100, message: 'Done!' });
    } catch (error) {
      console.error('Conversion error:', error);
      setProgress({
        stage: 'error',
        percent: 0,
        message: `Error: ${error instanceof Error ? error.message : 'Conversion failed'}`,
      });
    }
  }, [frames, settings, originalDimensions]);

  const handleDownload = useCallback(() => {
    if (!resultBlob || !file) return;

    const fileName = file.name.replace(/\.[^.]+$/, '') + '.gif';
    const url = URL.createObjectURL(resultBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
  }, [resultBlob, file]);

  const handleReset = useCallback(() => {
    setFile(null);
    setOriginalUrl(null);
    setFrames([]);
    setResultUrl(null);
    setResultBlob(null);
    setResultDimensions(null);
    setProgress(null);
    setSettings(defaultSettings);
  }, []);

  const isProcessing = progress !== null && progress.stage !== 'done' && progress.stage !== 'error';

  return (
    <>
      <header className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Convert to GIF</h1>
        <p className="text-gray-400">
          Upload PNG, JPEG, WebP, GIF, MP4, or WebM → Convert to optimized GIF
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="space-y-6">
          {!file ? (
            <DropZone onFileSelect={handleFileSelect} disabled={isProcessing} />
          ) : (
            <>
              <div className="bg-gray-800 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium truncate">{file.name}</p>
                    <p className="text-sm text-gray-500">
                      {originalDimensions.width}x{originalDimensions.height} &bull;{' '}
                      {frames.length} frames &bull; {originalDimensions.fps} fps
                    </p>
                  </div>
                  <button
                    onClick={handleReset}
                    disabled={isProcessing}
                    className="text-gray-400 hover:text-white disabled:opacity-50"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="bg-gray-800 rounded-lg p-4">
                <h2 className="font-medium mb-4">Settings</h2>
                <Controls
                  settings={settings}
                  onChange={setSettings}
                  originalWidth={originalDimensions.width}
                  originalHeight={originalDimensions.height}
                  originalFps={originalDimensions.fps}
                  disabled={isProcessing}
                />
              </div>

              <button
                onClick={handleConvert}
                disabled={isProcessing || frames.length === 0}
                className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed rounded-lg font-medium transition-colors"
              >
                {isProcessing ? 'Converting...' : 'Convert to GIF'}
              </button>

              {progress && progress.stage !== 'done' && (
                <ProgressBar
                  percent={progress.percent}
                  message={progress.message}
                  details={
                    progress.currentAttempt
                      ? `Scale: ${(progress.currentAttempt.scale * 100).toFixed(0)}%, Colors: ${progress.currentAttempt.colors}, Size: ${progress.currentAttempt.sizeKB}KB`
                      : undefined
                  }
                />
              )}

              {resultBlob && (
                <button
                  onClick={handleDownload}
                  className="w-full py-3 px-4 bg-green-600 hover:bg-green-700 rounded-lg font-medium transition-colors"
                >
                  Download GIF ({(resultBlob.size / 1024).toFixed(0)} KB)
                </button>
              )}
            </>
          )}
        </div>

        <div className="lg:col-span-2">
          {file && (
            <Preview
              originalUrl={originalUrl}
              resultUrl={resultUrl}
              originalSize={file.size}
              resultSize={resultBlob?.size || 0}
              resultDimensions={resultDimensions ?? undefined}
            />
          )}
        </div>
      </div>
    </>
  );
}
