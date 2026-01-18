import cors from 'cors';

const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:3000',
  'http://localhost:3001',
].filter(Boolean) as string[];

export const corsMiddleware = cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (direct browser requests, mobile apps, etc.)
    if (!origin) {
      callback(null, true);
      return;
    }

    // Check if origin is allowed
    if (allowedOrigins.some(allowed => origin === allowed || origin.includes('.vercel.app'))) {
      callback(null, true);
    } else {
      console.warn(`CORS blocked: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
});
