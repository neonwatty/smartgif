import { useCallback, useState, type ReactNode } from 'react';
import { DropZone } from './DropZone';
import { useToolFrames } from '../hooks/useToolFrames';
import { useSEO } from '../hooks/useSEO';
import { useFAQSchema } from '../hooks/useFAQSchema';
import type { Frame } from '../types';
import type { FAQItem } from '../lib/faqData';

interface ToolPageWrapperProps {
  title: string;
  description: string;
  seoTitle: string;
  seoDescription: string;
  canonicalPath: string;
  pageId: string;
  faqs: FAQItem[];
  children: (props: {
    frames: Frame[];
    onFramesChange: (frames: Frame[], width?: number, height?: number) => void;
    originalWidth: number;
    originalHeight: number;
    originalFps: number;
  }) => ReactNode;
}

export function ToolPageWrapper({
  title,
  description,
  seoTitle,
  seoDescription,
  canonicalPath,
  pageId,
  faqs,
  children,
}: ToolPageWrapperProps) {
  useSEO({ title: seoTitle, description: seoDescription, canonicalPath });
  useFAQSchema(pageId, faqs);
  const {
    file,
    frames,
    originalWidth,
    originalHeight,
    originalFps,
    isLoading,
    error,
    handleFileSelect,
    handleFramesChange,
    handleReset,
    createDownload,
  } = useToolFrames();

  const [isExporting, setIsExporting] = useState(false);

  const handleDownload = useCallback(async () => {
    if (!file) return;

    setIsExporting(true);
    try {
      const blob = await createDownload();
      if (blob) {
        const fileName = file.name.replace(/\.[^.]+$/, '') + '_edited.gif';
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        a.click();
        URL.revokeObjectURL(url);
      }
    } finally {
      setIsExporting(false);
    }
  }, [file, createDownload]);

  return (
    <>
      <header className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">{title}</h1>
        <p className="text-gray-400">{description}</p>
      </header>

      {!file ? (
        <div className="max-w-xl mx-auto">
          <DropZone onFileSelect={handleFileSelect} disabled={isLoading} />
          {error && (
            <p className="mt-4 text-center text-red-500">{error}</p>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {/* File Info Bar */}
          <div className="bg-gray-800 rounded-lg p-4 flex items-center justify-between">
            <div>
              <p className="font-medium">{file.name}</p>
              <p className="text-sm text-gray-500">
                {originalWidth}x{originalHeight} &bull; {frames.length} frames &bull; {originalFps} fps
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleDownload}
                disabled={isExporting || frames.length === 0}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-700 rounded-lg text-sm font-medium transition-colors"
              >
                {isExporting ? 'Exporting...' : 'Download GIF'}
              </button>
              <button
                onClick={handleReset}
                className="text-gray-400 hover:text-white"
                title="Upload different file"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {isLoading ? (
            <div className="bg-gray-800 rounded-lg p-8 text-center">
              <p className="text-gray-400">Loading...</p>
            </div>
          ) : frames.length > 0 ? (
            <div className="bg-gray-800 rounded-lg p-6">
              {children({
                frames,
                onFramesChange: handleFramesChange,
                originalWidth,
                originalHeight,
                originalFps,
              })}
            </div>
          ) : (
            <div className="bg-gray-800 rounded-lg p-8 text-center">
              <p className="text-gray-400">No frames found in file</p>
            </div>
          )}
        </div>
      )}
    </>
  );
}
