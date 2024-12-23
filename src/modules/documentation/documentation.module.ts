// src/modules/documentation/documentation.module.ts
import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { DocScraperService } from './services/doc-scraper.service';
import { DocumentationController } from './controllers/documentation.controller';

@Module({
  imports: [HttpModule],
  controllers: [DocumentationController],
  providers: [DocScraperService],
  exports: [DocScraperService],
})
export class DocumentationModule {}