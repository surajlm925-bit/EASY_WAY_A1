import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase, authHelpers, UserProfile } from '../lib/supabase';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  isLoading: boolean;
  isAdmin: boolean;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<{ error: any }>;
  trackModuleUsage: (moduleData: {
    module_name: string;
    input_data: any;
    output_data: any;
    processing_time: number;
    status?: 'completed' | 'failed' | 'processing';
  }) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAdmin = profile?.role === 'admin';

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        await loadUserProfile(session.user.id);
      }
      setIsLoading(false);
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          setUser(session.user);
          await loadUserProfile(session.user.id);
        } else {
          setUser(null);
          setProfile(null);
        }
        setIsLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const loadUserProfile = async (userId: string) => {
    try {
      const { profile, error } = await authHelpers.getUserProfile(userId);
      if (error) {
        console.error('Error loading user profile:', error);
        // Try to create profile if it doesn't exist
        const { user } = await authHelpers.getCurrentUser();
        if (user) {
          const createdProfile = await authHelpers.ensureUserProfile(user);
          setProfile(createdProfile);
        }
      } else {
        setProfile(profile);
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
    }
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await authHelpers.signUp(email, password, fullName);
      return { error };
    } finally {
      setIsLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await authHelpers.signIn(email, password);
      return { error };
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    setIsLoading(true);
    try {
      await authHelpers.signOut();
      setUser(null);
      setProfile(null);
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) return { error: new Error('No user logged in') };

    try {
      const { data, error } = await authHelpers.updateUserProfile(user.id, updates);
      if (!error && data) {
        setProfile(data);
      }
      return { error };
    } catch (error) {
      return { error };
    }
  };

  const trackModuleUsage = async (moduleData: {
    module_name: string;
    input_data: any;
    output_data: any;
    processing_time: number;
    status?: 'completed' | 'failed' | 'processing';
  }) => {
    if (!user) return;

    try {
      await authHelpers.trackModuleUsage({
        user_id: user.id,
        ...moduleData,
        status: moduleData.status || 'completed',
      });
    } catch (error) {
      console.error('Error tracking module usage:', error);
    }
  };

  const value: AuthContextType = {
    user,
    profile,
    isLoading,
    isAdmin,
    signUp,
    signIn,
    signOut,
    updateProfile,
    trackModuleUsage,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}