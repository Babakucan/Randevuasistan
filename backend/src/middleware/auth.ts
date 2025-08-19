import { Request, Response, NextFunction } from 'express';
import { supabase } from '../config/database';
import { AuthUser } from '../types';

// Extend Express Request interface
declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export const authenticateUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Access token required'
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify token with Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid or expired token'
      });
    }

    // Get salon profile for the user
    const { data: salonProfile } = await supabase
      .from('salon_profiles')
      .select('id')
      .eq('user_id', user.id)
      .single();

    // Add user info to request
    req.user = {
      id: user.id,
      email: user.email!,
      salon_id: salonProfile?.id
    };

    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(500).json({
      success: false,
      error: 'Authentication failed'
    });
  }
};

export const requireSalonProfile = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.user?.salon_id) {
    return res.status(403).json({
      success: false,
      error: 'Salon profile required'
    });
  }
  next();
};

export const optionalAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(); // Continue without authentication
    }

    const token = authHeader.substring(7);

    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (!error && user) {
      const { data: salonProfile } = await supabase
        .from('salon_profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      req.user = {
        id: user.id,
        email: user.email!,
        salon_id: salonProfile?.id
      };
    }

    next();
  } catch (error) {
    console.error('Optional auth middleware error:', error);
    next(); // Continue even if auth fails
  }
};
