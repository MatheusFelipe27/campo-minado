import { Controller, Get, Req } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  @Get('me')
  me(@Req() request: { user: Awaited<ReturnType<UsersService['upsert']>> }) {
    return request.user;
  }
}
