import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { ApiErrorResponse } from '../types/index.js';

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  const requestId = req.id || 'unknown';
  const timestamp = new Date().toISOString();

  // Handle Zod Validation Errors
  if (err instanceof ZodError) {
    const response: ApiErrorResponse = {
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid request payload or schema mismatch',
        details: err.errors.map((e) => ({
          path: e.path.join('.'),
          message: e.message,
        })),
      },
      meta: { requestId, timestamp },
    };
    res.status(400).json(response);
    return;
  }

  // Handle Syntax / JSON Parsing Errors
  if (err instanceof SyntaxError && 'body' in err) {
    const response: ApiErrorResponse = {
      success: false,
      error: {
        code: 'BAD_REQUEST',
        message: 'Malformed JSON payload in request body',
      },
      meta: { requestId, timestamp },
    };
    res.status(400).json(response);
    return;
  }

  // Handle generic / unexpected server errors
  console.error(`[Unhandled Error] [req:${requestId}]:`, err);
  const response: ApiErrorResponse = {
    success: false,
    error: {
      code: err.code || 'INTERNAL_SERVER_ERROR',
      message: err.message || 'An unexpected error occurred',
      details: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    },
    meta: { requestId, timestamp },
  };

  res.status(err.statusCode || 500).json(response);
}
