import { useEffect } from 'react';
import { AlertCircle, X, RefreshCw } from 'lucide-react';

interface ErrorToastProps {
    message: string | null;
    onClose: () => void;
    onRetry?: () => void;
    duration?: number;
}

export default function ErrorToast({ message, onClose, onRetry, duration = 5000 }: ErrorToastProps) {
    useEffect(() => {
        if (message) {
            const timer = setTimeout(() => {
                onClose();
            }, duration);

            return () => clearTimeout(timer);
        }
    }, [message, onClose, duration]);

    if (!message) return null;

    return (
        <div className="fixed top-4 right-4 z-50 max-w-md">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 shadow-lg">
                <div className="flex items-start space-x-3">
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                        <p className="text-sm font-medium text-red-800">Error</p>
                        <p className="text-sm text-red-700 mt-1">{message}</p>
                        {onRetry && (
                            <button
                                onClick={onRetry}
                                className="flex items-center space-x-1 mt-2 px-2 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 transition-colors"
                            >
                                <RefreshCw className="w-3 h-3" />
                                <span>Retry</span>
                            </button>
                        )}
                    </div>
                    <button
                        onClick={onClose}
                        className="text-red-400 hover:text-red-600 transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
}