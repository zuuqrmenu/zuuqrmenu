import { firebaseAdminAuth, firebaseAdminConfigError } from '../config/firebaseAdmin.js';

const unauthorizedMessage = 'Geçersiz veya süresi dolmuş oturum.';

export const firebaseAuth = async (req, res, next) => {
  const authorization = req.get('authorization') || '';
  const match = authorization.match(/^Bearer\s+(.+)$/i);
  if (!match) {
    return res.status(401).json({ error: unauthorizedMessage });
  }

  if (firebaseAdminConfigError || !firebaseAdminAuth) {
    console.error('Firebase Admin configuration error:', firebaseAdminConfigError);
    return res.status(503).json({ error: 'Kimlik doğrulama servisi şu anda kullanılamıyor.' });
  }

  try {
    req.firebaseUser = await firebaseAdminAuth.verifyIdToken(match[1]);
    return next();
  } catch (err) {
    console.error('Token verification error:', err?.message || err);
    return res.status(401).json({ error: unauthorizedMessage });
  }
};
