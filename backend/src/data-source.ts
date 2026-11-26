import 'reflect-metadata';
import 'dotenv/config';
import { DataSource } from 'typeorm';
import { User } from './users/user.entity';
import { Score } from './scores/score.entity';
import { CreateScores1750000000001 } from '../migrations/1750000000001-CreateScores';
import { CreateUsers1750000000000 } from '../migrations/1750000000000-CreateUsers';

if (!process.env.DATABASE_URL) throw new Error('Configure DATABASE_URL');
export const databaseOptions = {
  type: 'postgres' as const,
  url: process.env.DATABASE_URL,
  entities: [User, Score],
  migrations: [CreateUsers1750000000000, CreateScores1750000000001],
  synchronize: false,
};
export default new DataSource(databaseOptions);
