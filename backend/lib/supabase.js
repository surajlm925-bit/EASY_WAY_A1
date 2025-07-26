const { createClient } = require('@supabase/supabase-js');
const path = require('path');

// Try to load environment variables from multiple sources
try {
  require('dotenv').config({ path: path.join(__dirname, '../.env') });
} catch (error) {
  console.log('dotenv not available, using process.env directly');
}

// Get environment variables with fallbacks
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

console.log('Environment check:');
console.log('SUPABASE_URL:', supabaseUrl ? 'Set' : 'Missing');
console.log('SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? 'Set (length: ' + (supabaseServiceKey?.length || 0) + ')' : 'Missing');

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  console.error('Please set these environment variables:');
  console.error('- SUPABASE_URL or VITE_SUPABASE_URL');
  console.error('- SUPABASE_SERVICE_ROLE_KEY or VITE_SUPABASE_SERVICE_ROLE_KEY');
  console.error('');
  console.error('You can set them in:');
  console.error('1. backend/.env file');
  console.error('2. Root .env file');
  console.error('3. Environment variables directly');
  
  // Don't throw error, create a mock client for development
  console.log('⚠️  Creating mock Supabase client for development');
  module.exports = {
    supabase: {
      from: () => ({
        select: () => Promise.resolve({ data: [], error: null }),
        insert: () => Promise.resolve({ data: null, error: null }),
        update: () => Promise.resolve({ data: null, error: null }),
        delete: () => Promise.resolve({ data: null, error: null }),
        single: () => Promise.resolve({ data: null, error: null })
      }),
      auth: {
        getUser: () => Promise.resolve({ data: { user: null }, error: null })
      }
    }
  };
  return;
}

// Create Supabase client with service role key for backend operations
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Test the connection
supabase.from('user_profiles').select('id', { count: 'exact', head: true })
  .then(({ error }) => {
    if (error) {
      console.error('❌ Supabase connection test failed:', error.message);
      console.error('Make sure user_profiles table exists and RLS policies are set up');
    } else {
      console.log('✅ Supabase backend connection successful');
    }
  })
  .catch((err) => {
    console.error('❌ Supabase connection error:', err.message);
  });

module.exports = { supabase };