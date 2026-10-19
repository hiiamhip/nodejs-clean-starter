import { Request, Response, NextFunction, RequestHandler } from 'express';

export type AsyncRouteHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<unknown> | unknown;

/**
 * Higher-order function that catches async errors in Express route handlers
 * and forwards them to next(err) for the global error middleware to process.
 */
export const asyncHandler = (fn: AsyncRouteHandler): RequestHandler => {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
