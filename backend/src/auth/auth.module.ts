import { ExecutionContext, Injectable, Module, SetMetadata } from '@nestjs/common';
import { APP_GUARD, Reflector } from '@nestjs/core';
import { AuthGuard, PassportModule } from '@nestjs/passport';
import { UsersModule } from '../users/users.module';
import { JwtStrategy } from './jwt.strategy';

export const Public = () => SetMetadata('public', true);

@Injectable()
class ApiGuard extends AuthGuard('jwt') {
  constructor(private readonly reflector: Reflector) { super(); }

  canActivate(context: ExecutionContext) {
    if (this.reflector.get<boolean>('public', context.getHandler())) return true;
    return super.canActivate(context);
  }
}

@Module({
  imports: [PassportModule, UsersModule],
  providers: [JwtStrategy, { provide: APP_GUARD, useClass: ApiGuard }],
})
export class AuthModule {}
