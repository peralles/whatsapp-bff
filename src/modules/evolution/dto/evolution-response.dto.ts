import { ApiProperty } from '@nestjs/swagger';

export class EvolutionInstanceDto {
  @ApiProperty({
    description: 'Nome da instância criada',
    example: 'whatsapp-instance-1'
  })
  instanceName: string;

  @ApiProperty({
    description: 'ID único da instância',
    example: 'abc123xyz'
  })
  instanceId: string;

  @ApiProperty({
    description: 'Status atual da instância',
    example: 'CONNECTED'
  })
  status: string;

  @ApiProperty({
    description: 'QR Code para conexão (quando disponível)',
    required: false
  })
  qrcode?: string;

  @ApiProperty({
    description: 'Informações de autenticação',
    required: false
  })
  hash?: {
    apikey: string;
  };

  @ApiProperty({
    description: 'Configurações da instância',
    required: false
  })
  settings?: {
    readMessages: boolean;
    readStatus: boolean;
    alwaysOnline: boolean;
  };
}