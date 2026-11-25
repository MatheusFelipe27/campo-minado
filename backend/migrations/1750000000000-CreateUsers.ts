import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateUsers1750000000000 implements MigrationInterface {
  async up(db: QueryRunner) {
    await db.query(`CREATE TABLE users (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      email varchar(255) NOT NULL CONSTRAINT users_email_key UNIQUE,
      name varchar(255) NOT NULL,
      image text,
      provider varchar(20) NOT NULL CHECK (provider IN ('github', 'google')),
      provider_account_id varchar(255) NOT NULL,
      created_at timestamptz NOT NULL DEFAULT now(),
      UNIQUE (provider, provider_account_id)
    )`);
  }

  async down(db: QueryRunner) {
    await db.query('DROP TABLE users');
  }
}
