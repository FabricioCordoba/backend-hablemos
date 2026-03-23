import { App } from 'supertest/types';
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { getDatabaseConfig } from './config/datebase.config';
import {AppConfigModule} from './config/config.module';

@Module({
  imports: [AppConfigModule,
  TypeOrmModule.forRootAsync({
    inject: [ConfigService],
    useFactory: (configService: ConfigService) => getDatabaseConfig(configService),
  }),

],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
