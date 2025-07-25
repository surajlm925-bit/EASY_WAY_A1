
import React from 'react';
import { X, Globe } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: 'en' | 'kn';
  onLanguageChange: (language: 'en' | 'kn') => void;
}

export default function SettingsModal({
  isOpen,
  onClose,
  language,
  onLanguageChange,
}: SettingsModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
            <Globe className="w-5 h-5" />
            <span>Settings</span>
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            <div>
              <label
                htmlFor="language-select"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Display Language
              </label>
              <select
                id="language-select"
                value={language}
                onChange={(e) => onLanguageChange(e.target.value as 'en' | 'kn')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="en">English</option>
                <option value="kn">Kannada (ಕನ್ನಡ)</option>
              </select>
            </div>
          </div>
        </div>
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
