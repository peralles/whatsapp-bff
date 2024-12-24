import { Module } from '@nestjs/common';
import { WebhookController } from './controllers/webhook.controller';
import { WebhookService } from './services/webhook.service';
import { WebhookRepository } from './repositories/webhook.repository';
import { PrismaService } from '../../shared/prisma.service';

@Module({
  controllers: [WebhookController],
  providers: [WebhookService, WebhookRepository, PrismaService]
})
export class WhatsappModule {}