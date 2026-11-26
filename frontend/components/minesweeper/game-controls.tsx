import { Flag, MousePointer2, RotateCcw, Volume2, VolumeX } from 'lucide-react';
import type { BoardSize } from '@/lib/minesweeper/board';
import { SizeSelector } from './size-selector';
import { Timer } from './timer';

export type Tool = 'reveal' | 'flag';

const tools = [
  { value: 'reveal', label: 'Revelar', icon: MousePointer2 },
  { value: 'flag', label: 'Marcar', icon: Flag },
] as const;

interface GameControlsProps {
  size: BoardSize;
  onSizeChange: (size: BoardSize) => void;
  startedAt: number | null;
  finishedAt: number | null;
  won: boolean;
  soundEnabled: boolean;
  onToggleSound: () => void;
  mines: number;
  tool: Tool;
  onToolChange: (tool: Tool) => void;
  onRestart: () => void;
}

const counter = 'flex min-h-11 min-w-20 items-center justify-center rounded-lg border border-slate-600 bg-midnight px-3 font-mono text-xl font-bold tabular-nums text-ivory';

export function GameControls({ size, onSizeChange, startedAt, finishedAt, won, mines, tool, onToolChange, onRestart, soundEnabled, onToggleSound }: GameControlsProps) {
  const SoundIcon = soundEnabled ? Volume2 : VolumeX;
  return (
    <div className="flex flex-wrap items-end justify-center gap-x-5 gap-y-3 rounded-2xl border border-slate-600/80 bg-slate-900/90 p-4 shadow-xl sm:justify-between">
      <SizeSelector size={size} onChange={onSizeChange} />
      <dl className="flex gap-3 text-center">
        <div>
          <dt className="mb-1 text-xs font-semibold text-slate-300">Tempo</dt>
          <dd className={counter} data-winning-time={won || undefined}><Timer startedAt={startedAt} finishedAt={finishedAt} /></dd>
        </div>
        <div>
          <dt className="mb-1 text-xs font-semibold text-slate-300">Minas restantes</dt>
          <dd className={counter} aria-live="polite" aria-label={`${mines} minas restantes`}>{mines.toLocaleString('pt-BR', { minimumIntegerDigits: 3 })}</dd>
        </div>
      </dl>
      <div role="group" aria-label="Ação ao tocar ou clicar" className="flex rounded-lg border border-slate-600 bg-midnight p-0.5">
        {tools.map(({ value, label, icon: Icon }) => (
          <button type="button" key={value} aria-pressed={value === tool} onClick={() => onToolChange(value)}
            className="flex min-h-11 cursor-pointer items-center gap-2 rounded-md border-0 px-3 text-sm font-semibold hover:bg-slate-700 focus-visible:outline-arcade-amber aria-pressed:bg-arcade-amber aria-pressed:text-midnight">
            <Icon aria-hidden="true" className="size-4" />{label}
          </button>
        ))}
      </div>
      <button type="button" onClick={onRestart} className="flex min-h-11 cursor-pointer items-center gap-2 rounded-lg border-slate-500 bg-slate-700 px-4 text-sm font-semibold hover:bg-slate-600 focus-visible:outline-arcade-amber">
        <RotateCcw aria-hidden="true" className="size-4" />Nova partida
      </button>
      <button type="button" aria-pressed={soundEnabled} onClick={onToggleSound}
        className="flex min-h-11 cursor-pointer items-center gap-2 rounded-lg border-slate-500 px-3 text-sm font-semibold hover:bg-slate-700 focus-visible:outline-arcade-amber aria-pressed:text-arcade-amber">
        <SoundIcon aria-hidden="true" className="size-4" />Som
      </button>
    </div>
  );
}
