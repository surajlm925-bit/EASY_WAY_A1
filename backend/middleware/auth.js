let supabase;
try {
  const supabaseLib = require('../lib/supabase');
  supabase = supabaseLib.supabase;
} catch (error) {
  console.error('Failed to load Supabase client:', error.message);
  // Create mock supabase for development
  supabase = {
    auth: {
      getUser: () => Promise.resolve({ data: { user: null }, error: { message: 'Supabase not configured' } })
    },
    from: () => ({
      select: () => ({ single: () => Promise.resolve({ data: null, error: { message: 'Supabase not configured' } }) }),
      upsert: () => ({ select: () => ({ single: () => Promise.resolve({ data: null, error: { message: 'Supabase not configured' } }) }) })
    })
  };
}

/**
 * Middleware to verify JWT token and extract user information
 */
const authenticateUser = async (req, res, next) => {
  try {
    if (!supabase || !supabase.auth) {
      return res.status(500).json({
        success: false,
        error: 'Authentication service not available - Supabase not configured'
      });
    }

    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Missing or invalid authorization header'
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify the JWT token
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid or expired token'
      });
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError) {
      console.error('Profile fetch error:', profileError);
      // Try to create profile if it doesn't exist
      const { data: newProfile, error: createError } = await supabase
        .from('user_profiles')
        .upsert([{
          id: user.id,
          email: user.email,
          full_name: user.user_metadata?.full_name || '',
          role: 'user'
        }], { onConflict: 'id' })
        .select()
        .single();
      
      if (createError) {
        return res.status(500).json({
          success: false,
          error: 'Failed to create user profile'
        });
      }
      req.profile = newProfile;
    } else {
      req.profile = profile;
    }

    req.user = user;

    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(500).json({
      success: false,
      error: 'Authentication failed'
    });
  }
};

/**
 * Middleware to check if user has admin role
 */
const requireAdmin = (req, res, next) => {
  if (!req.profile || req.profile.role !== 'admin') {
    return res.status(403).json({
      success: false,
      error: 'Admin privileges required'
    });
  }
  next();
};

/**
 * Optional authentication - doesn't fail if no token provided
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(); // Continue without authentication
    }

    const token = authHeader.substring(7);
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (!error && user) {
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      req.user = user;
      req.profile = profile;
    }

    next();
  } catch (error) {
    // Continue without authentication on error
    next();
  }
};

module.exports = {
  authenticateUser,
  requireAdmin,
  optionalAuth
};