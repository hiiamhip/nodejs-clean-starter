import dotenv from 'dotenv';

dotenv.config({ quiet: true });

export const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: Number(process.env.PORT) || 3000,
  CORS_ORIGIN: process.env.CORS_ORIGIN || '*',
  isProduction: process.env.NODE_ENV === 'production',
  isTest: process.env.NODE_ENV === 'test',
  isDevelopment: process.env.NODE_ENV === 'development' || !process.env.NODE_ENV,
} as const;
