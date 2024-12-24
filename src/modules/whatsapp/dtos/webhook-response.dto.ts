import { ApiProperty } from '@nestjs/swagger';

export class WebhookResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  phoneNumber: string;

  @ApiProperty()
  instanceName: string;

  @ApiProperty()
  messageType: string;

  @ApiProperty()
  receivedAt: Date;

  @ApiProperty({ 
    description: 'The raw webhook payload',
    example: {
      key: { remoteJid: '5511999999999@s.whatsapp.net' },
      message: { conversation: 'Hello' }
    }
  })
  payload: any;
}