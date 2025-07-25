import React from 'react';
import { Settings, User, Shield, LogOut, UserCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { UserProfile } from '../lib/supabase';

interface HeaderProps {
  isAdminMode: boolean;
  onToggleAdminMode?: () => void;
  onOpenSettings: () => void;
  user: any;
  profile: UserProfile | null;
}

export default function Header({ 
  isAdminMode, 
  onToggleAdminMode, 
  onOpenSettings, 
  user, 
  profile 
}: HeaderProps) {
  const { signOut, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = React.useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

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
            {/* Admin Mode Toggle - only show for admins */}
            {isAdmin && onToggleAdminMode && (
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
            )}

            {/* Settings Button */}
            <button
              onClick={onOpenSettings}
              className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
              aria-label="Open settings"
            >
              <Settings className="w-5 h-5" />
            </button>

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center space-x-2 p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
              >
                <UserCircle className="w-5 h-5" />
                <span className="text-sm font-medium">{profile?.full_name || 'User'}</span>
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                  <div className="px-4 py-2 border-b border-gray-200">
                    <p className="text-sm font-medium text-gray-900">{profile?.full_name}</p>
                    <p className="text-xs text-gray-500">{profile?.email}</p>
                    {profile?.role && (
                      <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                        profile.role === 'admin' 
                          ? 'bg-purple-100 text-purple-800' 
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {profile.role === 'admin' ? 'Administrator' : 'User'}
                      </span>
                    )}
                  </div>
                  
                  <button
                    onClick={() => {
                      navigate('/profile');
                      setShowUserMenu(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                  >
                    <User className="w-4 h-4" />
                    <span>Profile</span>
                  </button>
                  
                  {isAdmin && (
                    <button
                      onClick={() => {
                        navigate('/admin');
                        setShowUserMenu(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                    >
                      <Shield className="w-4 h-4" />
                      <span>Admin Dashboard</span>
                    </button>
                  )}
                  
                  <button
                    onClick={handleSignOut}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}