import { useEffect, useState } from 'react';
import { elapsedSeconds } from '@/lib/minesweeper/game';

export function Timer({ startedAt, finishedAt }: { startedAt: number | null; finishedAt: number | null }) {
  const [now, setNow] = useState(0);

  useEffect(() => {
    if (startedAt === null || finishedAt !== null) return;
    const interval = window.setInterval(() => setNow(performance.now()), 250);
    return () => window.clearInterval(interval);
  }, [startedAt, finishedAt]);

  const seconds = elapsedSeconds(startedAt, finishedAt ?? now);
  const minutes = Math.floor(seconds / 60);
  return <span role="timer">{String(minutes).padStart(2, '0')}:{String(seconds % 60).padStart(2, '0')}</span>;
}
