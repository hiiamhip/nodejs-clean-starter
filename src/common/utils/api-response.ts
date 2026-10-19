import { Response } from 'express';

export interface ApiResponsePayload<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  meta?: Record<string, unknown>;
}

export class ApiResponse {
  /**
   * Send standard HTTP 200 OK or custom success response
   */
  static success<T>(
    res: Response,
    data?: T,
    message: string = 'Success',
    statusCode: number = 200,
    meta?: Record<string, unknown>
  ): Response {
    const payload: ApiResponsePayload<T> = {
      success: true,
      message,
      ...(data !== undefined ? { data } : {}),
      ...(meta !== undefined ? { meta } : {}),
    };
    return res.status(statusCode).json(payload);
  }

  /**
   * Send standard HTTP 201 Created response
   */
  static created<T>(
    res: Response,
    data?: T,
    message: string = 'Resource created successfully',
    meta?: Record<string, unknown>
  ): Response {
    return ApiResponse.success(res, data, message, 201, meta);
  }

  /**
   * Send HTTP 204 No Content response
   */
  static noContent(res: Response): Response {
    return res.status(204).send();
  }
}
