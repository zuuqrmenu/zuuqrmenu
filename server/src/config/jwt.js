import 'dotenv/config';
import jwt from 'jsonwebtoken';

const configuredSecret = process.env.JWT_SECRET?.trim();
const isProduction = process.env.NODE_ENV === 'production';
const developmentSecret = 'zuulab-dev-secret-key-change-in-production';
const isUnsafeSecret = !configuredSecret || configuredSecret === developmentSecret || configuredSecret.length < 32;

if (isProduction && isUnsafeSecret) {
  throw new Error('JWT_SECRET must be explicitly configured with a strong value in production.');
}

const JWT_SECRET = configuredSecret || developmentSecret;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

if (!isProduction && isUnsafeSecret) {
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


