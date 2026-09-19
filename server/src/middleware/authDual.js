import { verifyToken } from '../config/jwt.js';
import { firebaseAdminAuth, firebaseAdminConfigError } from '../config/firebaseAdmin.js';
import User from '../models/User.js';

const unauthorizedMessage = 'Kimlik doğrulaması gerekli.';
const conflictMessage = 'Kimlik doğrulama bilgileri birbiriyle eşleşmiyor.';
const unlinkedMessage = 'Bu Firebase hesabı ZuuLab QR hesabıyla eşleştirilmemiş.';

const getBearerToken = (req) => {
  const authorization = req.get('authorization') || '';
  const match = authorization.match(/^Bearer\s+(.+)$/i);
  return match?.[1] || null;
};

const loadUserContext = (user) => ({
  userId: user._id,
  email: user.email,
  role: user.role,
  restaurantId: user.restaurantId,
});

const loadJwtIdentity = async (req, bearerToken) => {
  const token = req.cookies?.token || bearerToken;
  if (!token) return null;

  try {
    const decoded = verifyToken(token);
    const user = await User.findById(decoded.userId).select('-password');
    if (!user || !user.isActive) return null;
    return { user, context: loadUserContext(user) };
  } catch {
    return null;
  }
};

const loadFirebaseIdentity = async (bearerToken) => {
  if (!bearerToken) return null;
  if (firebaseAdminConfigError || !firebaseAdminAuth) {
    const error = new Error('Firebase Admin authentication is not configured.');
    error.statusCode = 503;
    throw error;
  }

  let decodedToken;
  try {
    decodedToken = await firebaseAdminAuth.verifyIdToken(bearerToken);
  } catch {
    const error = new Error('Invalid Firebase session.');
    error.statusCode = 401;
    throw error;
  }

  const user = await User.findOne({ firebaseUid: decodedToken.uid }).select('-password');
  if (!user) {
    const error = new Error(unlinkedMessage);
    error.statusCode = 401;
    throw error;
  }
  if (user.role !== 'RESTAURANT_USER' || !user.isActive) {
    const error = new Error(unauthorizedMessage);
    error.statusCode = 401;
    throw error;
  }

  const restaurant = await User.populate(user, { path: 'restaurantId', select: 'status' });
  if (restaurant.restaurantId?.status !== 'ACTIVE') {
    const error = new Error(unauthorizedMessage);
    error.statusCode = 403;
    throw error;
  }

  return { user, context: loadUserContext(user) };
};

export const authDual = async (req, res, next) => {
  const bearerToken = getBearerToken(req);

  // 1. First attempt JWT verification (from cookie or Bearer header)
  const jwtIdentity = await loadJwtIdentity(req, bearerToken);
  if (jwtIdentity) {
    req.user = jwtIdentity.context;
    req.authMethod = 'jwt';
    return next();
  }

  // 2. If no valid JWT, attempt Firebase verification using the bearer token
  if (!bearerToken) {
    return res.status(401).json({ error: unauthorizedMessage });
  }

  try {
    const firebaseIdentity = await loadFirebaseIdentity(bearerToken);
    if (!firebaseIdentity) return res.status(401).json({ error: unauthorizedMessage });

    req.user = firebaseIdentity.context;
    req.authMethod = 'firebase';
    return next();
  } catch (error) {
    const statusCode = error.statusCode || 401;
    return res.status(statusCode).json({ error: statusCode === 503 ? 'Firebase authentication is not configured.' : error.message === unlinkedMessage ? unlinkedMessage : unauthorizedMessage });
  }
};
