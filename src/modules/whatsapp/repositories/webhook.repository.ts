import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../shared/prisma.service';

@Injectable()
export class WebhookRepository {
  constructor(private prisma: PrismaService) {}

  async create(data: {
    phoneNumber: string;
    payload: any;
    instanceName: string;
    messageType: string;
  }) {
    return this.prisma.webhookMessage.create({
      data
    });
  }
}