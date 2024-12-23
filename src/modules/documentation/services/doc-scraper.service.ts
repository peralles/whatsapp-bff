// src/modules/documentation/services/doc-scraper.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import * as fs from 'fs/promises';
import * as path from 'path';
import { firstValueFrom } from 'rxjs';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class DocScraperService {
  private readonly logger = new Logger(DocScraperService.name);
  private readonly docsDir = path.join(process.cwd(), 'docs');
  private readonly jinaBaseUrl = 'https://r.jina.ai/';
  private readonly headers: Record<string, string>;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.createDocsDirectory();
    this.headers = {
      'Authorization': `Bearer ${this.configService.get<string>('JINA_API_TOKEN')}`,
      'Accept': '*/*',
      'User-Agent': 'Mozilla/5.0 (compatible; DocumentationBot/1.0)'
    };
  }

  private async createDocsDirectory(): Promise<void> {
    try {
      await fs.mkdir(this.docsDir, { recursive: true });
    } catch (error) {
      this.logger.error('Error creating docs directory:', error);
      throw error;
    }
  }

  private async fetchWithRetry(url: string, retries = 3, delay = 2000): Promise<any> {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const fullUrl = url.startsWith('http') ? `${this.jinaBaseUrl}${encodeURIComponent(url)}` : url;
        this.logger.debug(`Fetching URL: ${fullUrl}`);
        
        const response = await firstValueFrom(
          this.httpService.get(fullUrl, { headers: this.headers })
        );

        this.logger.debug(`Response data: ${JSON.stringify(response.data, null, 2)}`);
        
        return response.data;
      } catch (error) {
        this.logger.warn(`Attempt ${attempt} failed for ${url}: ${error.message}`);
        if (attempt === retries) throw error;
        await new Promise(resolve => setTimeout(resolve, delay * attempt));
      }
    }
  }

  private async saveMarkdown(filename: string, content: string): Promise<void> {
    const filePath = path.join(this.docsDir, `${filename}.md`);
    try {
      await fs.writeFile(filePath, content, 'utf8');
      this.logger.log(`Saved markdown file: ${filePath}`);
    } catch (error) {
      this.logger.error(`Error saving markdown file ${filePath}:`, error);
      throw error;
    }
  }

  private sanitizeFilename(url: string): string {
    try {
      const urlObj = new URL(url);
      return urlObj.pathname
        .replace(/^\//, '')
        .replace(/[^a-z0-9-]/gi, '_')
        .toLowerCase();
    } catch (error) {
      return url
        .replace(/^\//, '')
        .replace(/[^a-z0-9-]/gi, '_')
        .toLowerCase();
    }
  }

  private extractLinksFromContent(content: unknown): string[] {
    if (typeof content === 'string') {
      try {
        content = JSON.parse(content);
      } catch (e) {
        this.logger.warn('Content is not JSON parseable:', e.message);
      }
    }

    if (typeof content === 'string') {
      const matches = content.match(/https?:\/\/[^\s")]+/g) || [];
      return matches.filter(link => link.includes('doc.'));
    }

    if (Array.isArray(content)) {
      return content
        .filter((item): item is string => typeof item === 'string')
        .filter(item => item.includes('doc.'));
    }

    if (typeof content === 'object' && content !== null) {
      const allValues = Object.values(content).flat();
      return allValues
        .filter((value): value is string => typeof value === 'string')
        .filter(value => value.includes('doc.'));
    }

    return [];
  }

  public async scrapeDocumentation(scrapeUrl: string): Promise<{
    success: boolean;
    message: string;
    processedLinks?: number;
    error?: string;
  }> {
    try {
      const initialResponse = await this.fetchWithRetry(scrapeUrl);
      
      const links = this.extractLinksFromContent(initialResponse);
      this.logger.log(`Found ${links.length} links to process:`, links);

      if (links.length === 0) {
        return {
          success: false,
          message: 'No links found in the initial response',
          processedLinks: 0
        };
      }

      let processedCount = 0;
      for (const link of links) {
        try {
          this.logger.log(`Processing link: ${link}`);
          
          const markdownContent = await this.fetchWithRetry(link);
          if (!markdownContent) {
            this.logger.warn(`No content received for ${link}`);
            continue;
          }

          const contentToSave = typeof markdownContent === 'string' 
            ? markdownContent 
            : JSON.stringify(markdownContent, null, 2);

          const filename = this.sanitizeFilename(link);
          await this.saveMarkdown(filename, contentToSave);
          
          processedCount++;
          await new Promise(resolve => setTimeout(resolve, 2000));
        } catch (error) {
          this.logger.error(`Failed to process link ${link}:`, error.message);
          continue;
        }
      }

      return {
        success: true,
        message: 'Documentation scraping completed successfully',
        processedLinks: processedCount
      };
    } catch (error) {
      this.logger.error('Error during documentation scraping:', error);
      return {
        success: false,
        message: 'Failed to scrape documentation',
        processedLinks: 0,
        error: error.message
      };
    }
  }
}