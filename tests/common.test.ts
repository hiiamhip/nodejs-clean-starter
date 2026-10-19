import request from 'supertest';
import express, { Request, Response } from 'express';
import { z } from 'zod';
import { validate } from '../src/common/middlewares';
import { errorHandler, ConflictError } from '../src/common/errors';
import { ApiResponse, asyncHandler } from '../src/common/utils';

describe('Common Core Pillars', () => {
  const testApp = express();
  testApp.use(express.json());

  // Route with Zod validation
  const sampleSchema = {
    body: z.object({
      email: z.string().email(),
      age: z.number().min(18),
    }),
  };

  testApp.post(
    '/test-validation',
    validate(sampleSchema),
    (req: Request, res: Response) => {
      ApiResponse.created(res, req.body, 'Validated successfully');
    }
  );

  // Route throwing operational AppError
  testApp.get(
    '/test-conflict',
    asyncHandler(async () => {
      throw new ConflictError('Email already registered');
    })
  );

  testApp.use(errorHandler);

  it('should pass validation when payload is valid and return 201', async () => {
    const response = await request(testApp)
      .post('/test-validation')
      .send({ email: 'developer@example.com', age: 24 });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toEqual({
      email: 'developer@example.com',
      age: 24,
    });
  });

  it('should return 400 with formatted field errors when validation fails', async () => {
    const response = await request(testApp)
      .post('/test-validation')
      .send({ email: 'invalid-email', age: 16 });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe('Validation failed');
    expect(Array.isArray(response.body.errors)).toBe(true);
    expect(response.body.errors.length).toBeGreaterThanOrEqual(2);
  });

  it('should catch AppError and format response cleanly', async () => {
    const response = await request(testApp).get('/test-conflict');

    expect(response.status).toBe(409);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe('Email already registered');
  });
});
