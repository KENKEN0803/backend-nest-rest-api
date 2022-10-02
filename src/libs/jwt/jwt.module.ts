import { JwtService } from './jwt.service';
import { DynamicModule, Global, Module } from '@nestjs/common';
import { CONFIG_OPTIIONS } from 'src/common/common.constatnt';
import { JwtModuleOption } from './jwt.interface';

@Module({})
@Global()
export class JwtModule {
  static forRoot(options: JwtModuleOption): DynamicModule {
    return {
      module: JwtModule,
      providers: [
        {
          provide: CONFIG_OPTIIONS,
          useValue: options,
        },
        JwtService,
      ],
      exports: [JwtService],
    };
  }
}
