import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DocumentationModule } from './modules/documentation/documentation.module';
import { appConfig } from './config/app.config';
import { EvolutionModule } from './modules/evolution/evolution.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig],
    }),
    DocumentationModule,
    EvolutionModule,
  ],
})
export class AppModule {}