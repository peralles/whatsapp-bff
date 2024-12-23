import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DocumentationModule } from './modules/documentation/documentation.module';
import { appConfig } from './config/app.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig],
    }),
    DocumentationModule,
  ],
})
export class AppModule {}