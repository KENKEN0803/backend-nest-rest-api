import { JwtModuleOption } from './jwt.interface';
import { Inject, Injectable } from '@nestjs/common';
import { CONFIG_OPTIIONS } from 'src/common/common.constatnt';
import * as jwt from 'jsonwebtoken';
@Injectable()
export class JwtService {
  constructor(
    @Inject(CONFIG_OPTIIONS) private readonly options: JwtModuleOption,
  ) {}

  sign(payload: object): string {
    return jwt.sign(payload, this.options.jwtPrivateKey, {
      expiresIn: this.options.jwtExpiresSec,
    });
  }

  refreshSign(payload: object): string {
    return jwt.sign(payload, this.options.jwtPrivateKey, {
      expiresIn: this.options.refreshExpiresSec,
    });
  }

  verify(token: string) {
    return jwt.verify(token, this.options.jwtPrivateKey);
  }
}
