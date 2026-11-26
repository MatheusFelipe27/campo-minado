import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MIN_SECONDS_BY_SIZE } from './board-size';
import { CreateScoreDto } from './dto/create-score.dto';
import { Score } from './score.entity';

@Injectable()
export class ScoresService {
  constructor(@InjectRepository(Score) private readonly scores: Repository<Score>) {}

  create(userId: string, { boardSize, timeSeconds }: CreateScoreDto) {
    if (timeSeconds < MIN_SECONDS_BY_SIZE[boardSize]) {
      throw new BadRequestException('Tempo incompatível com o tamanho do campo');
    }
    return this.scores.save(this.scores.create({ userId, boardSize, timeSeconds }));
  }
}
