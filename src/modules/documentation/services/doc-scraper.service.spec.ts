import { Test, TestingModule } from '@nestjs/testing';
import { DocScraperService } from './doc-scraper.service';

describe('DocScraperService', () => {
  let service: DocScraperService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DocScraperService],
    }).compile();

    service = module.get<DocScraperService>(DocScraperService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
