import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { AppError } from './app-error';
import { env } from '../../config/env';

export interface FormattedErrorResponse {
  success: false;
  message: string;
  errors?: unknown;
  stack?: string;
}

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  // 1. Zod Validation Error
  if (err instanceof ZodError) {
    const formattedErrors = err.issues.map((issue) => ({
      field: issue.path.join('.'),
      message: issue.message,
    }));

    res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: formattedErrors,
    });
    return;
  }

  // 2. Operational AppError
  if (err instanceof AppError) {
    const response: FormattedErrorResponse = {
      success: false,
      message: err.message,
      ...(err.details ? { errors: err.details } : {}),
      ...(!env.isProduction && err.stack ? { stack: err.stack } : {}),
    };

    res.status(err.statusCode).json(response);
    return;
  }

  // 3. Unhandled System / Programming Errors
  if (!env.isTest) {
    console.error('💥 Unhandled Error:', err);
  }

  const response: FormattedErrorResponse = {
    success: false,
    message: env.isProduction ? 'Internal server error' : err.message || 'Internal server error',
    ...(!env.isProduction && err.stack ? { stack: err.stack } : {}),
  };

  res.status(500).json(response);
};
