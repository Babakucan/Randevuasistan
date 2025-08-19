import { Router } from 'express';
import { supabase } from '../config/database';
import { validateLogin, validateRegister } from '../middleware/validation';
import { authenticateUser } from '../middleware/auth';

const router = Router();

// Register new user and salon
router.post('/register', validateRegister, async (req, res) => {
  try {
    const { email, password, salon_name, owner_name, phone } = req.body;

    // Create user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) {
      return res.status(400).json({
        success: false,
        error: authError.message
      });
    }

    if (!authData.user) {
      return res.status(400).json({
        success: false,
        error: 'User creation failed'
      });
    }

    // Create salon profile
    const { data: salonData, error: salonError } = await supabase
      .from('salon_profiles')
      .insert({
        user_id: authData.user.id,
        name: salon_name,
        owner_name: owner_name,
        phone: phone || null
      })
      .select()
      .single();

    if (salonError) {
      // If salon creation fails, we should clean up the user
      await supabase.auth.admin.deleteUser(authData.user.id);
      return res.status(400).json({
        success: false,
        error: salonError.message
      });
    }

    res.status(201).json({
      success: true,
      message: 'User and salon created successfully',
      data: {
        user: {
          id: authData.user.id,
          email: authData.user.email
        },
        salon: salonData
      }
    });

  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      error: 'Registration failed'
    });
  }
});

// Login user
router.post('/login', validateLogin, async (req, res) => {
  try {
    const { email, password } = req.body;

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return res.status(401).json({
        success: false,
        error: error.message
      });
    }

    if (!data.user) {
      return res.status(401).json({
        success: false,
        error: 'Login failed'
      });
    }

    // Get salon profile
    const { data: salonProfile } = await supabase
      .from('salon_profiles')
      .select('*')
      .eq('user_id', data.user.id)
      .single();

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: data.user.id,
          email: data.user.email
        },
        session: data.session,
        salon: salonProfile
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: 'Login failed'
    });
  }
});

// Logout user
router.post('/logout', async (req, res) => {
  try {
    const { error } = await supabase.auth.signOut();

    if (error) {
      return res.status(400).json({
        success: false,
        error: error.message
      });
    }

    res.json({
      success: true,
      message: 'Logout successful'
    });

  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      error: 'Logout failed'
    });
  }
});

// Get current user
router.get('/me', authenticateUser, async (req, res) => {
  try {
    const { data: salonProfile } = await supabase
      .from('salon_profiles')
      .select('*')
      .eq('user_id', req.user!.id)
      .single();

    res.json({
      success: true,
      data: {
        user: req.user,
        salon: salonProfile
      }
    });

  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get user data'
    });
  }
});

// Refresh token
router.post('/refresh', async (req, res) => {
  try {
    const { refresh_token } = req.body;

    if (!refresh_token) {
      return res.status(400).json({
        success: false,
        error: 'Refresh token required'
      });
    }

    const { data, error } = await supabase.auth.refreshSession({
      refresh_token
    });

    if (error) {
      return res.status(401).json({
        success: false,
        error: error.message
      });
    }

    res.json({
      success: true,
      data: {
        session: data.session
      }
    });

  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(500).json({
      success: false,
      error: 'Token refresh failed'
    });
  }
});

export default router;
