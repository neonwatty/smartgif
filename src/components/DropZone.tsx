import { useCallback, useState, useEffect, useRef } from 'react';
import {
  fetchImageFromUrl,
  getFilenameFromUrl,
  UrlFetchError,
} from '../lib/urlFetcher';

interface DropZoneProps {
  onFileSelect: (file: File) => void;
  accept?: string;
  disabled?: boolean;
}

type TabType = 'upload' | 'url';

export function DropZone({
  onFileSelect,
  accept = 'image/*,video/*,.webp,.gif,.mp4,.webm',
  disabled = false,
}: DropZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('upload');
  const [urlInput, setUrlInput] = useState('');
  const [isLoadingUrl, setIsLoadingUrl] = useState(false);
  const [urlError, setUrlError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Handle clipboard paste
  useEffect(() => {
    const handlePaste = async (e: ClipboardEvent) => {
      if (disabled) return;

      const items = e.clipboardData?.items;
      if (!items) return;

      // Check for image in clipboard
      for (const item of items) {
        if (item.type.startsWith('image/')) {
          e.preventDefault();
          const blob = item.getAsFile();
          if (blob) {
            onFileSelect(blob);
            return;
          }
        }
      }

      // Check for URL in clipboard
      const text = e.clipboardData?.getData('text');
      if (text && isLikelyImageUrl(text)) {
        e.preventDefault();
        setActiveTab('url');
        setUrlInput(text);
        // Auto-load if it looks like an image URL
        await loadFromUrl(text);
      }
    };

    document.addEventListener('paste', handlePaste);
    return () => document.removeEventListener('paste', handlePaste);
  }, [disabled, onFileSelect, loadFromUrl]);

  const isLikelyImageUrl = (text: string): boolean => {
    try {
      const url = new URL(text.trim().startsWith('http') ? text : `https://${text}`);
      return (
        /\.(gif|png|jpg|jpeg|webp)(\?|$)/i.test(url.pathname) ||
        /giphy\.com|imgur\.com|tenor\.com|i\.redd\.it/i.test(url.hostname)
      );
    } catch {
      return false;
    }
  };

  const loadFromUrl = useCallback(async (url: string) => {
    if (!url.trim()) {
      setUrlError('Please enter a URL');
      return;
    }

    setIsLoadingUrl(true);
    setUrlError(null);

    try {
      const result = await fetchImageFromUrl(url);
      const filename = getFilenameFromUrl(result.url);
      const file = new File([result.blob], filename, { type: result.mimeType });
      onFileSelect(file);
      setUrlInput('');
    } catch (error) {
      if (error instanceof UrlFetchError) {
        setUrlError(error.message);
      } else {
        setUrlError('Failed to load image from URL');
      }
    } finally {
      setIsLoadingUrl(false);
    }
  }, [onFileSelect]);

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadFromUrl(urlInput);
  };

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragIn = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true);
    }
  }, []);

  const handleDragOut = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      if (disabled) return;

      // Check for files first
      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        onFileSelect(e.dataTransfer.files[0]);
        return;
      }

      // Check for URL (dragged link)
      const url =
        e.dataTransfer.getData('text/uri-list') || e.dataTransfer.getData('text/plain');
      if (url && isLikelyImageUrl(url)) {
        setActiveTab('url');
        setUrlInput(url);
        await loadFromUrl(url);
      }
    },
    [onFileSelect, disabled, loadFromUrl]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        onFileSelect(e.target.files[0]);
      }
    },
    [onFileSelect]
  );

  return (
    <div ref={containerRef} className="space-y-3">
      {/* Tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => setActiveTab('upload')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'upload'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          📁 Upload File
        </button>
        <button
          onClick={() => setActiveTab('url')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'url'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          🔗 Paste URL
        </button>
      </div>

      {activeTab === 'upload' ? (
        /* File Upload Drop Zone */
        <div
          className={`
            relative border-2 border-dashed rounded-xl p-12 text-center cursor-pointer
            transition-all duration-200 ease-in-out
            ${
              isDragging
                ? 'border-blue-500 bg-blue-500/10'
                : 'border-gray-600 hover:border-gray-500 hover:bg-gray-800/50'
            }
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          `}
          onDragEnter={handleDragIn}
          onDragLeave={handleDragOut}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => !disabled && document.getElementById('file-input')?.click()}
        >
          <input
            id="file-input"
            type="file"
            accept={accept}
            onChange={handleFileInput}
            className="hidden"
            disabled={disabled}
          />

          <div className="flex flex-col items-center gap-4">
            <svg
              className={`w-16 h-16 ${isDragging ? 'text-blue-500' : 'text-gray-500'}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>

            <div>
              <p className="text-lg font-medium text-gray-200">
                {isDragging ? 'Drop file here' : 'Drag & drop or click to upload'}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Supports PNG, JPEG, WebP, GIF, MP4, WebM
              </p>
              <p className="text-xs text-gray-600 mt-2">
                Pro tip: Press Ctrl+V to paste an image or URL
              </p>
            </div>
          </div>
        </div>
      ) : (
        /* URL Input */
        <div className="border-2 border-dashed border-gray-600 rounded-xl p-8">
          <form onSubmit={handleUrlSubmit} className="space-y-4">
            <div className="flex flex-col items-center gap-4">
              <svg
                className="w-12 h-12 text-gray-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                />
              </svg>

              <div className="w-full max-w-lg">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={urlInput}
                    onChange={(e) => {
                      setUrlInput(e.target.value);
                      setUrlError(null);
                    }}
                    placeholder="https://example.com/image.gif"
                    disabled={disabled || isLoadingUrl}
                    className="flex-1 px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                  />
                  <button
                    type="submit"
                    disabled={disabled || isLoadingUrl || !urlInput.trim()}
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:text-gray-500 text-white font-medium rounded-lg transition-colors"
                  >
                    {isLoadingUrl ? (
                      <span className="flex items-center gap-2">
                        <svg
                          className="animate-spin h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          />
                        </svg>
                        Loading
                      </span>
                    ) : (
                      'Load'
                    )}
                  </button>
                </div>

                {urlError && (
                  <div className="mt-3 p-3 bg-red-900/30 border border-red-700 rounded-lg">
                    <p className="text-sm text-red-400">{urlError}</p>
                  </div>
                )}

                <p className="text-xs text-gray-500 mt-3 text-center">
                  Enter an image or GIF URL, or press Ctrl+V to paste
                </p>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
