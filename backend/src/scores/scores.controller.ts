import { Body, Controller, Post, Req } from '@nestjs/common';
import { CreateScoreDto } from './dto/create-score.dto';
import { ScoresService } from './scores.service';

@Controller('scores')
export class ScoresController {
  constructor(private readonly scores: ScoresService) {}

  @Post()
  create(@Req() request: { user: { id: string } }, @Body() input: CreateScoreDto) {
    return this.scores.create(request.user.id, input);
  }
}
