import { Controller, Post, Body } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { WebhookService } from '../services/webhook.service';
import { WebhookResponseDto } from '../dtos/webhook-response.dto';

@ApiTags('WhatsApp')
@Controller('whatsapp/webhook')
export class WebhookController {
  constructor(private readonly webhookService: WebhookService) {}

  @Post()
  @ApiOperation({ summary: 'Receive webhook from Evolution API' })
  @ApiResponse({
    status: 201,
    description: 'Webhook received and processed successfully',
    type: WebhookResponseDto
  })
  async handleWebhook(@Body() payload: any) {
    return this.webhookService.processWebhook(payload);
  }
}