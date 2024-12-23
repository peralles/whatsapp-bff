// src/config/app.config.ts
import { registerAs } from '@nestjs/config';

export const appConfig = registerAs('app', () => ({
  port: parseInt(process.env.PORT, 10) || 3000,
  environment: process.env.NODE_ENV || 'development',
  evolution: {
    baseUrl: process.env.EVOLUTION_API_BASE_URL || 'http://localhost:8080',
    apiKey: process.env.EVOLUTION_API_KEY || 'development-key',
  },
}));

export type AppConfig = ReturnType<typeof appConfig>;