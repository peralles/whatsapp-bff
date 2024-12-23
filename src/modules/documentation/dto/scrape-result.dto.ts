// src/modules/documentation/dto/scrape-result.dto.ts
export class ScrapeResultDto {
  success: boolean;
  message: string;
  processedLinks?: number;
  error?: string;
}