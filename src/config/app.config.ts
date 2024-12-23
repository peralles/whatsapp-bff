// src/config/app.config.ts
export const appConfig = () => ({
  jinaApi: {
    token: process.env.JINA_API_TOKEN
  },
  evolutionApi: {
    baseUrl: process.env.EVOLUTION_API_BASE_URL || 'http://localhost:8080',
    token: process.env.EVOLUTION_API_TOKEN
  }
});