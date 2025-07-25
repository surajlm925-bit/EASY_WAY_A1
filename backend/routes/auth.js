const express = require('express');
const { supabase } = require('../lib/supabase');
const { authenticateUser, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Get all users (admin only)
router.get('/users', authenticateUser, requireAdmin, async (req, res) => {
  try {
    const { data: users, error } = await supabase
      .from('user_profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    res.status(200).json({
      success: true,
      data: users
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch users'
    });
  }
});

// Update user role (admin only)
router.put('/users/:id/role', authenticateUser, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!role || !['admin', 'user'].includes(role)) {
      return res.status(400).json({
        success: false,
        error: 'Valid role (admin or user) is required'
      });
    }

    const { data, error } = await supabase
      .from('user_profiles')
      .update({ role })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    res.status(200).json({
      success: true,
      data
    });
  } catch (error) {
    console.error('Error updating user role:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update user role'
    });
  }
});

// Get user's module usage
router.get('/usage', authenticateUser, async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const userId = req.user.id;

    const { data: usage, error } = await supabase
      .from('module_usage')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(parseInt(limit));

    if (error) {
      throw error;
    }

    res.status(200).json({
      success: true,
      data: usage
    });
  } catch (error) {
    console.error('Error fetching user usage:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch usage data'
    });
  }
});

// Get all module usage (admin only)
router.get('/usage/all', authenticateUser, requireAdmin, async (req, res) => {
  try {
    const { limit = 100 } = req.query;

    const { data: usage, error } = await supabase
      .from('module_usage')
      .select(`
        *,
        user_profiles (
          email,
          full_name
        )
      `)
      .order('created_at', { ascending: false })
      .limit(parseInt(limit));

    if (error) {
      throw error;
    }

    res.status(200).json({
      success: true,
      data: usage
    });
  } catch (error) {
    console.error('Error fetching all usage:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch usage data'
    });
  }
});

// Track module usage
router.post('/usage', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;
    const { module_name, input_data, output_data, processing_time, status = 'completed' } = req.body;

    if (!module_name) {
      return res.status(400).json({
        success: false,
        error: 'Module name is required'
      });
    }

    const { data, error } = await supabase
      .from('module_usage')
      .insert([{
        user_id: userId,
        module_name,
        input_data,
        output_data,
        processing_time,
        status
      }])
      .select()
      .single();

    if (error) {
      throw error;
    }

    res.status(201).json({
      success: true,
      data
    });
  } catch (error) {
    console.error('Error tracking usage:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to track usage'
    });
  }
});

module.exports = router;