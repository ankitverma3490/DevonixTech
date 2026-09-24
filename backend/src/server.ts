import { createApp } from './app.js';
import { connectDB } from './config/db.js';
import { ENV } from './config/env.js';
import { seedDatabase } from './services/seedService.js';
import { MigrationService } from './services/migrationService.js';

const startServer = async () => {
  try {
    console.log('🚀 Starting Agency Project & Payroll Management System Server...');
    await connectDB();

    // Run multi-currency schema migrations safely on existing datasets
    await MigrationService.runMigrations();

    // Auto-seed initial demo dataset if database is newly initialized
    await seedDatabase();

    const app = createApp();

    const server = app.listen(ENV.PORT, '0.0.0.0', () => {
      console.log(`====================================================`);
      console.log(`🚀 Backend Server running at: http://0.0.0.0:${ENV.PORT}`);
      console.log(`📡 Health Check endpoint:    http://0.0.0.0:${ENV.PORT}/api/health`);
      console.log(`====================================================`);
    });

    // Graceful shutdown handling
    const shutdown = async () => {
      console.log('🛑 Gracefully shutting down server...');
      server.close(() => {
        console.log('Server closed.');
        process.exit(0);
      });
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);
  } catch (error) {
    console.error('❌ Error during server initialization:', error);
    process.exit(1);
  }
};

startServer();
