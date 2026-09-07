import { app } from './app';
import { env } from './config/env';
import { connectDB } from './config/database';

async function bootstrap() {
  await connectDB();

  app.listen(env.PORT, () => {
    console.log(`
🚀 ========================================================
   COURSE & STUDENT MANAGEMENT SYSTEM (CMS) - BACKEND
   Cổng đào tạo & Quản trị trung tâm
========================================================
   🌐 API Server:       http://localhost:${env.PORT}/api/v1
   🩺 Health Check:    http://localhost:${env.PORT}/api/v1/health
   🔒 Environment:     ${env.NODE_ENV}
========================================================
    `);
  });
}

bootstrap().catch((error) => {
  console.error('Fatal bootstrap error:', error);
  process.exit(1);
});
