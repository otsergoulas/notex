export default function LoadingSpinner() {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-2xl flex flex-col items-center gap-4">
        <div className="relative w-16 h-16">
          {/* Outer rotating ring */}
          <div className="absolute inset-0 border-4 border-blue-200 dark:border-blue-900 rounded-full"></div>

          {/* Animated spinning ring */}
          <div className="absolute inset-0 border-4 border-transparent border-t-blue-600 dark:border-t-blue-400 rounded-full animate-spin"></div>

          {/* Inner pulsing circle */}
          <div className="absolute inset-2 bg-blue-500/20 dark:bg-blue-400/20 rounded-full animate-pulse"></div>
        </div>

        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Processing
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Analyzing your image...
          </p>
        </div>
      </div>
    </div>
  );
}
