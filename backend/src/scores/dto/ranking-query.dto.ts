import { IsIn, IsOptional } from 'class-validator';
import { MIN_SECONDS_BY_SIZE, type BoardSize } from '../board-size';

export class RankingQueryDto {
  @IsOptional()
  @IsIn(Object.keys(MIN_SECONDS_BY_SIZE))
  boardSize?: BoardSize;
}
