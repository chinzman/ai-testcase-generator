import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import fs from 'fs';
import { env } from './config/env.js';
import { requestTraceMiddleware } from './middleware/requestTrace.js';
import { apiRateLimiter } from './middleware/rateLimiter.js';
import { errorHandler } from './middleware/errorHandler.js';
import { testSuiteRouter } from './routes/testSuiteRoutes.js';
import { healthRouter } from './routes/healthRoutes.js';

export function createApp() {
  const app = express();

  // Trust reverse proxy (Render, AWS ALB, Cloudflare) for accurate client IPs
  app.set('trust proxy', 1);

  // Security Headers (allow Vite frontend assets and Google fonts)
  app.use(
    helmet({
      contentSecurityPolicy: false,
    })
  );

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

  // 1. Unrestricted Health Check & Readiness Endpoints (Bypasses rate limiting)
  app.use('/api', healthRouter);

  // 2. Protected Business API Routes (Enforces rate limiting)
  app.use('/api', apiRateLimiter, testSuiteRouter);

  // 3. Serve Frontend Static SPA Assets if built
  const possiblePaths = [
    path.resolve(process.cwd(), '../client/dist'),
    path.resolve(process.cwd(), 'client/dist'),
    path.resolve(process.cwd(), '../dist/client'),
  ];
  const clientDistPath = possiblePaths.find((p) => fs.existsSync(p));

  if (clientDistPath) {
    app.use(express.static(clientDistPath));
    app.get('*', (req, res, next) => {
      if (req.path.startsWith('/api')) {
        return next();
      }
      res.sendFile(path.join(clientDistPath, 'index.html'));
    });
  }

  // 404 Catch-All for unmatched /api routes
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
