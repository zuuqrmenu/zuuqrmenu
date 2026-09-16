import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'zuulab-dev-secret-key-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

if (!JWT_SECRET || JWT_SECRET === 'zuulab-dev-secret-key-change-in-production') {
  console.warn('⚠️  Using default JWT_SECRET. Please set JWT_SECRET in production!');
}

export const generateToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });
};

export const verifyToken = (token) => {
  return jwt.verify(token, JWT_SECRET);
};


