import { Server } from 'http';
import { app } from './app';
import { env } from './config/env';

const PORT = env.PORT;

const server: Server = app.listen(PORT, () => {
  console.log(`🚀 Server is running in [${env.NODE_ENV}] mode on http://localhost:${PORT}`);
  console.log(`📡 Health check available at: http://localhost:${PORT}/health`);
});

/**
 * Graceful Shutdown Handler
 * Ensures existing requests finish processing before the process terminates.
 */
const gracefulShutdown = (signal: string): void => {
  console.log(`\n🛑 Received ${signal}. Starting graceful shutdown...`);

  server.close((err) => {
    if (err) {
      console.error('❌ Error during server closing:', err);
      process.exit(1);
    }

    console.log('✅ HTTP server closed gracefully.');
    // Any future infrastructure cleanups (e.g., db.disconnect(), redis.quit()) can be awaited here.
    process.exit(0);
  });

  // Force shutdown after timeout if connections do not close in time
  setTimeout(() => {
    console.error('⚠️ Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 10000).unref();
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

process.on('unhandledRejection', (reason: unknown) => {
  console.error('💥 Unhandled Rejection detected:', reason);
  gracefulShutdown('unhandledRejection');
});

process.on('uncaughtException', (error: Error) => {
  console.error('💥 Uncaught Exception detected:', error);
  process.exit(1);
});
