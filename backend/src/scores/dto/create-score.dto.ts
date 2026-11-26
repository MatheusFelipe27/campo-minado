import { IsIn, IsInt, Max, Min } from 'class-validator';
import { MIN_SECONDS_BY_SIZE, type BoardSize } from '../board-size';

export class CreateScoreDto {
  @IsIn(Object.keys(MIN_SECONDS_BY_SIZE))
  boardSize!: BoardSize;

  @IsInt()
  @Min(1)
  @Max(2_147_483_647) // Limite da coluna integer do PostgreSQL.
  timeSeconds!: number;
}
