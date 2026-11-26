import { Body, Controller, Get, Post, Query, Req } from '@nestjs/common';
import { CreateScoreDto } from './dto/create-score.dto';
import { RankingQueryDto } from './dto/ranking-query.dto';
import { ScoresService } from './scores.service';

@Controller('scores')
export class ScoresController {
  constructor(private readonly scores: ScoresService) {}

  @Get('ranking')
  ranking(@Query() query: RankingQueryDto) {
    return this.scores.ranking(query.boardSize);
  }

  @Post()
  create(@Req() request: { user: { id: string } }, @Body() input: CreateScoreDto) {
    return this.scores.create(request.user.id, input);
  }
}
