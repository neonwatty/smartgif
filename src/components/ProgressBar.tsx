interface ProgressBarProps {
  percent: number;
  message: string;
  details?: string;
}

export function ProgressBar({ percent, message, details }: ProgressBarProps) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className="text-gray-300">{message}</span>
        <span className="text-gray-500">{Math.round(percent)}%</span>
      </div>
      <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
        <div
          className="h-full bg-blue-500 transition-all duration-200"
          style={{ width: `${percent}%` }}
        />
      </div>
      {details && (
        <p className="text-xs text-gray-500">{details}</p>
      )}
    </div>
  );
}
