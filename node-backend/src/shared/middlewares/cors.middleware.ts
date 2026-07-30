import cors from 'cors';

const getOrigins = () => {
  const origins = ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175'];
  if (process.env.CORS_ORIGIN) {
    const envOrigins = process.env.CORS_ORIGIN.split(',').map(o => o.trim());
    origins.push(...envOrigins);
  }
  return origins;
};

export const corsMiddleware = cors({
  origin: (origin, callback) => {
    // allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    const allowed = getOrigins();
    if (allowed.includes(origin)) {
      return callback(null, true);
    }
    
    // Optional: Log when CORS blocks a request to help with debugging
    console.warn(`CORS blocked request from origin: ${origin}`);
    const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
    return callback(new Error(msg), false);
  },
  credentials: true, // Allow cookies
});
