import { Controller, Get, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { UsersService } from './users.service';

@ApiTags('Usuário')
@ApiBearerAuth()
@ApiUnauthorizedResponse({ description: 'Token ausente, inválido ou expirado.' })
@Controller('users')
export class UsersController {
  @Get('me')
  @ApiOkResponse({
    description: 'Perfil da conta autenticada, cadastrada no primeiro acesso.',
    schema: {
      type: 'object', required: ['id', 'email', 'name', 'image'],
      properties: {
        id: { type: 'string', format: 'uuid' },
        email: { type: 'string', format: 'email' },
        name: { type: 'string', example: 'Ana' },
        image: { type: 'string', format: 'uri', nullable: true },
      },
    },
  })
  me(@Req() request: { user: Awaited<ReturnType<UsersService['upsert']>> }) {
    return request.user;
  }
}
