import React from 'react';
import { Module, Language } from '../types';
import { Send, Copy, Download, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { copyToClipboard, downloadAsTextFile } from '../utils/storage';

interface MainContentProps {
  selectedModule: Module | null;
  input: string;
  output: string;
  isLoading: boolean;
  error: string | null;
  language: Language;
  onInputChange: (input: string) => void;
  onProcess: () => void;
}

const translations = {
  selectModuleTitle: { en: 'Select a Module', kn: 'ಒಂದು ಮಾಡ್ಯೂಲ್ ಆಯ್ಕೆಮಾಡಿ' },
  selectModuleDescription: { en: 'Choose a module from the sidebar to start generating content or analyzing images.', kn: 'ವಿಷಯವನ್ನು ರಚಿಸಲು ಅಥವಾ ಚಿತ್ರಗಳನ್ನು ವಿಶ್ಲೇಷಿಸಲು ಸೈಡ್‌ಬಾರ್‌ನಿಂದ ಒಂದು ಮಾಡ್ಯೂಲ್ ಆಯ್ಕೆಮಾಡಿ.' },
  input: { en: 'Input', kn: 'ಇನ್ಪುಟ್' },
  processHint: { en: 'Press Ctrl+Enter (Cmd+Enter on Mac) to process', kn: 'ಪ್ರಕ್ರಿಯೆಗೊಳಿಸಲು Ctrl+Enter (Mac ನಲ್ಲಿ Cmd+Enter) ಒತ್ತಿರಿ' },
  processing: { en: 'Processing...', kn: 'ಪ್ರಕ್ರಿಯೆಗೊಳಿಸಲಾಗುತ್ತಿದೆ...' },
  process: { en: 'Process', kn: 'ಪ್ರಕ್ರಿಯೆಗೊಳಿಸಿ' },
  output: { en: 'Output', kn: 'ಔಟ್ಪುಟ್' },
  copied: { en: 'Copied!', kn: 'ನಕಲಿಸಲಾಗಿದೆ!' },
  copy: { en: 'Copy', kn: 'ನಕಲಿಸಿ' },
  downloaded: { en: 'Downloaded!', kn: 'ಡೌನ್‌ಲೋಡ್ ಮಾಡಲಾಗಿದೆ!' },
  download: { en: 'Download', kn: 'ಡೌನ್‌ಲೋಡ್' },
  processingAI: { en: 'Processing with AI...', kn: 'AI ನೊಂದಿಗೆ ಪ್ರಕ್ರಿಯೆಗೊಳಿಸಲಾಗುತ್ತಿದೆ...' },
  mayTakeMoments: { en: 'This may take a few moments', kn: 'ಇದಕ್ಕೆ ಕೆಲವು ಕ್ಷಣಗಳು লাগಬಹುದು' },
  processingError: { en: 'Processing Error', kn: 'ಪ್ರಕ್ರಿಯೆ ದೋಷ' },
  outputWillAppear: { en: 'Output will appear here after processing', kn: 'ಪ್ರಕ್ರಿಯೆಯ ನಂತರ ಔಟ್ಪುಟ್ ಇಲ್ಲಿ ಕಾಣಿಸುತ್ತದೆ' },
};


export default function MainContent({
  selectedModule,
  input,
  output,
  isLoading,
  error,
  language,
  onInputChange,
  onProcess
}: MainContentProps) {
  const [copySuccess, setCopySuccess] = React.useState(false);
  const [downloadSuccess, setDownloadSuccess] = React.useState(false);

  const t = (key: keyof typeof translations) => translations[key][language];

  const handleCopy = async () => {
    const success = await copyToClipboard(output);
    if (success) {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
  };

  const handleDownload = () => {
    if (!selectedModule) return;
    const filename = `${selectedModule[language].name.replace(/\s+/g, '_').toLowerCase()}_output.txt`;
    downloadAsTextFile(output, filename);
    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 2000);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey) && !isLoading && selectedModule && input.trim()) {
      onProcess();
    }
  };

  if (!selectedModule) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <Send className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">{t('selectModuleTitle')}</h3>
          <p className="text-gray-500 max-w-sm">
            {t('selectModuleDescription')}
          </p>
        </div>
      </div>
    );
  }

  const content = selectedModule[language];

  return (
    <div className="flex-1 flex flex-col bg-white">
      {/* Module Info */}
      <div className="border-b border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900">{content.name}</h2>
        <p className="text-gray-600 mt-1">{content.description}</p>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row">
        {/* Input Section */}
        <div className="flex-1 flex flex-col border-r border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-2">{t('input')}</h3>
            <div className="space-y-4">
              <textarea
                value={input}
                onChange={(e) => onInputChange(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={content.inputPlaceholder}
                className="w-full h-64 p-4 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-500">
                  {t('processHint')}
                </p>
                <button
                  onClick={onProcess}
                  disabled={isLoading || !input.trim()}
                  className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>{t('processing')}</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>{t('process')}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Output Section */}
        <div className="flex-1 flex flex-col">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-gray-900">{t('output')}</h3>
              {output && (
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleCopy}
                    className="flex items-center space-x-1 px-3 py-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
                  >
                    {copySuccess ? (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                    <span className="text-sm">{copySuccess ? t('copied') : t('copy')}</span>
                  </button>
                  <button
                    onClick={handleDownload}
                    className="flex items-center space-x-1 px-3 py-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
                  >
                    {downloadSuccess ? (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    ) : (
                      <Download className="w-4 h-4" />
                    )}
                    <span className="text-sm">{downloadSuccess ? t('downloaded') : t('download')}</span>
                  </button>
                </div>
              )}
            </div>
            
            <div className="min-h-64 bg-gray-50 rounded-lg p-4 border border-gray-200">
              {isLoading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="text-center">
                    <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-3" />
                    <p className="text-gray-600">{t('processingAI')}</p>
                    <p className="text-sm text-gray-500 mt-1">{t('mayTakeMoments')}</p>
                  </div>
                </div>
              ) : error ? (
                <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-4 rounded-lg">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">{t('processingError')}</p>
                    <p className="text-sm mt-1">{error}</p>
                  </div>
                </div>
              ) : output ? (
                <div className="whitespace-pre-wrap text-gray-900 leading-relaxed">
                  {output}
                </div>
              ) : (
                <div className="flex items-center justify-center h-64">
                  <p className="text-gray-500">{t('outputWillAppear')}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}