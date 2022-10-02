import { CONFIG_OPTIIONS } from '../../common/common.constatnt';
import { DynamicModule, Global, Module } from '@nestjs/common';
import { LoggerModuleOptions } from './logger.interface';
import { LoggerService } from './logger.service';

@Module({})
@Global()
export class LoggerModule {
  static forRoot(options: LoggerModuleOptions): DynamicModule {
    return {
      module: LoggerModule,
      providers: [
        {
          provide: CONFIG_OPTIIONS,
          useValue: options,
        },
        LoggerService,
      ],
      exports: [LoggerService],
    };
  }
}
