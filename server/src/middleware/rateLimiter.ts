import rateLimit from 'express-rate-limit';
import { env } from '../config/env.js';

export const apiRateLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS || 900000,
  max: Math.max(env.RATE_LIMIT_MAX || 100, 500),
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Never rate limit container or cloud platform health checks
    const url = req.originalUrl || req.url;
    return url.includes('/healthz') || url.includes('/readyz');
  },
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many requests from this IP. Please try again later.',
    },
  },
});
