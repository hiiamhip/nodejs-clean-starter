import { Request, Response, NextFunction, RequestHandler } from 'express';
import { ZodTypeAny } from 'zod';

export interface RequestValidationSchema {
  body?: ZodTypeAny;
  query?: ZodTypeAny;
  params?: ZodTypeAny;
}

/**
 * Enterprise Request Validation Middleware powered by Zod.
 * Validates and transforms req.body, req.query, and req.params against schemas.
 * In case of failure, forwards a ZodError to the global errorHandler.
 */
export const validate = (schema: RequestValidationSchema): RequestHandler => {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      if (schema.body) {
        req.body = await schema.body.parseAsync(req.body);
      }
      if (schema.query) {
        req.query = (await schema.query.parseAsync(req.query)) as typeof req.query;
      }
      if (schema.params) {
        req.params = (await schema.params.parseAsync(req.params)) as typeof req.params;
      }
      next();
    } catch (error) {
      next(error);
    }
  };
};
