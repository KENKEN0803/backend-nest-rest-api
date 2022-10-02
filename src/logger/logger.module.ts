import { DynamicModule, Global, Module } from '@nestjs/common';
import { LoggerService } from './logger.service';

@Module({})
@Global()
export class LoggerModule {
  static forRoot(): DynamicModule {
    return {
      module: LoggerModule,
      providers: [LoggerService],
      exports: [LoggerService],
    };
  }
}
