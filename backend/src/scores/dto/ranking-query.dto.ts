import { IsIn, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { MIN_SECONDS_BY_SIZE, type BoardSize } from '../board-size';

export class RankingQueryDto {
  @ApiPropertyOptional({ enum: Object.keys(MIN_SECONDS_BY_SIZE), description: 'Omita para consultar todos os tamanhos.' })
  @IsOptional()
  @IsIn(Object.keys(MIN_SECONDS_BY_SIZE))
  boardSize?: BoardSize;
}
