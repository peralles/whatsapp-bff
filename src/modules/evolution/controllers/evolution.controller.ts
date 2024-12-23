import { 
  Controller, 
  Post, 
  Delete, 
  Get, 
  Body, 
  Param,
  HttpCode,
  HttpStatus 
} from '@nestjs/common';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiParam,
  ApiBearerAuth 
} from '@nestjs/swagger';
import { EvolutionService } from '../services/evolution.service';
import { CreateInstanceDto } from '../dto/create-instance.dto';
import { EvolutionInstanceDto } from '../dto/evolution-response.dto';

@ApiTags('evolution')
@ApiBearerAuth()
@Controller('evolution')
export class EvolutionController {
  constructor(private readonly evolutionService: EvolutionService) {}

  @Post('instances')
  @ApiOperation({ summary: 'Criar nova instância do WhatsApp' })
  @ApiResponse({ 
    status: 201, 
    description: 'Instância criada com sucesso',
    type: EvolutionInstanceDto
  })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @HttpCode(HttpStatus.CREATED)
  async createInstance(
    @Body() createInstanceDto: CreateInstanceDto,
  ): Promise<EvolutionInstanceDto> {
    return this.evolutionService.createInstance(createInstanceDto);
  }

  @Delete('instances/:instanceName')
  @ApiOperation({ summary: 'Deletar uma instância do WhatsApp' })
  @ApiParam({ 
    name: 'instanceName', 
    description: 'Nome da instância a ser deletada'
  })
  @ApiResponse({ status: 204, description: 'Instância deletada com sucesso' })
  @ApiResponse({ status: 404, description: 'Instância não encontrada' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteInstance(@Param('instanceName') instanceName: string): Promise<void> {
    return this.evolutionService.deleteInstance(instanceName);
  }

  @Get('instances/:instanceName/status')
  @ApiOperation({ summary: 'Verificar status de uma instância' })
  @ApiParam({ 
    name: 'instanceName', 
    description: 'Nome da instância'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Status retornado com sucesso',
    schema: {
      type: 'string',
      example: 'CONNECTED'
    }
  })
  @ApiResponse({ status: 404, description: 'Instância não encontrada' })
  async getInstanceStatus(@Param('instanceName') instanceName: string): Promise<string> {
    return this.evolutionService.getInstanceStatus(instanceName);
  }
}