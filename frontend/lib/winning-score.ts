import { saveScore } from './api';
import { elapsedSeconds, type Game } from './minesweeper/game';

export function submitWinningMove(previous: Game, next: Game): Promise<void> | null {
  if (previous.status === 'won' || next.status !== 'won' || next.finishedAt === null) return null;
  const seconds = Math.max(1, elapsedSeconds(next.startedAt, next.finishedAt));
  return saveScore(next.size, seconds);
}
