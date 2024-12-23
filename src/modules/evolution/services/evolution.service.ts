import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { CreateInstanceDto } from '../dto/create-instance.dto';
import { EvolutionInstanceDto } from '../dto/evolution-response.dto';

@Injectable()
export class EvolutionService {
  private baseUrl: string;
  private apiKey: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    // Inicialização lazy das configurações
    this.loadConfig();
  }

  private loadConfig() {
    if (!this.baseUrl || !this.apiKey) {
      this.baseUrl = this.configService.get<string>('EVOLUTION_API_BASE_URL');
      this.apiKey = this.configService.get<string>('EVOLUTION_API_KEY');
    }
  }

  private validateConfig() {
    if (!this.baseUrl || !this.apiKey) {
      throw new HttpException(
        'Evolution API configuration missing. Please check EVOLUTION_API_BASE_URL and EVOLUTION_API_KEY environment variables.',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async createInstance(createInstanceDto: CreateInstanceDto): Promise<EvolutionInstanceDto> {
    this.validateConfig();
    try {
      const { data } = await firstValueFrom(
        this.httpService.post<EvolutionInstanceDto>(
          `${this.baseUrl}/instance/create`,
          {
            ...createInstanceDto,
            qrcode: true,
            integration: 'WHATSAPP-BAILEYS',
          },
          {
            headers: {
              'Content-Type': 'application/json',
              apikey: this.apiKey,
            },
          },
        ),
      );

      return data;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      
      throw new HttpException(
        error.response?.data?.message || 'Failed to create Evolution API instance',
        error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async deleteInstance(instanceName: string): Promise<void> {
    this.validateConfig();
    try {
      await firstValueFrom(
        this.httpService.delete(`${this.baseUrl}/instance/delete/${instanceName}`, {
          headers: {
            apikey: this.apiKey,
          },
        }),
      );
    } catch (error) {
      if (error instanceof HttpException) throw error;
      
      throw new HttpException(
        error.response?.data?.message || 'Failed to delete instance',
        error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getInstanceStatus(instanceName: string): Promise<string> {
    this.validateConfig();
    try {
      const { data } = await firstValueFrom(
        this.httpService.get(`${this.baseUrl}/instance/connectionState/${instanceName}`, {
          headers: {
            apikey: this.apiKey,
          },
        }),
      );

      return data.state;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      
      throw new HttpException(
        error.response?.data?.message || 'Failed to get instance status',
        error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}