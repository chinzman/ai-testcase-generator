import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { env } from '../config/env.js';

export const healthRouter = Router();

// Liveness probe
healthRouter.get('/healthz', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'HEALTHY',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    memoryUsageMb: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
  });
});

// Readiness probe (verifies database connectivity)
healthRouter.get('/readyz', async (_req: Request, res: Response) => {
  try {
    // Run quick DB check
    await prisma.$queryRaw`SELECT 1`;

    const aiConfigured = Boolean(env.LLM_API_KEY || env.OPENAI_API_KEY);

    res.status(200).json({
      status: 'READY',
      timestamp: new Date().toISOString(),
      database: 'CONNECTED',
      aiEngine: aiConfigured ? 'CLOUD_LLM_ACTIVE' : 'SYNTHESIS_ENGINE_ACTIVE',
    });
  } catch (err: any) {
    res.status(503).json({
      status: 'NOT_READY',
      timestamp: new Date().toISOString(),
      database: 'DISCONNECTED',
      error: err.message,
    });
  }
});
