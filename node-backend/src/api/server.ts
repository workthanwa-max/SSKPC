import express from 'express';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import pinoHttp from 'pino-http';
import { logger } from '../infrastructure/logger/logger';
import { corsMiddleware } from '../shared/middlewares/cors.middleware';
import { apiLimiter } from '../shared/middlewares/rate-limit.middleware';
import { errorHandler } from '../shared/middlewares/error.middleware';
import healthRoutes from './health.routes';
import authRoutes from '../modules/auth/auth.routes';
import usersRoutes from '../modules/users/users.routes';
import { locationsRouter } from '../modules/locations/locations.routes';
import { stockRouter } from '../modules/stock/stock.routes';
import { evacueesRouter } from '../modules/evacuees/evacuees.routes';
import { analyticsRouter } from '../modules/analytics/analytics.routes';
import { dashboardRouter } from '../modules/dashboard/dashboard.routes';
import { publicRouter } from '../modules/public-api/public.routes';
import { monitoringRouter } from '../modules/monitoring/monitoring.routes';

const app = express();

// Security Middlewares (Perimeter Defense)
app.use(helmet()); // Secure HTTP headers
app.use(corsMiddleware); // Strict CORS policy
app.use(apiLimiter); // Rate limiting against brute force

// Utility Middlewares
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser()); // Parse Cookies
app.use(pinoHttp({ logger })); // HTTP Request logging with PII redaction

// Routes
app.use('/health', healthRoutes);
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', usersRoutes);
app.use('/api/v1/locations', locationsRouter);
app.use('/api/v1/stock', stockRouter);
app.use('/api/v1/evacuees', evacueesRouter);
app.use('/api/v1/analytics', analyticsRouter);
app.use('/api/v1/dashboard', dashboardRouter);
app.use('/api/v1/public', publicRouter);
app.use('/api/v1/admin/monitoring', monitoringRouter);

// Root Route for basic health check/welcome message
app.get('/', (req, res) => {
  res.status(200).json({
    name: 'SSK Protection Command API',
    version: '1.0.0',
    status: 'online',
    message: 'Welcome to the Aegis Command API',
  });
});

// Centralized Error Handling (Must be the last middleware)
app.use(errorHandler);

export default app;
