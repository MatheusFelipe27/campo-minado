import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { isEmail } from 'class-validator';
import { UsersService } from '../users/users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(config: ConfigService, private readonly users: UsersService) {
    const secret = config.getOrThrow<string>('API_JWT_SECRET');
    if (Buffer.byteLength(secret) < 32) throw new Error('API_JWT_SECRET precisa de 32 bytes ou mais');
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: secret,
      algorithms: ['HS256'],
      issuer: 'campo-minado-web',
      audience: 'campo-minado-api',
      ignoreExpiration: false,
    });
  }

  validate(payload: Record<string, unknown>) {
    const { sub, provider, email, name, picture, exp } = payload;
    if (provider !== 'github' || typeof sub !== 'string' || !sub || sub.length > 255 ||
        typeof email !== 'string' || !isEmail(email) || email.length > 255 ||
        typeof name !== 'string' || !name.trim() || name.length > 255 ||
        typeof exp !== 'number' || (picture != null && typeof picture !== 'string')) {
      throw new UnauthorizedException();
    }
    return this.users.upsert({ provider, providerAccountId: sub, email, name, image: picture ?? null });
  }
}
