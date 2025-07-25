import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
    size?: 'sm' | 'md' | 'lg';
    text?: string;
    className?: string;
}

export default function LoadingSpinner({
    size = 'md',
    text,
    className = ''
}: LoadingSpinnerProps) {
    const sizeClasses = {
        sm: 'w-4 h-4',
        md: 'w-6 h-6',
        lg: 'w-8 h-8'
    };

    const textSizeClasses = {
        sm: 'text-xs',
        md: 'text-sm',
        lg: 'text-base'
    };

    return (
        <div className={`flex items-center justify-center ${className}`}>
            <div className="text-center">
                <Loader2 className={`${sizeClasses[size]} text-blue-600 animate-spin mx-auto ${text ? 'mb-2' : ''}`} />
                {text && (
                    <p className={`text-gray-500 ${textSizeClasses[size]}`}>{text}</p>
                )}
            </div>
        </div>
    );
}