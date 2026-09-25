import { verifyToken } from '../config/jwt.js';
import User from '../models/User.js';
import Restaurant from '../models/Restaurant.js';

export const auth = async (req, res, next) => {
  try {
    // Authorization Bearer header takes precedence over cookie
    let token;
    const authHeader = req.get('authorization') || '';
    const match = authHeader.match(/^Bearer\s+(.+)$/i);
    if (match) {
      token = match[1];
    } else {
      token = req.cookies?.token;
    }

    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    // Verify token
    const decoded = verifyToken(token);
    
    // Get user from database
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    if (!user.isActive) {
      return res.status(401).json({ error: 'User account is inactive' });
    }

    // Attach user to request
    req.user = {
      userId: user._id,
      email: user.email,
      role: user.role,
      restaurantId: user.restaurantId,
    };

    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

export const adminAuth = async (req, res, next) => {
  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

export const restaurantAuth = async (req, res, next) => {
  try {
    if (req.user.role === 'ADMIN') {
      return next();
    }

    if (req.user.role !== 'RESTAURANT_USER') {
      return res.status(403).json({ error: 'Restaurant access required' });
    }

    const restaurant = await Restaurant.findById(req.user.restaurantId).select('status menuStatus publishedAt lastMenuAnalysisAt').lean();
    if (!restaurant) {
      return res.status(403).json({ error: 'Restaurant not found' });
    }

    if (restaurant.status !== 'ACTIVE') {
      return res.status(403).json({
        error: `Restaurant access is unavailable while status is ${restaurant.status}`,
      });
    }

    req.restaurant = restaurant;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Restaurant access could not be verified' });
  }
};
