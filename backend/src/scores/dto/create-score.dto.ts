import { IsIn, IsInt, Max, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { MIN_SECONDS_BY_SIZE, type BoardSize } from '../board-size';

export class CreateScoreDto {
  @ApiProperty({ enum: Object.keys(MIN_SECONDS_BY_SIZE), example: '9x9' })
  @IsIn(Object.keys(MIN_SECONDS_BY_SIZE))
  boardSize!: BoardSize;

  @ApiProperty({ type: 'integer', minimum: 1, maximum: 2_147_483_647, example: 61,
    description: 'Tempo final em segundos. Mínimos: 1 s no 9x9, 2 s no 16x16 e 3 s no 30x16.' })
  @IsInt()
  @Min(1)
  @Max(2_147_483_647) // Limite da coluna integer do PostgreSQL.
  timeSeconds!: number;
}
