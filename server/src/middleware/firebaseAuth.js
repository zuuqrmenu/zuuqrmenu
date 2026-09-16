import { firebaseAdminAuth, firebaseAdminConfigError } from '../config/firebaseAdmin.js';

const unauthorizedMessage = 'Geçersiz veya süresi dolmuş Firebase oturumu.';

export const firebaseAuth = async (req, res, next) => {
  const authorization = req.get('authorization') || '';
  const match = authorization.match(/^Bearer\s+(.+)$/i);
  if (!match) {
    return res.status(401).json({ error: unauthorizedMessage });
  }

  if (firebaseAdminConfigError || !firebaseAdminAuth) {
    return res.status(503).json({ error: 'Firebase Admin authentication is not configured.' });
  }

  try {
    req.firebaseUser = await firebaseAdminAuth.verifyIdToken(match[1]);
    return next();
  } catch {
    return res.status(401).json({ error: unauthorizedMessage });
  }
};
