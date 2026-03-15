export default function ErrorState({ message, onRetry }) {
    return (
        <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
            <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center text-3xl">
                ⚠️
            </div>
            <div>
                <p className="text-lg font-semibold text-gray-700">Something went wrong</p>
                <p className="text-sm text-red-500 mt-1 max-w-sm mx-auto">{message}</p>
            </div>
            {onRetry && (
                <button
                    onClick={onRetry}
                    className="mt-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors"
                >
                    Try Again
                </button>
            )}
        </div>
    );
}
