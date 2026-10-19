import { Request, Response } from 'express';
import { ApiResponse } from '../../common/utils';

export class HealthController {
  static getHealth(_req: Request, res: Response): Response {
    const healthData = {
      status: 'UP',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };

    return ApiResponse.success(res, healthData, 'Service is healthy');
  }
}
