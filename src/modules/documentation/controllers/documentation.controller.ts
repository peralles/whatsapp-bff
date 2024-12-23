// src/modules/documentation/controllers/documentation.controller.ts
import { Controller, Post, Body } from '@nestjs/common';
import { DocScraperService } from '../services/doc-scraper.service';
import { ScrapeUrlDto } from '../dto/scrape-url.dto';
import { ScrapeResultDto } from '../dto/scrape-result.dto';

@Controller('documentation')
export class DocumentationController {
  constructor(private readonly docScraperService: DocScraperService) {}

  @Post('scrape')
  async scrapeDocumentation(@Body() scrapeUrlDto: ScrapeUrlDto): Promise<ScrapeResultDto> {
    return this.docScraperService.scrapeDocumentation(scrapeUrlDto.url);
  }
}