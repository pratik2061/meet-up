import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import type { Request } from 'express';
import { TokenPayLoad } from 'src/types/tokenPayload';

function fromCookies(req: Request): string | null {
  const token = req?.cookies?.['token'] as undefined;
  return token || null;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([fromCookies]),
      ignoreExpiration: false,
      secretOrKey: config.get<string>('ACCESS_SECRET')!,
      passReqToCallback: false,
    });
  }

  validate(payload: TokenPayLoad) {
    return payload;
  }
}
