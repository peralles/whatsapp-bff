import { IsNotEmpty, IsUrl } from 'class-validator';

export class ScrapeUrlDto {
  @IsNotEmpty()
  @IsUrl({}, { message: 'A URL de scraping deve ser uma URL válida' })
  url: string;
}