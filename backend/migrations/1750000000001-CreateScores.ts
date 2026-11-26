import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateScores1750000000001 implements MigrationInterface {
  async up(db: QueryRunner) {
    await db.query(`CREATE TABLE scores (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      board_size varchar(10) NOT NULL CHECK (board_size IN ('9x9', '16x16', '30x16')),
      time_seconds integer NOT NULL CHECK (time_seconds > 0),
      created_at timestamptz NOT NULL DEFAULT now()
    )`);
    await db.query('CREATE INDEX scores_board_size_time_idx ON scores (board_size, time_seconds)');
  }

  async down(db: QueryRunner) {
    await db.query('DROP TABLE scores');
  }
}
