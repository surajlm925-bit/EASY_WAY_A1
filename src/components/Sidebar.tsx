import React, { useState } from 'react';
import { Module, Language } from '../types';
import { Plus, Edit3, Trash2, Key, Save } from 'lucide-react';
import LoadingSpinner from './LoadingSpinner';
import ErrorState from './ErrorState';

interface SidebarProps {
  modules: Module[];
  selectedModule: Module | null;
  isAdminMode: boolean;
  apiKey: string;
  language: Language;
  isLoading: boolean;
  error: string | null;
  moduleOperationLoading: boolean;
  onSelectModule: (module: Module) => void;
  onAddModule: () => void;
  onEditModule: (module: Module) => void;
  onDeleteModule: (moduleId: number) => void;
  onApiKeyChange: (apiKey: string) => void;
  onRetryLoadModules: () => void;
}

const translations = {
  apiSettings: { en: 'API Settings', kn: 'API ಸೆಟ್ಟಿಂಗ್‌ಗಳು' },
  configure: { en: 'Configure', kn: 'ಕಾನ್ಫಿಗರ್ ಮಾಡಿ' },
  hide: { en: 'Hide', kn: 'ಮರೆಮಾಡಿ' },
  geminiApiKey: { en: 'Gemini API Key', kn: 'ಜೆಮಿನಿ API ಕೀ' },
  apiKeyPlaceholder: { en: 'Enter your Gemini API key...', kn: 'ನಿಮ್ಮ ಜೆಮಿನಿ API ಕೀಯನ್ನು ನಮೂದಿಸಿ...' },
  save: { en: 'Save', kn: 'ಉಳಿಸಿ' },
  getApiKey: { en: 'Get your API key from the', kn: 'ನಿಮ್ಮ API ಕೀಯನ್ನು ಇಲ್ಲಿಂದ ಪಡೆಯಿರಿ' },
  googleAiStudio: { en: 'Google AI Studio', kn: 'ಗೂಗಲ್ AI ಸ್ಟುಡಿಯೋ' },
  processingModules: { en: 'Processing Modules', kn: 'ಪ್ರೊಸೆಸಿಂಗ್ ಮಾಡ್ಯೂಲ್‌ಗಳು' },
  add: { en: 'Add', kn: 'ಸೇರಿಸಿ' },
  deleteConfirm: { en: 'Are you sure you want to delete this module?', kn: 'ಈ ಮಾಡ್ಯೂಲ್ ಅನ್ನು ಅಳಿಸಲು ನೀವು ಖಚಿತವಾಗಿ ಬಯಸುವಿರಾ?' },
  loadingModules: { en: 'Loading modules...', kn: 'ಮಾಡ್ಯೂಲ್‌ಗಳನ್ನು ಲೋಡ್ ಮಾಡಲಾಗುತ್ತಿದೆ...' },
  loadingError: { en: 'Failed to load modules', kn: 'ಮಾಡ್ಯೂಲ್‌ಗಳನ್ನು ಲೋಡ್ ಮಾಡಲು ವಿಫಲವಾಗಿದೆ' },
  retry: { en: 'Retry', kn: 'ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ' },
  noModules: { en: 'No modules available', kn: 'ಯಾವುದೇ ಮಾಡ್ಯೂಲ್‌ಗಳು ಲಭ್ಯವಿಲ್ಲ' }
};

export default function Sidebar({
  modules,
  selectedModule,
  isAdminMode,
  apiKey,
  language,
  isLoading,
  error,
  moduleOperationLoading,
  onSelectModule,
  onAddModule,
  onEditModule,
  onDeleteModule,
  onApiKeyChange,
  onRetryLoadModules
}: SidebarProps) {
  const [showApiKey, setShowApiKey] = useState(false);
  const [tempApiKey, setTempApiKey] = useState(apiKey);

  const handleSaveApiKey = () => {
    onApiKeyChange(tempApiKey);
    setShowApiKey(false);
  };

  const t = (key: keyof typeof translations) => translations[key][language];

  return (
    <div className="w-80 bg-gray-50 border-r border-gray-200 flex flex-col h-full">
      {/* API Settings (Admin Only) */}
      {isAdminMode && (
        <div className="p-4 border-b border-gray-200 bg-white">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-900 flex items-center space-x-2">
              <Key className="w-4 h-4" />
              <span>{t('apiSettings')}</span>
            </h3>
            <button
              onClick={() => setShowApiKey(!showApiKey)}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              {showApiKey ? t('hide') : t('configure')}
            </button>
          </div>

          {showApiKey && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  {t('geminiApiKey')}
                </label>
                <input
                  type="password"
                  value={tempApiKey}
                  onChange={(e) => setTempApiKey(e.target.value)}
                  placeholder={t('apiKeyPlaceholder')}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <button
                onClick={handleSaveApiKey}
                className="flex items-center space-x-1 px-3 py-1.5 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
              >
                <Save className="w-3 h-3" />
                <span>{t('save')}</span>
              </button>
              <p className="text-xs text-gray-500">
                {t('getApiKey')}{' '}
                <a
                  href="https://makersuite.google.com/app/apikey"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-700"
                >
                  {t('googleAiStudio')}
                </a>
              </p>
            </div>
          )}
        </div>
      )}

      {/* Modules List */}
      <div className="flex-1 overflow-hidden flex flex-col">
        <div className="flex-shrink-0 p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">{t('processingModules')}</h3>
            {isAdminMode && (
              <button
                onClick={onAddModule}
                disabled={moduleOperationLoading}
                className="flex items-center space-x-1 px-3 py-1.5 bg-emerald-600 text-white text-sm rounded-md hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus className="w-3 h-3" />
                <span>{t('add')}</span>
              </button>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-2">
            {isLoading ? (
              <LoadingSpinner
                size="md"
                text={t('loadingModules')}
                className="py-8"
              />
            ) : error ? (
              <ErrorState
                title={t('loadingError')}
                message={error}
                onRetry={onRetryLoadModules}
                retryText={t('retry')}
              />
            ) : modules.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-sm text-gray-500">{t('noModules')}</p>
              </div>
            ) : (
              modules.map((module) => (
                <div
                  key={module.id}
                  className={`p-3 rounded-lg border cursor-pointer transition-all duration-200 ${selectedModule?.id === module.id
                    ? 'bg-blue-50 border-blue-200 shadow-sm'
                    : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-sm'
                    } ${moduleOperationLoading ? 'opacity-50 pointer-events-none' : ''}`}
                  onClick={() => !moduleOperationLoading && onSelectModule(module)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900 text-sm truncate">
                        {module[language].name}
                      </h4>
                      <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                        {module[language].description}
                      </p>
                    </div>

                    {isAdminMode && (
                      <div className="flex items-center space-x-1 ml-2">
                        <button
                          onClick={(e: { stopPropagation: () => void; }) => {
                            e.stopPropagation();
                            if (!moduleOperationLoading) {
                              onEditModule(module);
                            }
                          }}
                          disabled={moduleOperationLoading}
                          className="p-1 text-gray-400 hover:text-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Edit3 className="w-3 h-3" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (!moduleOperationLoading && confirm(t('deleteConfirm'))) {
                              onDeleteModule(module.id);
                            }
                          }}
                          disabled={moduleOperationLoading}
                          className="p-1 text-gray-400 hover:text-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}