import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as session from 'express-session';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS for frontend integration
  app.enableCors({
    origin: ['http://localhost:5173', 'http://localhost:4173'], // Vite dev server and preview ports
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    credentials: true,
  });

  app.use(
    session({
      secret: process.env.SESSION_SECRET || 'changeme',
      resave: false,
      saveUninitialized: true,
      cookie: { maxAge: 5 * 24 * 60 * 60 * 1000 }, // 5 jours
      // store: new RedisStore({ client: redisClient }), // en prod
    }),
  );

  // Enable global prefix for API endpoints (optional)
  app.setGlobalPrefix('api');

  await app.listen(process.env.PORT ?? 3001);
}

bootstrap();
