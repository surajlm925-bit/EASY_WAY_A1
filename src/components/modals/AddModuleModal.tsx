import React, { useState } from 'react';
import { X, Plus, Loader2 } from 'lucide-react';
import { ModuleContent } from '../../types';

interface AddModuleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (moduleData: {
    prompt: string;
    en: ModuleContent;
    kn: ModuleContent;
  }) => void;
}

export default function AddModuleModal({ isOpen, onClose, onAdd }: AddModuleModalProps) {
  const [prompt, setPrompt] = useState('');
  const [enData, setEnData] = useState<ModuleContent>({ name: '', description: '', inputPlaceholder: '' });
  const [knData, setKnData] = useState<ModuleContent>({ name: '', description: '', inputPlaceholder: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || !enData.name.trim() || !knData.name.trim()) return;

    setIsSubmitting(true);
    try {
      await onAdd({ prompt, en: enData, kn: knData });
      resetForm();
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setPrompt('');
    setEnData({ name: '', description: '', inputPlaceholder: '' });
    setKnData({ name: '', description: '', inputPlaceholder: '' });
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 flex items-center space-x-2">
            <Plus className="w-5 h-5" />
            <span>Add New Module</span>
          </h2>
          <button
            onClick={handleClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              AI Prompt *
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Enter the prompt that will be sent to the AI..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg resize-none h-24 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* English Fields */}
            <div className="space-y-4 p-4 border rounded-lg">
              <h3 className="font-semibold text-lg">English Content</h3>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Name *</label>
                <input
                  type="text"
                  value={enData.name}
                  onChange={(e) => setEnData({ ...enData, name: e.target.value })}
                  placeholder="e.g., Content Summarizer"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Description</label>
                <input
                  type="text"
                  value={enData.description}
                  onChange={(e) => setEnData({ ...enData, description: e.target.value })}
                  placeholder="Module description..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Input Placeholder</label>
                <input
                  type="text"
                  value={enData.inputPlaceholder}
                  onChange={(e) => setEnData({ ...enData, inputPlaceholder: e.target.value })}
                  placeholder="e.g., Paste text here..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Kannada Fields */}
            <div className="space-y-4 p-4 border rounded-lg">
              <h3 className="font-semibold text-lg">Kannada Content (ಕನ್ನಡ)</h3>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">ಹೆಸರು *</label>
                <input
                  type="text"
                  value={knData.name}
                  onChange={(e) => setKnData({ ...knData, name: e.target.value })}
                  placeholder="ಉದಾ., ವಿಷಯ ಸಾರಾಂಶಕಾರ"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">ವಿವರಣೆ</label>
                <input
                  type="text"
                  value={knData.description}
                  onChange={(e) => setKnData({ ...knData, description: e.target.value })}
                  placeholder="ಮಾಡ್ಯೂಲ್ ವಿವರಣೆ..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">ಇನ್ಪುಟ್ ಪ್ಲೇಸ್ಹೋಲ್ಡರ್</label>
                <input
                  type="text"
                  value={knData.inputPlaceholder}
                  onChange={(e) => setKnData({ ...knData, inputPlaceholder: e.target.value })}
                  placeholder="ಉದಾ., ಇಲ್ಲಿ ಪಠ್ಯವನ್ನು ಅಂಟಿಸಿ..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        </form>

        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50">
          <button
            type="button"
            onClick={handleClose}
            className="px-6 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            onClick={handleSubmit} // Form submission is handled by form's onSubmit
            disabled={isSubmitting || !prompt.trim() || !enData.name.trim() || !knData.name.trim()}
            className="flex items-center space-x-2 px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
            <span>{isSubmitting ? 'Adding...' : 'Add Module'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}