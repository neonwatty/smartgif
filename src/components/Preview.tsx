interface PreviewProps {
  originalUrl: string | null;
  resultUrl: string | null;
  originalSize: number;
  resultSize: number;
  resultDimensions?: { width: number; height: number };
}

export function Preview({
  originalUrl,
  resultUrl,
  originalSize,
  resultSize,
  resultDimensions,
}: PreviewProps) {
  if (!originalUrl) return null;

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Original */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-gray-400">Original</span>
          <span className="text-sm text-gray-500">{formatSize(originalSize)}</span>
        </div>
        <div className="bg-gray-800 rounded-lg p-4 flex items-center justify-center min-h-[200px]">
          <img
            src={originalUrl}
            alt="Original"
            className="max-w-full max-h-[400px] object-contain rounded"
          />
        </div>
      </div>

      {/* Result */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-gray-400">Result (GIF)</span>
          {resultSize > 0 && (
            <span className="text-sm text-gray-500">
              {formatSize(resultSize)}
              {resultDimensions && (
                <span className="ml-2">
                  ({resultDimensions.width}x{resultDimensions.height})
                </span>
              )}
            </span>
          )}
        </div>
        <div className="bg-gray-800 rounded-lg p-4 flex items-center justify-center min-h-[200px]">
          {resultUrl ? (
            <img
              src={resultUrl}
              alt="Result"
              className="max-w-full max-h-[400px] object-contain rounded"
            />
          ) : (
            <span className="text-gray-600">Convert to see result</span>
          )}
        </div>
      </div>
    </div>
  );
}
