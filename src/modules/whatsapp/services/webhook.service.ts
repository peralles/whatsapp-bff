import { Injectable } from '@nestjs/common';
import { WebhookRepository } from '../repositories/webhook.repository';

@Injectable()
export class WebhookService {
  constructor(private readonly webhookRepository: WebhookRepository) {}

  async processWebhook(payload: any) {
    const phoneNumber = payload.key?.remoteJid || payload.from || 'unknown';
    const instanceName = payload.instance || 'default';
    const messageType = payload.messageType || payload.type || 'unknown';

    return this.webhookRepository.create({
      phoneNumber,
      payload,
      instanceName,
      messageType
    });
  }
}