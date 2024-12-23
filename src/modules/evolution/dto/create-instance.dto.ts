import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional, IsUrl, IsBoolean } from 'class-validator';

export class CreateInstanceDto {
  @ApiProperty({
    description: 'Nome único da instância do WhatsApp',
    example: 'whatsapp-instance-1'
  })
  @IsNotEmpty()
  @IsString()
  instanceName: string;

  @ApiPropertyOptional({
    description: 'Número do WhatsApp com código do país',
    example: '5511999999999'
  })
  @IsOptional()
  @IsString()
  number?: string;

  @ApiPropertyOptional({
    description: 'URL para receber webhooks',
    example: 'https://seu-dominio.com/webhook'
  })
  @IsOptional()
  @IsUrl()
  webhookUrl?: string;

  @ApiPropertyOptional({
    description: 'Se deve marcar mensagens como lidas automaticamente',
    default: true
  })
  @IsOptional()
  @IsBoolean()
  readMessages?: boolean;

  @ApiPropertyOptional({
    description: 'Se deve manter o status sempre online',
    default: true
  })
  @IsOptional()
  @IsBoolean()
  alwaysOnline?: boolean;
}
