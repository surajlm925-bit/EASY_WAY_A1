import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types for our database
export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: 'admin' | 'user';
  created_at: string;
  updated_at: string;
}

export interface ModuleUsage {
  id: string;
  user_id: string;
  module_name: string;
  input_data: any;
  output_data: any;
  processing_time: number;
  status: 'completed' | 'failed' | 'processing';
  created_at: string;
}

// Auth helper functions
export const authHelpers = {
  async signUp(email: string, password: string, fullName: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });
    return { data, error };
  },

  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  },

  async signOut() {
    const { error } = await supabase.auth.signOut();
    return { error };
  },

  async resetPassword(email: string) {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email);
    return { data, error };
  },

  async updatePassword(password: string) {
    const { data, error } = await supabase.auth.updateUser({
      password,
    });
    return { data, error };
  },

  async getCurrentUser() {
    const { data: { user }, error } = await supabase.auth.getUser();
    return { user, error };
  },

  async getUserProfile(userId: string): Promise<{ profile: UserProfile | null; error: any }> {
    const { data: profile, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    return { profile, error };
  },

  async updateUserProfile(userId: string, updates: Partial<UserProfile>) {
    const { data, error } = await supabase
      .from('user_profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();
    
    return { data, error };
  },

  async trackModuleUsage(usage: Omit<ModuleUsage, 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('module_usage')
      .insert([usage])
      .select()
      .single();
    
    return { data, error };
  },

  async getUserModuleUsage(userId: string, limit = 10) {
    const { data, error } = await supabase
      .from('module_usage')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);
    
    return { data, error };
  },

  async getAllUsers() {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .order('created_at', { ascending: false });
    
    return { data, error };
  },

  async getAllModuleUsage(limit = 100) {
    const { data, error } = await supabase
      .from('module_usage')
      .select(`
        *,
        user_profiles (
          email,
          full_name
        )
      `)
      .order('created_at', { ascending: false })
      .limit(limit);
    
    return { data, error };
  },

  // Helper function to ensure user profile exists
  async ensureUserProfile(user: any) {
    if (!user) return null;

    // Check if profile exists
    const { data: existingProfile, error: fetchError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (existingProfile && !fetchError) {
      return existingProfile;
    }

    // Create profile if it doesn't exist
    const { data: newProfile, error } = await supabase
      .from('user_profiles')
      .upsert([{
        id: user.id,
        email: user.email,
        full_name: user.user_metadata?.full_name || '',
        role: 'user'
      }], { onConflict: 'id' })
      .select()
      .single();

    if (error) {
      console.error('Error creating user profile:', error);
      // If insert fails, try to fetch existing profile again
      const { data: retryProfile } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      return retryProfile;
    }

    return newProfile;
  },
};