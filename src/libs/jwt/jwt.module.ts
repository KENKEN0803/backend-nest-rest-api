import { JwtService } from './jwt.service';
import { DynamicModule, Global, Module } from '@nestjs/common';
import { CONFIG_OPTIONS } from 'src/common/common.constants';
import { JwtModuleOption } from './jwt.interface';

@Module({})
@Global()
export class JwtModule {
  static forRoot(options: JwtModuleOption): DynamicModule {
    return {
      module: JwtModule,
      providers: [
        {
          provide: CONFIG_OPTIONS,
          useValue: options,
        },
        JwtService,
      ],
      exports: [JwtService],
    };
  }
}
