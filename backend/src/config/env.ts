import dotenv from 'dotenv';
dotenv.config();

const cleanString = (val?: string): string => {
  if (!val) return '';
  return val.trim().replace(/^["']|["']$/g, '');
};

export const ENV = {
  PORT: parseInt(process.env.PORT || '5001', 10),
  NODE_ENV: cleanString(process.env.NODE_ENV) || 'development',
  MONGODB_URI: cleanString(process.env.MONGODB_URI),
  JWT_SECRET: cleanString(process.env.JWT_SECRET) || 'agency_payroll_jwt_super_secret_key_2026',
  JWT_EXPIRES_IN: cleanString(process.env.JWT_EXPIRES_IN) || '7d',
  CLIENT_ORIGIN: cleanString(process.env.CLIENT_ORIGIN) || 'http://localhost:5173',
};
