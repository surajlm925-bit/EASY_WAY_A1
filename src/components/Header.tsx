import React from 'react';
import { Settings, User, Shield } from 'lucide-react';

interface HeaderProps {
  isAdminMode: boolean;
  onToggleAdminMode: () => void;
  onOpenSettings: () => void;
}

export default function Header({ isAdminMode, onToggleAdminMode, onOpenSettings }: HeaderProps) {
  return (
    <header className="bg-white border-b border-gray-200 shadow-sm">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <img
              src="/easy-way-logo.svg"
              alt="Easy Way A1 Logo"
              className="w-12 h-6 object-contain"
            />
            <div>
              <h1 className="text-xl font-bold text-gray-900">Easy Way A1</h1>
              <p className="text-sm text-gray-500">AI Processing Platform</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={onToggleAdminMode}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${isAdminMode
                  ? 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
            >
              {isAdminMode ? (
                <>
                  <Shield className="w-4 h-4" />
                  <span>Admin Mode</span>
                </>
              ) : (
                <>
                  <User className="w-4 h-4" />
                  <span>User Mode</span>
                </>
              )}
            </button>
            <button
              onClick={onOpenSettings}
              className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
              aria-label="Open settings"
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}