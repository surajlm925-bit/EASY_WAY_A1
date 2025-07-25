import { AlertCircle, RefreshCw } from 'lucide-react';

interface ErrorStateProps {
    title: string;
    message: string;
    onRetry?: () => void;
    retryText?: string;
    className?: string;
}

export default function ErrorState({
    title,
    message,
    onRetry,
    retryText = 'Retry',
    className = ''
}: ErrorStateProps) {
    return (
        <div className={`bg-red-50 border border-red-200 rounded-lg p-4 ${className}`}>
            <div className="flex items-center space-x-2 text-red-600 mb-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <p className="text-sm font-medium">{title}</p>
            </div>
            <p className="text-xs text-red-500 mb-3">{message}</p>
            {onRetry && (
                <button
                    onClick={onRetry}
                    className="flex items-center space-x-1 px-3 py-1.5 bg-red-600 text-white text-xs rounded-md hover:bg-red-700 transition-colors"
                >
                    <RefreshCw className="w-3 h-3" />
                    <span>{retryText}</span>
                </button>
            )}
        </div>
    );
}