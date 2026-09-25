import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { env } from './config/env.js';
import { requestTraceMiddleware } from './middleware/requestTrace.js';
import { apiRateLimiter } from './middleware/rateLimiter.js';
import { errorHandler } from './middleware/errorHandler.js';
import { testSuiteRouter } from './routes/testSuiteRoutes.js';
import { healthRouter } from './routes/healthRoutes.js';

export function createApp() {
  const app = express();

  // Security Headers
  app.use(helmet());

  // CORS Configuration
  app.use(
    cors({
      origin: env.CORS_ORIGIN === '*' ? '*' : [env.CORS_ORIGIN, 'http://localhost:5173', 'http://127.0.0.1:5173'],
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID', 'x-api-key'],
      credentials: true,
    })
  );

  // Body Parsing with security size limits
  app.use(express.json({ limit: '2mb' }));
  app.use(express.urlencoded({ extended: true, limit: '2mb' }));

  // Observability & Request Tracing
  app.use(requestTraceMiddleware);

  // Rate Limiting on API endpoints
  app.use('/api', apiRateLimiter);

  // Routes
  app.use('/api', healthRouter);
  app.use('/api', testSuiteRouter);

  // 404 Catch-All
  app.use((_req, res) => {
    res.status(404).json({
      success: false,
      error: {
        code: 'NOT_FOUND',
        message: 'The requested resource does not exist',
      },
    });
  });

  // Centralized Error Handling
  app.use(errorHandler);

  return app;
}
