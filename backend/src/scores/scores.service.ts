import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MIN_SECONDS_BY_SIZE, type BoardSize } from './board-size';
import { CreateScoreDto } from './dto/create-score.dto';
import { Score } from './score.entity';

interface RankingEntry {
  userName: string;
  userImage: string | null;
  boardSize: BoardSize;
  timeSeconds: number;
  createdAt: Date;
}

@Injectable()
export class ScoresService {
  constructor(@InjectRepository(Score) private readonly scores: Repository<Score>) {}

  ranking(boardSize?: BoardSize): Promise<RankingEntry[]> {
    const query = this.scores.createQueryBuilder('score')
      .innerJoin('score.user', 'player')
      .select('player.name', 'userName')
      .addSelect('player.image', 'userImage')
      .addSelect('score.boardSize', 'boardSize')
      .addSelect('score.timeSeconds', 'timeSeconds')
      .addSelect('score.createdAt', 'createdAt');

    if (boardSize !== undefined) {
      query.where('score.boardSize = :boardSize', { boardSize });
    }

    return query.orderBy('score.timeSeconds', 'ASC')
      .addOrderBy('score.createdAt', 'ASC')
      .addOrderBy('score.id', 'ASC')
      .limit(30)
      .getRawMany<RankingEntry>();
  }

  create(userId: string, { boardSize, timeSeconds }: CreateScoreDto) {
    if (timeSeconds < MIN_SECONDS_BY_SIZE[boardSize]) {
      throw new BadRequestException('Tempo incompatível com o tamanho do campo');
    }
    return this.scores.save(this.scores.create({ userId, boardSize, timeSeconds }));
  }
}
