import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  try {
    console.log('🚀 Starting School Quiz Backend...');
    console.log('🔍 Environment:', process.env.NODE_ENV);
    console.log('🔍 PORT env var:', process.env.PORT);
    console.log('🔍 Default port:', 3001);
    
    const app = await NestFactory.create(AppModule);
    console.log('✅ App module created successfully');
  
  // Enable CORS for frontend communication
  const allowedOrigins = [
    'http://localhost:3020', // Local development
    'http://localhost:3000', // Alternative local port
    process.env.FRONTEND_URL, // Production frontend URL from env
  ].filter(Boolean); // Remove undefined values

  // Add common Vercel domains for production
  const vercelDomains = [
    'https://schoolquizapp.vercel.app',
    'https://schoolquizapp-git-main.vercel.app',
    'https://schoolquizapp-git-develop.vercel.app',
  ];

  const allAllowedOrigins = [...allowedOrigins, ...vercelDomains];

  app.enableCors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, Postman, etc.)
      if (!origin) return callback(null, true);
      
      // Check if origin is in allowed list
      if (allAllowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      
      // For production, also allow any Vercel domain
      if (process.env.NODE_ENV === 'production' && origin.includes('vercel.app')) {
        return callback(null, true);
      }
      
      // Allow any origin in development
      if (process.env.NODE_ENV !== 'production') {
        return callback(null, true);
      }
      
      // Log rejected origins in production for debugging
      console.log('🚫 CORS rejected origin:', origin);
      callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  });
  
  // Use Railway's PORT env var (8080) for the application
  const port = process.env.PORT || 3001;
  console.log('🔍 Using port:', port);
  console.log('🔍 Railway PORT env var:', process.env.PORT);
  await app.listen(port);
  console.log(`🚀 School Quiz Backend running on port ${port}`);
  console.log(`🔗 Health check available at: http://localhost:${port}/health`);
  } catch (error) {
    console.error('❌ Failed to start application:', error);
    process.exit(1);
  }
}

bootstrap().catch((error) => {
  console.error('❌ Bootstrap failed:', error);
  process.exit(1);
});
