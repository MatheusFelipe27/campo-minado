import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from '../users/user.entity';
import type { BoardSize } from './board-size';

@Entity('scores')
@Index('scores_board_size_time_idx', ['boardSize', 'timeSeconds'])
export class Score {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @Column({ name: 'user_id', type: 'uuid' }) userId!: string;
  @ManyToOne(() => User, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @Column({ name: 'board_size', type: 'varchar', length: 10 }) boardSize!: BoardSize;
  @Column({ name: 'time_seconds', type: 'integer' }) timeSeconds!: number;
  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' }) createdAt!: Date;
}
