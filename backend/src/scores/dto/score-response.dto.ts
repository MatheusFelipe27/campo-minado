import { ApiProperty } from '@nestjs/swagger';
import { CreateScoreDto } from './create-score.dto';

class TimedScoreDto extends CreateScoreDto {
  @ApiProperty({ type: 'string', format: 'date-time' })
  createdAt!: Date;
}

export class SavedScoreDto extends TimedScoreDto {
  @ApiProperty({ type: 'string', format: 'uuid' })
  id!: string;

  @ApiProperty({ type: 'string', format: 'uuid' })
  userId!: string;
}

export class RankingEntryDto extends TimedScoreDto {
  @ApiProperty({ example: 'Ana' })
  userName!: string;

  @ApiProperty({ type: 'string', format: 'uri', nullable: true })
  userImage!: string | null;
}
