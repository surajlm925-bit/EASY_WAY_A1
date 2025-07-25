import { useEffect } from 'react';
import { CheckCircle, X } from 'lucide-react';

interface SuccessToastProps {
    message: string | null;
    onClose: () => void;
    duration?: number;
}

export default function SuccessToast({ message, onClose, duration = 3000 }: SuccessToastProps) {
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
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 shadow-lg">
                <div className="flex items-start space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                        <p className="text-sm font-medium text-green-800">Success</p>
                        <p className="text-sm text-green-700 mt-1">{message}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-green-400 hover:text-green-600 transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
}