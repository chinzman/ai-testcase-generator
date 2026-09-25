import { createApp } from './app.js';
import { env } from './config/env.js';
import { prisma } from './lib/prisma.js';

const app = createApp();

const server = app.listen(env.PORT, () => {
  console.log(`====================================================`);
  console.log(`🚀 Enterprise Test Case Generator API Server Active`);
  console.log(`📡 URL: http://localhost:${env.PORT}`);
  console.log(`⚙️  Environment: ${env.NODE_ENV}`);
  console.log(`🔒 Rate Limit: ${env.RATE_LIMIT_MAX} reqs / 15 min`);
  console.log(`🤖 AI Engine: ${env.OPENAI_API_KEY || env.LLM_API_KEY ? 'Cloud LLM Integration' : 'QA Synthesis Engine (Ready for BYOK)'}`);
  console.log(`====================================================`);
});

// Graceful Shutdown Handler
async function gracefulShutdown(signal: string) {
  console.log(`\n🛑 Received ${signal}. Draining connections and shutting down cleanly...`);
  server.close(async () => {
    console.log('🔌 HTTP server closed.');
    try {
      await prisma.$disconnect();
      console.log('💾 Database connection closed.');
      process.exit(0);
    } catch (err) {
      console.error('Error during shutdown:', err);
      process.exit(1);
    }
  });

  // Force shutdown after 10s if dangling connections remain
  setTimeout(() => {
    console.error('⚠️ Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 10000);
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
