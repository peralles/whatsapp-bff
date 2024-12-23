import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { INestApplication } from '@nestjs/common';

export const setupSwagger = (app: INestApplication) => {
  const config = new DocumentBuilder()
    .setTitle('WhatsApp BFF API')
    .setDescription('Backend For Frontend para integração com Evolution API')
    .setVersion('1.0')
    .addTag('evolution', 'Endpoints para gerenciamento de instâncias do WhatsApp')
    .addTag('documentation', 'Endpoints para documentação')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
};