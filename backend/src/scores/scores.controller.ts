import { Body, Controller, Get, Post, Query, Req } from '@nestjs/common';
import { CreateScoreDto } from './dto/create-score.dto';
import { RankingQueryDto } from './dto/ranking-query.dto';
import { ScoresService } from './scores.service';
import { ApiBadRequestResponse, ApiBearerAuth, ApiCreatedResponse, ApiOkResponse, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { RankingEntryDto, SavedScoreDto } from './dto/score-response.dto';

@ApiTags('Pontuações')
@ApiBearerAuth()
@ApiUnauthorizedResponse({ description: 'Token ausente, inválido ou expirado.' })
@Controller('scores')
export class ScoresController {
  constructor(private readonly scores: ScoresService) {}

  @Get('ranking')
  @ApiOkResponse({ type: [RankingEntryDto], description: 'Até 30 pontuações por menor tempo, após aplicar o filtro.' })
  @ApiBadRequestResponse({ description: 'Filtro inválido.' })
  ranking(@Query() query: RankingQueryDto) {
    return this.scores.ranking(query.boardSize);
  }

  @Post()
  @ApiCreatedResponse({ type: SavedScoreDto, description: 'Vitória registrada para o jogador do token.' })
  @ApiBadRequestResponse({ description: 'Corpo inválido ou tempo abaixo do mínimo da dificuldade.' })
  create(@Req() request: { user: { id: string } }, @Body() input: CreateScoreDto) {
    return this.scores.create(request.user.id, input);
  }
}
