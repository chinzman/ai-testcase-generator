import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';

declare global {
  namespace Express {
    interface Request {
      id?: string;
      startTime?: number;
    }
  }
}

export function requestTraceMiddleware(req: Request, res: Response, next: NextFunction) {
  const requestId = (req.headers['x-request-id'] as string) || uuidv4();
  req.id = requestId;
  req.startTime = Date.now();
  res.setHeader('X-Request-ID', requestId);

  res.on('finish', () => {
    const duration = req.startTime ? Date.now() - req.startTime : 0;
    const logMessage = `[${new Date().toISOString()}] [req:${requestId}] ${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms`;
    if (res.statusCode >= 500) {
      console.error(`🔴 ${logMessage}`);
    } else if (res.statusCode >= 400) {
      console.warn(`🟡 ${logMessage}`);
    } else {
      console.log(`🟢 ${logMessage}`);
    }
  });

  next();
}
