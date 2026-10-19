import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { env } from './config/env';
import { errorHandler, NotFoundError } from './common/errors';
import { healthRouter } from './modules/health';

const app: Application = express();

// Security & Utility Middlewares
app.use(helmet());
app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Application Routes
app.use('/health', healthRouter);

// 404 Handler for undefined routes
app.use((req: Request, _res: Response, next: NextFunction) => {
  next(new NotFoundError(`Route ${req.method} ${req.originalUrl} not found`));
});

// Centralized Global Error Handler
app.use(errorHandler);

export { app };
